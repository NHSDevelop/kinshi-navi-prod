"use server";

import { items, stockLogs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/drizzle";
import { createStockLogSchema } from "@/lib/schemas/food";

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

//TODO stockが負になるときの実装する
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
  const db = await getDb();
  try {
    await db.insert(stockLogs).values({
      itemId: itemId,
      difference: difference,
      meta,
    });

    await db
      .update(items)
      .set({ stock: sql`${items.stock} + ${difference}` })
      .where(eq(items.id, itemId));

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
