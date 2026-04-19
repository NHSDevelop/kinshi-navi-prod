"use server";

import z from "zod";
import { foods, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/drizzle";

const RegisterSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  stock: z.coerce
    .number()
    .int("整数である必要があります")
    .min(0, "0以上である必要があります"),
  price: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "必須項目です"),
});

export type ZodErrors = {
  name?: string[];
  stock?: string[];
  price?: string[];
} | null;

export type ItemState = {
  name?: string;
  stock?: string;
  price?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createItem(
  prevState: unknown,
  formData: FormData,
): Promise<ItemState> {
  const validationResult = RegisterSchema.safeParse({
    name: formData.get("name"),
    stock: formData.get("stock"),
    price: formData.get("price"),
  });

  const foodId = formData.get("foodId") as string;

  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      stock: (formData.get("stock") as string) || "",
      price: (formData.get("price") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { name, stock, price } = validationResult.data;

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
      stock: stock,
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
