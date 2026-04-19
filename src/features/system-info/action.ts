"use server";

import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

const systemInfoInputSchema = z.object({
  meta: z.string().min(1, "必須項目です"),
  title: z.string().min(1, "必須項目です"),
});

const updateSystemInfoInputSchema = systemInfoInputSchema.extend({
  systemInfoId: z.string().min(1, "必須項目です"),
});

export type UpdateSystemInfoZodErrors = {
  title?: string[];
  meta?: string[];
  systemInfoId?: string[];
} | null;

export type UpdateSystemInfoState = {
  title?: string;
  meta?: string;
  zodErrors?: UpdateSystemInfoZodErrors;
  success?: boolean;
  message?: string | null;
  error?: string | null;
};

export async function createSystemInfo(prevState: unknown, formData: FormData) {
  try {
    const validationResult = systemInfoInputSchema.safeParse({
      meta: formData.get("meta") as string,
      title: formData.get("title") as string,
    });
    //TODO 仮実装
    if (validationResult.error) {
      console.log(validationResult.error);
      return {
        success: false,
        message: null,
        error: "入力形式が正しくありません",
      };
    }
    const { title, meta } = validationResult.data;
    const db = await getDb();

    await db.insert(systemInfos).values({
      title: title,
      meta: meta,
    });
    return {
      success: true,
      message: "システムのお知らせの作成が完了しました",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました",
    };
  }
}

export async function updateSystemInfo(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateSystemInfoState> {
  try {
    const validationResult = updateSystemInfoInputSchema.safeParse({
      systemInfoId: formData.get("systemInfoId") as string,
      meta: formData.get("meta") as string,
      title: formData.get("title") as string,
    });

    if (!validationResult.success) {
      console.log(validationResult.error);
      return {
        title: (formData.get("title") as string) || "",
        meta: (formData.get("meta") as string) || "",
        zodErrors: validationResult.error.flatten().fieldErrors,
        success: false,
        message: null,
        error: "入力形式が正しくありません",
      };
    }

    const { systemInfoId, title, meta } = validationResult.data;
    const db = await getDb();

    await db
      .update(systemInfos)
      .set({
        title,
        meta,
      })
      .where(eq(systemInfos.id, systemInfoId));

    return {
      zodErrors: null,
      success: true,
      message: "システムのお知らせの編集が完了しました",
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
