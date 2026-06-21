"use server";

import { canStaffOrManageStore, getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { revalidatePath } from "next/cache";

export async function createAttraction(prevState: unknown, formData: FormData) {
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

  try {
    const db = await getDb();
    await db.insert(attractions).values({
      storeId: storeId,
    });
    revalidatePath(`/dashboard/staff/store/${storeId}`);
    revalidatePath(`/dashboard/admin/store/${storeId}`);
    revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
    revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
    revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
    revalidatePath("/attraction/waiting-status");
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

const updateAttractionConfigSchema = z.object({
  playTime: z.coerce
    .number()
    .int("整数である必要があります")
    .positive("正の数である必要があります")
    .optional(),
  peopleCapacity: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "1以上である必要があります"),
  maxGroups: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "1以上である必要があります"),
});

export type ZodErrors = {
  playTime?: string[];
  peopleCapacity?: string[];
  maxGroups?: string[];
} | null;

export type AttractionConfigState = {
  playTime?: string;
  peopleCapacity?: string;
  maxGroups?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export async function updateAttractionConfig(
  prevState: unknown,
  formData: FormData,
): Promise<AttractionConfigState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      playTime: (formData.get("playTime") as string) || "",
      peopleCapacity: (formData.get("peopleCapacity") as string) || "",
      maxGroups: (formData.get("maxGroups") as string) || "",
      zodErrors: null,
      message: "ログインが必要です。",
      success: false,
    };
  }

  const validationResult = updateAttractionConfigSchema.safeParse({
    playTime: formData.get("playTime"),
    peopleCapacity: formData.get("peopleCapacity"),
    maxGroups: formData.get("maxGroups"),
  });

  if (!validationResult.success) {
    return {
      playTime: (formData.get("playTime") as string) || "",
      peopleCapacity: (formData.get("peopleCapacity") as string) || "",
      maxGroups: (formData.get("maxGroups") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { playTime, peopleCapacity, maxGroups } = validationResult.data;
  const attractionId = formData.get("attractionId") as string;

  try {
    const db = await getDb();
    const attractionRows = await db
      .select({ storeId: attractions.storeId })
      .from(attractions)
      .where(eq(attractions.id, attractionId))
      .limit(1);
    const attraction = attractionRows[0];

    if (!attraction) {
      return {
        zodErrors: null,
        success: false,
        message: "企画が存在しません。",
      };
    }

    if (!(await canStaffOrManageStore(user.id, attraction.storeId))) {
      return {
        zodErrors: null,
        success: false,
        message: "権限がありません。",
      };
    }

    await db
      .update(attractions)
      .set({
        playTime: playTime,
        peopleCapacity: peopleCapacity,
        maxGroups: maxGroups,
      })
      .where(eq(attractions.id, attractionId));

    revalidatePath(`/dashboard/staff/store/${attraction.storeId}`);
    revalidatePath(`/dashboard/admin/store/${attraction.storeId}`);
    revalidatePath(`/dashboard/staff/store/${attraction.storeId}/item-list`);
    revalidatePath(`/dashboard/staff/store/${attraction.storeId}/call-ticket`);
    revalidatePath(`/dashboard/admin/store/${attraction.storeId}/create-item`);
    revalidatePath("/attraction/waiting-status");
    return {
      zodErrors: null,
      message: "操作が完了しました。",
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
