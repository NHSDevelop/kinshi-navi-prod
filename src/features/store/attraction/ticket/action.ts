"use server";

import { canStaffOrManageStore, getAuthenticatedUser } from "@/lib/auth-guard";
import { z } from "zod";
import {
  attractions,
  events,
  pushSubscriptions,
  stores,
  tickets,
  type TicketStatus,
} from "@/lib/db/schema";
import { and, asc, eq, gt, inArray, lte, sql } from "drizzle-orm";
import { sendPushNotification } from "@/features/push/action";
import { getDb } from "@/lib/db/drizzle";
import { revalidatePath } from "next/cache";

const RegisterSchema = z.object({
  numberOfPeople: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "1以上である必要があります"),
});

export type ZodErrors = {
  numberOfPeople?: string[];
  count?: string[];
} | null;

export type TicketState = {
  numberOfPeople?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
  issuedNumber?: number;
};

export type CallTicketState = {
  count?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

async function getStoreIdByAttractionId(attractionId: string) {
  const db = await getDb();
  const attractionRows = await db
    .select({ storeId: attractions.storeId })
    .from(attractions)
    .where(eq(attractions.id, attractionId))
    .limit(1);

  return attractionRows[0]?.storeId ?? null;
}

async function canManageAttraction(attractionId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const storeId = await getStoreIdByAttractionId(attractionId);
  if (!storeId) {
    return null;
  }

  const allowed = await canStaffOrManageStore(user.id, storeId);
  return allowed ? { user, storeId } : null;
}

function invalidateTicketPages(storeId: string) {
  revalidatePath(`/dashboard/staff/store/${storeId}`);
  revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
  revalidatePath(`/dashboard/staff/store/${storeId}/complete-ticket`);
  revalidatePath(`/dashboard/staff/store/${storeId}/ticket-list`);
  revalidatePath(`/dashboard/staff/store/${storeId}/show-status`);
  revalidatePath(`/dashboard/admin/store/${storeId}`);
  revalidatePath("/attraction/waiting-status");
}

export async function createTicket(
  isPaper: boolean,
  prevState: unknown,
  formData: FormData,
): Promise<TicketState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      numberOfPeople: (formData.get("numberOfPeople") as string) || "",
      zodErrors: null,
      message: "ログインが必要です。",
      success: false,
    };
  }

  const validationResult = RegisterSchema.safeParse({
    numberOfPeople: formData.get("numberOfPeople"),
  });

  if (!validationResult.success) {
    return {
      numberOfPeople: (formData.get("numberOfPeople") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { numberOfPeople } = validationResult.data;
  const storeId = formData.get("storeId") as string;

  try {
    const db = await getDb();
    const attractionRows = await db
      .select({ id: attractions.id, isActive: stores.isActive })
      .from(attractions)
      .innerJoin(stores, eq(attractions.storeId, stores.id))
      .where(eq(attractions.storeId, storeId))
      .limit(1);
    const attraction = attractionRows[0];

    if (!attraction) {
      return {
        zodErrors: null,
        success: false,
        message: "企画が存在しません。",
      };
    }

    if (!attraction.isActive) {
      return {
        zodErrors: null,
        success: false,
        message: "停止中のためチケットを発行できません。",
      };
    }

    const userTicketRows = await db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.userId, user.id),
          eq(tickets.status, "ISSUED"),
          eq(tickets.isPaper, false),
        ),
      );
    if (!isPaper && userTicketRows.length >= 1) {
      return {
        zodErrors: null,
        success: false,
        message: "ゲストユーザーが同時に取得できるチケットは1枚までです",
      };
    }
    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(eq(tickets.attractionId, attraction.id));

    const ticketCount: number = Number(countRows[0]?.count ?? 0);

    const nextIndex: number = ticketCount + 1;

    await db.insert(tickets).values({
      index: nextIndex,
      numberOfPeople: numberOfPeople,
      status: "ISSUED",
      attractionId: attraction.id,
      userId: user.id,
      isPaper: isPaper,
    });

    invalidateTicketPages(storeId);

    return {
      zodErrors: null,
      message: "チケットの発行が完了しました。",
      success: true,
      issuedNumber: nextIndex,
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}

export async function disableAttractionTickets(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false as const, message: "ログインが必要です" };
    }

    const storeId = formData.get("storeId") as string;
    if (!storeId || !(await canStaffOrManageStore(user.id, storeId))) {
      return { success: false as const, message: "権限がありません" };
    }

    const db = await getDb();
    const attractionRows = await db
      .select({ id: attractions.id })
      .from(attractions)
      .where(eq(attractions.storeId, storeId))
      .limit(1);
    const attraction = attractionRows[0];

    if (!attraction) {
      return { success: false as const, message: "企画が存在しません" };
    }

    const targetRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.attractionId, attraction.id),
          inArray(tickets.status, ["ISSUED", "CALLED"]),
        ),
      );

    const targetCount = Number(targetRows[0]?.count ?? 0);
    if (targetCount === 0) {
      invalidateTicketPages(storeId);
      return {
        success: true as const,
        message: "無効化するチケットはありません。",
        count: 0,
      };
    }

    await db
      .update(tickets)
      .set({ status: "DISABLED" })
      .where(
        and(
          eq(tickets.attractionId, attraction.id),
          inArray(tickets.status, ["ISSUED", "CALLED"]),
        ),
      );

    invalidateTicketPages(storeId);

    return {
      success: true as const,
      message: `${targetCount}件のチケットを無効化しました。`,
      count: targetCount,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false as const,
      message: "サーバーエラーが発生しました",
    };
  }
}

const CallFirstTicketSchema = z.object({
  count: z.coerce
    .number()
    .int("整数である必要があります")
    .positive("正の数である必要があります"),
});
export async function callFirstTicket(
  attractionId: string,
  prevState: unknown,
  formData: FormData,
): Promise<CallTicketState> {
  const access = await canManageAttraction(attractionId);
  if (!access) {
    return {
      count: (formData.get("count") as string) || "",
      zodErrors: null,
      message: "権限がありません。",
      success: false,
    };
  }

  const validationResult = CallFirstTicketSchema.safeParse({
    count: formData.get("count"),
  });

  if (!validationResult.success) {
    return {
      count: (formData.get("count") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { count } = validationResult.data;
  try {
    const db = await getDb();
    const issuedCountRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.attractionId, attractionId),
          eq(tickets.status, "ISSUED"),
        ),
      );

    const issuedCount = Number(issuedCountRows[0]?.count ?? 0);
    const limitedCount = Math.min(count, issuedCount);
    if (limitedCount === 0) {
      return {
        zodErrors: null,
        message: "呼び出すチケットがありません。",
        success: false,
      };
    }
    const issuedTickets = await db
      .select({
        id: tickets.id,
        userId: tickets.userId,
        index: tickets.index,
        isPaper: tickets.isPaper,
      })
      .from(tickets)
      .innerJoin(attractions, eq(tickets.attractionId, attractions.id))
      .innerJoin(stores, eq(attractions.storeId, stores.id))
      .innerJoin(events, eq(stores.eventId, events.id))
      .where(
        and(
          eq(tickets.attractionId, attractionId),
          eq(tickets.status, "ISSUED"),
        ),
      )
      .orderBy(asc(tickets.index))
      .limit(limitedCount);

    const ids = issuedTickets.map((t) => t.id);
    if (ids.length === 0) {
      return {
        zodErrors: null,
        message: "呼び出すチケットがありません。",
        success: false,
      };
    }

    await db
      .update(tickets)
      .set({ status: "CALLED" })
      .where(inArray(tickets.id, ids));

    invalidateTicketPages(access.storeId);

    const digitalTickets = issuedTickets.filter((ticket) => !ticket.isPaper);
    const userIds = Array.from(
      new Set(digitalTickets.map((ticket) => ticket.userId)),
    );
    const subscriptionRows =
      userIds.length > 0
        ? await db
            .select()
            .from(pushSubscriptions)
            .where(inArray(pushSubscriptions.userId, userIds))
        : [];

    const subscriptionByUserId = new Map(
      subscriptionRows.map((sub) => [sub.userId, sub]),
    );

    for (const ticket of digitalTickets) {
      const sub = subscriptionByUserId.get(ticket.userId);
      if (!sub) {
        continue;
      }
      await sendPushNotification(
        sub,
        "チケットが呼び出されました",
        `あなたのチケット（番号: ${ticket.index}）が呼び出されました。企画へお越しください。`,
        `/anonymous-user/`,
      );
    }

    if (ids.length === 0) {
      return {
        zodErrors: null,
        message: "呼び出すチケットがありません。",
        success: false,
      };
    }

    return {
      zodErrors: null,
      message: `${ids.length}件のチケットを呼び出しました。`,
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}

export async function completeTicket(ticketId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false as const, message: "ログインが必要です" };
    }

    const db = await getDb();
    const fetchedRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);
    const fetchedTicket = fetchedRows[0];

    if (!fetchedTicket) {
      return { success: false as const, message: "チケットが存在しません" };
    }

    const storeRows = await db
      .select({ storeId: attractions.storeId })
      .from(attractions)
      .innerJoin(stores, eq(attractions.storeId, stores.id))
      .where(eq(attractions.id, fetchedTicket.attractionId))
      .limit(1);
    const storeId = storeRows[0]?.storeId;
    if (!storeId || !(await canStaffOrManageStore(user.id, storeId))) {
      return { success: false as const, message: "権限がありません" };
    }

    if (fetchedTicket.status != "CALLED") {
      return {
        success: false as const,
        message: "チケットは呼び出されていません",
      };
    }
    await db
      .update(tickets)
      .set({ status: "COMPLETED" })
      .where(eq(tickets.id, ticketId));

    await db
      .update(tickets)
      .set({ status: "CALLED" })
      .where(
        and(
          eq(tickets.attractionId, fetchedTicket.attractionId),
          eq(tickets.status, "ISSUED"),
          gt(tickets.index, fetchedTicket.index),
          lte(tickets.index, fetchedTicket.index + 3),
        ),
      );

    invalidateTicketPages(storeId);

    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました。",
    };
  }
}

export async function cancelTicket(ticketId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false as const, message: "ログインが必要です" };
    }

    const db = await getDb();
    const fetchedRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);
    const fetchedTicket = fetchedRows[0];

    if (!fetchedTicket) {
      return { success: false as const, message: "チケットが存在しません" };
    }

    const storeRows = await db
      .select({ storeId: attractions.storeId })
      .from(attractions)
      .innerJoin(stores, eq(attractions.storeId, stores.id))
      .where(eq(attractions.id, fetchedTicket.attractionId))
      .limit(1);
    const storeId = storeRows[0]?.storeId;
    if (!storeId || !(await canStaffOrManageStore(user.id, storeId))) {
      return { success: false as const, message: "権限がありません" };
    }

    await db
      .update(tickets)
      .set({ status: "CANCELED" })
      .where(eq(tickets.id, ticketId));

    invalidateTicketPages(storeId);

    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました。",
    };
  }
}

export async function fetchTicketsByStatus(
  storeId: string,
  status: TicketStatus | null,
) {
  const user = await getAuthenticatedUser();
  if (!user || !(await canStaffOrManageStore(user.id, storeId))) {
    return {
      success: false,
      message: "権限がありません。",
      error: null,
    };
  }

  const db = await getDb();
  try {
    const attractionRows = await db
      .select({ id: attractions.id })
      .from(attractions)
      .where(eq(attractions.storeId, storeId))
      .limit(1);
    const attraction = attractionRows[0];
    if (!attraction) {
      return;
    }

    const ticketList = status
      ? await db
          .select()
          .from(tickets)
          .where(
            and(
              eq(tickets.attractionId, attraction.id),
              eq(tickets.status, status),
            ),
          )
      : await db
          .select()
          .from(tickets)
          .where(eq(tickets.attractionId, attraction.id));

    return {
      success: true,
      tickets: ticketList,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました。",
    };
  }
}

export async function completePaperTicket(
  prevState: unknown,
  formData: FormData,
) {
  const ticketId = formData.get("ticketId") as string;
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false as const, message: "ログインが必要です" };
    }

    const db = await getDb();
    const fetchedRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);
    const fetchedTicket = fetchedRows[0];

    if (!fetchedTicket) {
      return { success: false as const, message: "チケットが存在しません" };
    }

    const storeRows = await db
      .select({ storeId: attractions.storeId })
      .from(attractions)
      .innerJoin(stores, eq(attractions.storeId, stores.id))
      .where(eq(attractions.id, fetchedTicket.attractionId))
      .limit(1);
    const storeId = storeRows[0]?.storeId;
    if (!storeId || !(await canStaffOrManageStore(user.id, storeId))) {
      return { success: false as const, message: "権限がありません" };
    }

    if (fetchedTicket.status != "CALLED") {
      return {
        success: false as const,
        message: "チケットは呼び出されていません",
      };
    }
    await db
      .update(tickets)
      .set({ status: "COMPLETED" })
      .where(eq(tickets.id, ticketId));

    await db
      .update(tickets)
      .set({ status: "CALLED" })
      .where(
        and(
          eq(tickets.attractionId, fetchedTicket.attractionId),
          eq(tickets.status, "ISSUED"),
          gt(tickets.index, fetchedTicket.index),
          lte(tickets.index, fetchedTicket.index + 3),
        ),
      );

    invalidateTicketPages(storeId);

    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました。",
    };
  }
}
