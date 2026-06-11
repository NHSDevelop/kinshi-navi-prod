"use server";

import { canStaffOrManageStore, getAuthenticatedUser } from "@/lib/auth-guard";
import { foods, foodTagValues } from "@/lib/db/schema";
import { getDb } from "@/lib/db/drizzle";
import { revalidatePath } from "next/cache";
import z from "zod";
import { eq } from "drizzle-orm";

export async function createFoodWithForm(
  prevState: unknown,
  formData: FormData,
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      message: "ログインが必要です。",
    };
  }

  const storeId = formData.get("storeId") as string;
  if (!(await canStaffOrManageStore(user.id, storeId))) {
    return {
      success: false,
      message: "権限がありません。",
    };
  }

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

type ZodErrors = {
  foodTag?: string[];
  isUseLane?: string[];
} | null;

export type FoodConfigState = {
  foodTag?: string;
  isUseLane?: boolean;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

const UpdateFoodConfigSchema = z.object({
  storeId: z.string(),
  foodId:z.string(),
  foodTag: z.enum(foodTagValues),
  isUseLane: z
    .enum(["true", "false"])
    .transform((val: "true" | "false") => val === "true"),
});

export async function updateFoodConfig(
  prevState: unknown,
  formData: FormData,
): Promise<FoodConfigState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      foodTag: (formData.get("foodTag") as string) || "",
      isUseLane: (formData.get("isUseLane") as string) === "true",
      zodErrors: null,
      message: "ログインが必要です。",
      success: false,
    };
  }

  const validationResult = UpdateFoodConfigSchema.safeParse({
    storeId: formData.get("storeId") as string,
    foodId: formData.get("foodId") as string,
    foodTag: formData.get("foodTag") as string,
    isUseLane: formData.get("isUseLane") as string,
  });
  if (!validationResult.success) {
    return {
      foodTag: (formData.get("foodTag") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      isUseLane: (formData.get("isUseLane") as string) === "true",
      success: false,
      message: "入力形式が正しくありません。",
    };
  }
  const { foodId, storeId, foodTag, isUseLane } = validationResult.data;
  if (!(await canStaffOrManageStore(user.id, storeId))) {
    return {
      foodTag: (formData.get("foodTag") as string) || "",
      isUseLane: (formData.get("isUseLane") as string) === "true",
      zodErrors: null,
      success: false,
      message: "権限がありません。",
    };
  }
  const db = await getDb();
  try {
    await db.update(foods).set({
      tag: foodTag,
      isUseLane: isUseLane,
    }).where(eq(foods.id, foodId));
    revalidatePath(`/dashboard/staff/store/${storeId}`);
    revalidatePath(`/dashboard/admin/store/${storeId}`);
    revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
    revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
    revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
    revalidatePath(`/dashboard/admin/store/${storeId}/register`);
    revalidatePath(`/dashboard/staff/store/${storeId}/register`);
    revalidatePath("/food/stock-status");
    revalidatePath("/vote/food");
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
      message: "サーバーエラーが発生しました。",
    };
  }
}
