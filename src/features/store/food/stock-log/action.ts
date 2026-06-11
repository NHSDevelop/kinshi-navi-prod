"use server";

import { foods, items, stockLogs } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { getDb } from "@/lib/db/drizzle";
import { createStockLogSchema } from "@/lib/schemas/food";
import { revalidatePath } from "next/cache";

export type ZodErrors = {
  itemId?: string[];
  difference?: string[];
  meta?: string[];
} | null;

export type StockLogState = {
  itemId?: string;
  difference?: string;
  meta?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

async function getStoreIdByItemId(itemId: string) {
  const db = await getDb();
  const itemRows = await db
    .select({ storeId: foods.storeId })
    .from(items)
    .innerJoin(foods, eq(items.foodId, foods.id))
    .where(eq(items.id, itemId))
    .limit(1);

  return itemRows[0]?.storeId ?? null;
}

function invalidateStockPages(storeId: string) {
  revalidatePath(`/dashboard/staff/store/${storeId}`);
  revalidatePath(`/dashboard/staff/store/${storeId}/register`);
  revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
  revalidatePath(`/dashboard/admin/store/${storeId}`);
  revalidatePath("/food/stock-status");
}

export default async function createStockLog(
  prevState: unknown,
  formData: FormData,
): Promise<StockLogState> {
  const validationResult = createStockLogSchema.safeParse({
    itemId: formData.get("itemId"),
    difference: formData.get("difference"),
    meta: formData.get("meta") as string | undefined,
  });

  if (!validationResult.success) {
    return {
      itemId: (formData.get("itemId") as string) || "",
      difference: (formData.get("difference") as string) || "",
      meta: (formData.get("meta") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { itemId, difference, meta } = validationResult.data;
  try {
    const db = await getDb();
    const storeId = await getStoreIdByItemId(itemId);

    if (!storeId) {
      return {
        itemId: (formData.get("itemId") as string) || "",
        difference: (formData.get("difference") as string) || "",
        meta: (formData.get("meta") as string) || "",
        zodErrors: null,
        message: "該当する模擬店が存在しません",
        success: false,
      };
    }

    const selectQuery = db
      .select({ name: items.name, stock: items.stock })
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    const updateQuery = db
      .update(items)
      .set({ stock: sql`${items.stock} + ${difference}` })
      .where(
        and(
          eq(items.id, itemId),
          sql`${items.stock} + ${difference} >= 0`
        )
      );

    const insertLogQuery = db.insert(stockLogs).values({
      itemId: itemId,
      difference: difference,
      meta,
    });

    const batchResults = await db.batch([
      selectQuery,
      updateQuery,
      insertLogQuery
    ]);

    const currentItemInfo = batchResults[0][0];
    const updateResult = batchResults[1];

    if (updateResult.meta?.changes === 0) {
      const currentStock = currentItemInfo ? currentItemInfo.stock : 0;
      return {
        itemId: (formData.get("itemId") as string) || "",
        difference: (formData.get("difference") as string) || "",
        meta: (formData.get("meta") as string) || "",
        zodErrors: null,
        message: `${currentItemInfo?.name || "商品"} の在庫が不足しているため、指定された数量を減算できません（現在の在庫: ${currentStock}個）。`,
        success: false,
      };
    }

    invalidateStockPages(storeId);

    return {
      itemId: "",
      difference: "",
      meta: "",
      zodErrors: null,
      message: "在庫の更新が完了しました。",
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      itemId: (formData.get("itemId") as string) || "",
      difference: (formData.get("difference") as string) || "",
      meta: (formData.get("meta") as string) || "",
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}