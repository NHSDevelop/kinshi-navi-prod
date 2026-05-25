"use server";

import { getDb } from "@/lib/db/drizzle";
import { admins, staffs } from "@/lib/db/schema";
import { getSignedInUser } from "@/lib/auth-guard";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

const unlinkBindingSchema = z.object({
  bindingType: z.enum(["EVENT_ADMIN", "STORE_ADMIN", "STAFF"]),
});

export async function unlinkBinding(
  prevState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string | null }> {
  try {
    const validationResult = unlinkBindingSchema.safeParse({
      bindingType: formData.get("bindingType") as string,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: "解除対象の指定が正しくありません。",
      };
    }

    const user = await getSignedInUser();
    if (!user) {
      return {
        success: false,
        error: "ログインが必要です。",
      };
    }

    const db = await getDb();
    const { bindingType } = validationResult.data;

    if (bindingType === "STAFF") {
      const removedRows = await db
        .delete(staffs)
        .where(eq(staffs.userId, user.id))
        .returning({ id: staffs.id });

      if (removedRows.length === 0) {
        return {
          success: false,
          error: "解除できる店舗スタッフの紐づけが見つかりません。",
        };
      }
    } else {
      const removedRows = await db
        .delete(admins)
        .where(and(eq(admins.userId, user.id), eq(admins.role, bindingType)))
        .returning({ id: admins.id });

      if (removedRows.length === 0) {
        return {
          success: false,
          error: "解除できる権限が見つかりません。",
        };
      }
    }

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "サーバーエラーが発生しました。",
    };
  }
}
