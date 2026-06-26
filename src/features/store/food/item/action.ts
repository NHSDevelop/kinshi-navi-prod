"use server";

import z from "zod";
import { foods, Item, items, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/drizzle";
import { revalidatePath } from "next/cache";

const RegisterSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  price: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "必須項目です"),
  imageUrl: z.string().url("画像URLの形式が正しくありません").nullable(),
  description: z.string().nullable(),
});

export type ZodErrors = {
  name?: string[];
  price?: string[];
  imageUrl?: string[];
  description?: string[];
} | null;

export type ItemState = {
  name?: string;
  price?: string;
  imageUrl?: string;
  description?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export type UpdateItemConfigZodErrors = {
  name?: string[];
  price?: string[];
  imageUrl?: string[];
  description?: string[];
} | null;

export type UpdateItemConfigState = {
  name?: string;
  price?: string;
  imageUrl?: string;
  description?: string;
  zodErrors?: UpdateItemConfigZodErrors;
  message?: string | null;
  error?: string | null;
  success?: boolean;
};

export async function createItem(
  prevState: unknown,
  formData: FormData,
): Promise<ItemState> {
  const validationResult = RegisterSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl")
      ? (formData.get("imageUrl") as string)
      : null,
    description: formData.get("description")
      ? (formData.get("description") as string)
      : null,
  });

  const foodId = formData.get("foodId") as string;

  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      price: (formData.get("price") as string) || "",
      imageUrl: (formData.get("imageUrl") as string) || "",
      description: (formData.get("description") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { name, price, imageUrl, description } = validationResult.data;

  try {
    const db = await getDb();
    const foodRows = await db
      .select({ id: foods.id })
      .from(foods)
      .where(eq(foods.id, foodId))
      .limit(1);
    const food = foodRows[0];

    if (!food) {
      return {
        zodErrors: null,
        success: false,
        message: "模擬店が存在しません。",
      };
    }

    await db.insert(items).values({
      name: name,
      foodId: foodId,
      price: price,
      imageUrl: imageUrl,
      description: description,
    });

    const storeIdRows = await db
      .select({ storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.id, foodId))
      .limit(1);
    const storeId = storeIdRows[0]?.storeId;

    if (storeId) {
      revalidatePath(`/dashboard/staff/store/${storeId}`);
      revalidatePath(`/dashboard/admin/store/${storeId}`);
      revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
      revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
      revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
      revalidatePath("/food/stock-status");
    }

    return {
      zodErrors: null,
      message: "商品の登録が完了しました。",
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

const updateItemConfigSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  price: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "必須項目です"),
  imageUrl: z.string().url("画像URLの形式が正しくありません").nullable(),
  description: z.string().nullable(),
});

export async function updateItemConfig(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateItemConfigState> {
  const validationResult = updateItemConfigSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl")
      ? (formData.get("imageUrl") as string)
      : null,
    description: formData.get("description")
      ? (formData.get("description") as string)
      : null,
  });

  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      price: (formData.get("price") as string) || "",
      imageUrl: (formData.get("imageUrl") as string) || "",
      description: (formData.get("description") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: null,
      error: "入力形式が正しくありません",
    };
  }

  const { name, price, imageUrl, description } = validationResult.data;
  const itemId = formData.get("itemId") as string;

  try {
    const db = await getDb();
    const itemRows = await db
      .select({ foodId: items.foodId })
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);
    const item = itemRows[0];

    if (!item) {
      return {
        zodErrors: null,
        success: false,
        message: "商品が存在しません。",
      };
    }

    await db
      .update(items)
      .set({
        name: name,
        price: price,
        imageUrl: imageUrl,
        description: description,
        updatedAt: new Date(),
      })
      .where(eq(items.id, itemId));

    const storeIdRows = await db
      .select({ storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.id, item.foodId))
      .limit(1);
    const storeId = storeIdRows[0]?.storeId;

    if (storeId) {
      revalidatePath(`/dashboard/staff/store/${storeId}`);
      revalidatePath(`/dashboard/admin/store/${storeId}`);
      revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
      revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
      revalidatePath("/food/stock-status");
    }
    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));
    const storeSlug = storeRows[0]?.slug;
    if (storeSlug) {
      revalidatePath(`/store/${storeSlug}`);
    }
    return {
      zodErrors: null,
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      success: false,
      message: null,
      error: "サーバーエラーが発生しました",
    };
  }
}

export async function getItemsByFoodId(foodId: string): Promise<Item[] | null> {
  try {
    const db = await getDb();
    const itemRows = await db
      .select()
      .from(items)
      .where(and(eq(items.foodId, foodId), eq(items.isActive, true)));
    return itemRows;
  } catch (error) {
    console.log(error);
  }
  return null;
}

export async function disabledItem(prevState: unknown, formData: FormData) {
  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return {
      success: false,
      message: "指定された商品がありません。",
    };
  }
  try {
    const db = await getDb();
    await db.update(items).set({ isActive: false }).where(eq(items.id, itemId));
    const itemRows = await db
      .select({ foodId: items.foodId })
      .from(items)
      .where(eq(items.id, itemId));
    const item = itemRows[0];

    if (!item) {
      return {
        success: false,
        message: "商品が存在しません。",
      };
    }
    const storeIdRows = await db
      .select({ storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.id, item.foodId))
      .limit(1);
    const storeId = storeIdRows[0]?.storeId;
    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));
    const storeSlug = storeRows[0]?.slug;
    if (storeId) {
      revalidatePath(`/dashboard/staff/store/${storeId}`);
      revalidatePath(`/dashboard/admin/store/${storeId}`);
      revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
      revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
    }
    revalidatePath("/food/stock-status");
    if (storeSlug) {
      revalidatePath(`/store/${storeSlug}`);
    }
    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

export async function resetItemSoldStock(
  prevState: unknown,
  formData: FormData,
) {
  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return {
      success: false,
      message: "指定された商品がありません。",
    };
  }
  try {
    const db = await getDb();
    await db.update(items).set({ soldStock: 0 }).where(eq(items.id, itemId));
    const itemRows = await db
      .select({ foodId: items.foodId })
      .from(items)
      .where(eq(items.id, itemId));
    const item = itemRows[0];

    if (!item) {
      return {
        success: false,
        message: "商品が存在しません。",
      };
    }
    const storeIdRows = await db
      .select({ storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.id, item.foodId))
      .limit(1);
    const storeId = storeIdRows[0]?.storeId;
    if (storeId) {
      revalidateTag(`store-${storeId}`, "max");
    }
    revalidateTag("stock-status", "max");
    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

export async function resetItemSoldStock(
  prevState: unknown,
  formData: FormData,
) {
  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return {
      success: false,
      message: "指定された商品がありません。",
    };
  }
  try {
    const db = await getDb();
    await db.update(items).set({ soldStock: 0 }).where(eq(items.id, itemId));
    const itemRows = await db
      .select({ foodId: items.foodId })
      .from(items)
      .where(eq(items.id, itemId));
    const item = itemRows[0];

    if (!item) {
      return {
        success: false,
        message: "商品が存在しません。",
      };
    }
    const storeIdRows = await db
      .select({ storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.id, item.foodId))
      .limit(1);
    const storeId = storeIdRows[0]?.storeId;
    if (storeId) {
      revalidateTag(`store-${storeId}`, "max");
    }
    revalidateTag("stock-status", "max");
    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}
