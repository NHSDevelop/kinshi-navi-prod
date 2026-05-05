"use server";

import { foods } from "@/lib/db/schema";
import { getDb } from "@/lib/db/drizzle";
import { revalidatePath } from "next/cache";

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
    revalidatePath(`/dashboard/staff/store/${storeId}`);
    revalidatePath(`/dashboard/admin/store/${storeId}`);
    revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
    revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
    revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
    revalidatePath("/food/stock-status");
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
