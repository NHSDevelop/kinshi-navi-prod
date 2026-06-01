"use server";

import {
  registerLogs,
  stockLogs,
  items,
  registerLanes,
  foods,
} from "@/lib/db/schema";
import z from "zod";
import { getDb } from "@/lib/db/drizzle";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function invalidateRegisterPages(storeId: string) {
  revalidatePath(`/dashboard/staff/store/${storeId}`);
  revalidatePath(`/dashboard/staff/store/${storeId}/register`);
  revalidatePath(`/dashboard/staff/store/${storeId}/register-log-history`);
  revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
  revalidatePath(`/dashboard/admin/store/${storeId}`);
  revalidatePath("/food/stock-status");
}

async function getStoreIdByFoodId(foodId: string) {
  const db = await getDb();
  const foodRows = await db
    .select({ storeId: foods.storeId })
    .from(foods)
    .where(eq(foods.id, foodId))
    .limit(1);

  return foodRows[0]?.storeId ?? null;
}

const CreateRegisterLogSchema = z.object({
  foodId: z.string().min(1, "必須項目です"),
  totalAmount: z.coerce.number().int("整数である必要があります"),
  amountPaid: z.coerce.number().int("整数である必要があります"),
  meta: z.string().optional(),
  laneId: z.string().optional(),
});

const ProcessRegisterAndStockSchema = z.object({
  foodId: z.string().min(1, "必須項目です"),
  totalAmount: z.coerce.number().int("整数である必要があります"),
  amountPaid: z.coerce.number().int("整数である必要があります"),
  laneId: z.string().optional(),
});

export type ZodErrors = {
  foodId?: string[];
  totalAmount?: string[];
  amountPaid?: string[];
  meta?: string[];
  laneId?: string[];
} | null;

export type RegisterLogState = {
  foodId: string;
  totalAmount: string;
  amountPaid: string;
  meta: string;
  laneId: string;
  zodErrors: ZodErrors;
  message: string | null;
  success: boolean;
};

export type RegisterAndStockState = {
  quantities: Record<string, number>;
  totalAmount: number;
  amountPaid: string;
  laneId: string;
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
    laneId: formData.get("laneId") as string,
  });

  if (!validationResult.success) {
    return {
      foodId: formData.get("foodId") as string,
      totalAmount: formData.get("totalAmount") as string,
      amountPaid: formData.get("amountPaid") as string,
      meta: formData.get("meta") as string,
      laneId: formData.get("laneId") as string,
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { foodId, totalAmount, amountPaid, meta, laneId } =
    validationResult.data;
  const db = await getDb();

  try {
    // laneId is optional for register; record register log directly.
    await db.insert(registerLogs).values({
      foodId,
      totalAmount,
      amountPaid,
      meta,
      laneId: laneId || null,
    });

    const storeId = await getStoreIdByFoodId(foodId);
    if (storeId) {
      invalidateRegisterPages(storeId);
    }

    return {
      foodId: "",
      totalAmount: "",
      amountPaid: "",
      meta: "",
      zodErrors: null,
      message: "会計が完了しました。",
      success: true,
      laneId: "",
    };
  } catch (error) {
    console.log(error);
    return {
      foodId: formData.get("foodId") as string,
      totalAmount: formData.get("totalAmount") as string,
      amountPaid: formData.get("amountPaid") as string,
      meta: formData.get("meta") as string,
      laneId: formData.get("laneId") as string,
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
    laneId: formData.get("laneId") as string,
  });

  if (!validationResult.success) {
    return {
      quantities: prevState.quantities,
      totalAmount: prevState.totalAmount,
      amountPaid: formData.get("amountPaid") as string,
      laneId: formData.get("laneId") as string,
      zodErrors: validationResult.error.flatten()
        .fieldErrors as RegisterAndStockState["zodErrors"],
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { foodId, totalAmount, amountPaid, laneId } = validationResult.data;
  const db = await getDb();

  try {
    // laneId is optional. Proceed with stock updates and register log using foodId.

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

    if (stockLogRecords.length > 0) {
      await db.insert(stockLogs).values(stockLogRecords);
    }

    const itemIds = Object.keys(quantitiesToRecord);
    if (itemIds.length > 0) {
      const updateCases = itemIds.map((itemId) => {
        const qty = quantitiesToRecord[itemId];
        return sql`WHEN ${itemId} THEN ${sql`${items.stock} - ${qty}`}`;
      });
      const updatedStock = sql`CASE ${items.id} ${sql.join(updateCases, sql` `)} ELSE ${items.stock} END`;
      await db
        .update(items)
        .set({ stock: updatedStock })
        .where(inArray(items.id, itemIds));
    }

    await db.insert(registerLogs).values({
      foodId,
      totalAmount,
      amountPaid,
      laneId,
      meta: `販売${Object.values(quantitiesToRecord).reduce((a, b) => a + b, 0)}個`,
    });

    const storeId = await getStoreIdByFoodId(foodId);
    if (storeId) {
      invalidateRegisterPages(storeId);
    }

    return {
      quantities: {},
      totalAmount: 0,
      amountPaid: "",
      laneId: "",
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
      laneId: formData.get("laneId") as string,
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}
