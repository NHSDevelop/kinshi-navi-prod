"use server";

import z from "zod";
import { foods, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/drizzle";

const RegisterSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  price: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "必須項目です"),
});

export type ZodErrors = {
  name?: string[];
  price?: string[];
} | null;

export type ItemState = {
  name?: string;
  price?: string;
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
  });

  const foodId = formData.get("foodId") as string;

  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      price: (formData.get("price") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { name, price } = validationResult.data;

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
    });

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
