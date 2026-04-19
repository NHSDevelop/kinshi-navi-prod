/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { foods } from "@/lib/db/schema";
import { getDb } from "@/lib/db/drizzle";

export async function createFoodWithForm(
  prevState: unknown,
  formData: FormData,
) {
  const storeId = formData.get("storeId") as string;
  const db = await getDb();
  try {
    await db.insert(foods).values({
      storeId: storeId,
    });
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
