"use server";

import { registerLogs, stockLogs, items, foods } from "@/lib/db/schema";
import z from "zod";
import { getDb } from "@/lib/db/drizzle";
import { eq, inArray, sql, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function invalidateRegisterPages(storeId: string) {
  revalidatePath(`/dashboard/staff/store/${storeId}`);
  revalidatePath(`/dashboard/staff/store/${storeId}/register`);
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
  foodId: z.string().optional(),
  totalAmount: z.coerce.number().int("整数である必要があります"),
  amountPaid: z.coerce.number().int("整数である必要があります"),
  meta: z.string().optional(),
  laneId: z.string().optional(),
});

const ProcessRegisterAndStockSchema = z.object({
  foodId: z.string().optional(),
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
  laneId: string | null;
  zodErrors: ZodErrors;
  message: string | null;
  success: boolean;
};

export type RegisterAndStockState = {
  quantities: Record<string, number>;
  totalAmount: number;
  amountPaid: string;
  laneId: string | null;
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
    foodId: formData.get("foodId") as string || undefined,
    totalAmount: formData.get("totalAmount") as string,
    amountPaid: formData.get("amountPaid") as string,
    meta: formData.get("meta") as string | undefined,
    laneId: formData.get("laneId") as string | undefined,
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
    await db.insert(registerLogs).values({
      foodId: foodId || null,
      totalAmount,
      amountPaid,
      meta,
      laneId: laneId || null,
    });

    if (foodId) {
      const storeId = await getStoreIdByFoodId(foodId);
      if (storeId) {
        invalidateRegisterPages(storeId);
      }
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
    foodId: formData.get("foodId") as string || undefined,
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

    const itemIds = Object.keys(quantitiesToRecord);
    if (itemIds.length === 0) {
      return {
        quantities: prevState.quantities,
        totalAmount: prevState.totalAmount,
        amountPaid: formData.get("amountPaid") as string,
        laneId: formData.get("laneId") as string,
        zodErrors: null,
        message: "購入商品が選択されていません",
        success: false,
      };
    }

    const batchQueries: any[] = [];

    const selectQuery = db
      .select({ id: items.id, name: items.name, stock: items.stock, soldStock: items.soldStock })
      .from(items)
      .where(inArray(items.id, itemIds));
    batchQueries.push(selectQuery);

    for (const itemId of itemIds) {
      const qty = quantitiesToRecord[itemId];
      const updateQuery = db
        .update(items)
        .set({ stock: sql`${items.stock} - ${qty}`, soldStock: sql`${items.soldStock} + ${qty}` })
        .where(and(eq(items.id, itemId), gte(items.stock, qty)));
      batchQueries.push(updateQuery);
    }

    const stockLogRecords = Object.entries(quantitiesToRecord).map(
      ([itemId, qty]) => ({
        itemId,
        difference: -qty,
        meta: `会計時に販売: ${qty}個`,
      }),
    );
    batchQueries.push(db.insert(stockLogs).values(stockLogRecords));

    batchQueries.push(
      db.insert(registerLogs).values({
        foodId: foodId || null,
        totalAmount,
        amountPaid,
        laneId: laneId || null,
        meta: `販売${Object.values(quantitiesToRecord).reduce((a, b) => a + b, 0)}個`,
      })
    );

    const batchResults = await db.batch(batchQueries as any);

    const dbItems = batchResults[0];

    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      const updateResult = batchResults[i + 1];
      
      if (updateResult.meta?.changes === 0) {
        const itemInfo = dbItems.find((item: any) => item.id === itemId);
        const currentStock = itemInfo ? itemInfo.stock : 0;
        return {
          quantities: prevState.quantities,
          totalAmount: prevState.totalAmount,
          amountPaid: formData.get("amountPaid") as string,
          laneId: formData.get("laneId") as string,
          zodErrors: null,
          message: `${itemInfo?.name || "商品"} の在庫が不足しています（注文時点の在庫: ${currentStock}個）。`,
          success: false,
        };
      }
    }

    if (foodId) {
      const storeId = await getStoreIdByFoodId(foodId);
      if (storeId) {
        invalidateRegisterPages(storeId);
      }
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