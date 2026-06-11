import { getDb } from "@/lib/db/drizzle";
import { foods, items, registerLogs, stockLogs, stores } from "@/lib/db/schema";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

type ExportType = "accounting" | "inventory";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const MAX_EXPORT_ROWS = 5000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim();
}

function csvEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  if (/[\n\r",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildCsv(lines: Array<Array<string | number | null | undefined>>) {
  const rows = lines.map((line) => line.map(csvEscape).join(","));
  return `\ufeff${rows.join("\r\n")}`;
}

function encodeCsv(csv: string) {
  return new TextEncoder().encode(csv);
}

function parseDateParam(value: string | null, mode: "from" | "to") {
  if (!value) {
    return null;
  }

  if (value.length <= 10) {
    const [year, month, day] = value.split("-").map((part) => Number(part));
    if (!year || !month || !day) {
      return null;
    }

    const hours = mode === "to" ? 23 : 0;
    const minutes = mode === "to" ? 59 : 0;
    const seconds = mode === "to" ? 59 : 0;
    const ms = mode === "to" ? 999 : 0;
    return new Date(
      Date.UTC(year, month - 1, day, hours, minutes, seconds, ms),
    );
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

type RouteContext = {
  params: Promise<{ event_id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const event_id = params?.event_id;
  if (!event_id) {
    return new Response("Event id is required.", { status: 400 });
  }

  const exportType = request.nextUrl.searchParams.get(
    "type",
  ) as ExportType | null;

  if (!exportType || !["accounting", "inventory"].includes(exportType)) {
    return new Response("Invalid export type.", { status: 400 });
  }

  const session = await getSessionFromRequestHeaders();
  const userId = session?.user?.id;

  if (!userId) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const rateLimitKey = `${userId}:${event_id}:${exportType}`;
  if (isRateLimited(rateLimitKey)) {
    return new Response("Rate limit exceeded.", { status: 429 });
  }

  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const fromDate = parseDateParam(fromParam, "from");
  const toDate = parseDateParam(toParam, "to");

  if ((fromParam && !fromDate) || (toParam && !toDate)) {
    return new Response("Invalid date range.", { status: 400 });
  }

  const db = await getDb();
  const dateLabel = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileBaseName = `export-event-${event_id}-${exportType}-${dateLabel}.csv`;

  if (exportType === "accounting") {
    const registerFilters = [eq(stores.eventId, event_id)];
    if (fromDate) {
      registerFilters.push(gte(registerLogs.createdAt, fromDate));
    }
    if (toDate) {
      registerFilters.push(lte(registerLogs.createdAt, toDate));
    }

    const registerCountRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(registerLogs)
      .leftJoin(foods, eq(foods.id, registerLogs.foodId))
      .leftJoin(stores, eq(stores.id, foods.storeId))
      .where(and(...registerFilters));

    if ((registerCountRows[0]?.count ?? 0) > MAX_EXPORT_ROWS) {
      return new Response("Too many rows. Narrow the date range.", {
        status: 413,
      });
    }

    const rows = await db
      .select({
        id: registerLogs.id,
        totalAmount: registerLogs.totalAmount,
        amountPaid: registerLogs.amountPaid,
        meta: registerLogs.meta,
        createdAt: registerLogs.createdAt,
        storeName: stores.name,
      })
      .from(registerLogs)
      .leftJoin(foods, eq(foods.id, registerLogs.foodId))
      .leftJoin(stores, eq(stores.id, foods.storeId))
      .where(and(...registerFilters))
      .orderBy(asc(registerLogs.createdAt));

    const csv = buildCsv([
      ["会計ID", "店舗名", "記録日時", "合計金額", "受取金額", "お釣り", "メモ"],
      ...rows.map((row) => [
        row.id,
        row.storeName ?? "レーン会計",
        row.createdAt.toISOString(),
        row.totalAmount,
        row.amountPaid,
        row.amountPaid - row.totalAmount,
        row.meta ?? "",
      ]),
    ]);

    return new Response(encodeCsv(csv), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBaseName}"; filename*=UTF-8''${encodeURIComponent(
          fileBaseName,
        )}`,
        "Cache-Control": "no-store",
      },
    });
  }

  const stockFilters = [eq(stores.eventId, event_id)];
  if (fromDate) {
    stockFilters.push(gte(stockLogs.createdAt, fromDate));
  }
  if (toDate) {
    stockFilters.push(lte(stockLogs.createdAt, toDate));
  }

  const stockCountRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(stockLogs)
    .innerJoin(items, eq(items.id, stockLogs.itemId))
    .innerJoin(foods, eq(foods.id, items.foodId))
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(and(...stockFilters));

  if ((stockCountRows[0]?.count ?? 0) > MAX_EXPORT_ROWS) {
    return new Response("Too many rows. Narrow the date range.", {
      status: 413,
    });
  }

  const rows = await db
    .select({
      id: stockLogs.id,
      itemName: items.name,
      difference: stockLogs.difference,
      meta: stockLogs.meta,
      createdAt: stockLogs.createdAt,
      storeName: stores.name,
    })
    .from(stockLogs)
    .innerJoin(items, eq(items.id, stockLogs.itemId))
    .innerJoin(foods, eq(foods.id, items.foodId))
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(and(...stockFilters))
    .orderBy(asc(stockLogs.createdAt));

  const csv = buildCsv([
    ["変動ID", "店舗名", "記録日時", "商品名", "変動数", "メモ"],
    ...rows.map((row) => [
      row.id,
      row.storeName ?? "",
      row.createdAt.toISOString(),
      row.itemName,
      row.difference,
      row.meta ?? "",
    ]),
  ]);

  return new Response(encodeCsv(csv), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileBaseName}"; filename*=UTF-8''${encodeURIComponent(
        fileBaseName,
      )}`,
      "Cache-Control": "no-store",
    },
  });
}