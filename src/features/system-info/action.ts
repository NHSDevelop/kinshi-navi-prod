"use server";

import { canSuperAdmin, getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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

function revaliedateSystemInfoPages(systemInfoId?: string) {
  revalidatePath(`/`);
  if (systemInfoId) {
    revalidatePath(`/system-info/${systemInfoId}/`);
  }
}

export async function createSystemInfo(prevState: unknown, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: null,
        error: "ログインが必要です",
      };
    }

    if (!(await canSuperAdmin(user.id))) {
      return {
        success: false,
        message: null,
        error: "権限がありません",
      };
    }

    const validationResult = systemInfoInputSchema.safeParse({
      meta: formData.get("meta") as string,
      title: formData.get("title") as string,
    });
    if (!validationResult.success) {
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
    revaliedateSystemInfoPages();

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
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        zodErrors: null,
        success: false,
        message: null,
        error: "ログインが必要です",
      };
    }

    if (!(await canSuperAdmin(user.id))) {
      return {
        zodErrors: null,
        success: false,
        message: null,
        error: "権限がありません",
      };
    }

    const validationResult = updateSystemInfoInputSchema.safeParse({
      systemInfoId: formData.get("systemInfoId") as string,
      meta: formData.get("meta") as string,
      title: formData.get("title") as string,
    });

    if (!validationResult.success) {
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

    revaliedateSystemInfoPages(systemInfoId);

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
