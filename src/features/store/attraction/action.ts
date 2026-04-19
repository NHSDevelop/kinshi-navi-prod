/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

export async function createAttraction(prevState: unknown, formData: FormData) {
  const storeId = formData.get("storeId") as string;

  try {
    const db = await getDb();
    await db.insert(attractions).values({
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
});

export type ZodErrors = {
  playTime?: string[];
  peopleCapacity?: string[];
} | null;

export type AttractionConfigState = {
  playTime?: string;
  peopleCapacity?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export async function updateAttractionConfig(
  prevState: unknown,
  formData: FormData,
): Promise<AttractionConfigState> {
  const validationResult = updateAttractionConfigSchema.safeParse({
    playTime: formData.get("playTime"),
    peopleCapacity: formData.get("peopleCapacity"),
  });

  if (!validationResult.success) {
    return {
      playTime: (formData.get("playTime") as string) || "",
      peopleCapacity: (formData.get("peopleCapacity") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { playTime, peopleCapacity } = validationResult.data;
  const attractionId = formData.get("attractionId") as string;

  try {
    const db = await getDb();
    await db
      .update(attractions)
      .set({
        playTime: playTime,
        peopleCapacity: peopleCapacity,
      })
      .where(eq(attractions.id, attractionId));
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
