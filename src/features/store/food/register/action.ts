"use server";

import { registerLogs, stockLogs, items } from "@/lib/db/schema";
import z from "zod";
import { getDb } from "@/lib/db/drizzle";
import { eq, sql } from "drizzle-orm";

const CreateRegisterLogSchema = z.object({
  foodId: z.string().min(1, "必須項目です"),
  totalAmount: z.coerce.number().int("整数である必要があります"),
  amountPaid: z.coerce.number().int("整数である必要があります"),
  meta: z.string().optional(),
});

const ProcessRegisterAndStockSchema = z.object({
  foodId: z.string().min(1, "必須項目です"),
  totalAmount: z.coerce.number().int("整数である必要があります"),
  amountPaid: z.coerce.number().int("整数である必要があります"),
});

export type ZodErrors = {
  foodId?: string[];
  totalAmount?: string[];
  amountPaid?: string[];
  meta?: string[];
} | null;

export type RegisterLogState = {
  foodId: string;
  totalAmount: string;
  amountPaid: string;
  meta: string;
  zodErrors: ZodErrors;
  message: string | null;
  success: boolean;
};

export type RegisterAndStockState = {
  quantities: Record<string, number>;
  totalAmount: number;
  amountPaid: string;
  zodErrors: {
    quantities?: Record<string, string[]>;
    totalAmount?: string[];
    amountPaid?: string[];
  } | null;
  message: string | null;
  success: boolean;
};

export async function createRegisterLog(
  prevState: RegisterLogState,
  formData: FormData,
): Promise<RegisterLogState> {
  const validationResult = CreateRegisterLogSchema.safeParse({
    foodId: formData.get("foodId") as string,
    totalAmount: formData.get("totalAmount") as string,
    amountPaid: formData.get("amountPaid") as string,
    meta: formData.get("meta") as string | undefined,
  });

  if (!validationResult.success) {
    return {
      foodId: formData.get("foodId") as string,
      totalAmount: formData.get("totalAmount") as string,
      amountPaid: formData.get("amountPaid") as string,
      meta: formData.get("meta") as string,
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { foodId, totalAmount, amountPaid, meta } = validationResult.data;
  const db = await getDb();

  try {
    await db.insert(registerLogs).values({
      foodId,
      totalAmount,
      amountPaid,
      meta,
    });

    return {
      foodId: "",
      totalAmount: "",
      amountPaid: "",
      meta: "",
      zodErrors: null,
      message: "会計が完了しました。",
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      foodId: formData.get("foodId") as string,
      totalAmount: formData.get("totalAmount") as string,
      amountPaid: formData.get("amountPaid") as string,
      meta: formData.get("meta") as string,
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}

export async function processRegisterAndStock(
  prevState: RegisterAndStockState,
  formData: FormData,
): Promise<RegisterAndStockState> {
  const validationResult = ProcessRegisterAndStockSchema.safeParse({
    foodId: formData.get("foodId") as string,
    totalAmount: formData.get("totalAmount") as string,
    amountPaid: formData.get("amountPaid") as string,
  });

  if (!validationResult.success) {
    return {
      quantities: prevState.quantities,
      totalAmount: prevState.totalAmount,
      amountPaid: formData.get("amountPaid") as string,
      zodErrors: validationResult.error.flatten()
        .fieldErrors as RegisterAndStockState["zodErrors"],
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { foodId, totalAmount, amountPaid } = validationResult.data;
  const db = await getDb();

  try {
    // Parse quantities from formData (format: quantity_<itemId>)
    const quantitiesToRecord: Record<string, number> = {};
    formData.forEach((value, key) => {
      if (key.startsWith("quantity_")) {
        const itemId = key.replace("quantity_", "");
        const qty = parseInt(value as string, 10);
        if (qty > 0) {
          quantitiesToRecord[itemId] = qty;
        }
      }
    });

    // Record stock logs for each item (negative difference)
    const stockLogRecords = Object.entries(quantitiesToRecord).map(
      ([itemId, qty]) => ({
        itemId,
        difference: -qty, // Negative to reduce stock
        meta: `会計時に販売: ${qty}個`,
      }),
    );

    for (const record of stockLogRecords) {
      await db.insert(stockLogs).values(record);
    }

    // Update items stock
    for (const [itemId, qty] of Object.entries(quantitiesToRecord)) {
      await db
        .update(items)
        .set({
          stock: sql`${items.stock} - ${qty}`,
        })
        .where(eq(items.id, itemId));
    }

    // Record register log
    await db.insert(registerLogs).values({
      foodId,
      totalAmount,
      amountPaid,
      meta: `販売${Object.values(quantitiesToRecord).reduce((a, b) => a + b, 0)}個`,
    });

    return {
      quantities: {},
      totalAmount: 0,
      amountPaid: "",
      zodErrors: null,
      message: "会計・在庫変動が完了しました。",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      quantities: prevState.quantities,
      totalAmount: prevState.totalAmount,
      amountPaid: formData.get("amountPaid") as string,
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}
