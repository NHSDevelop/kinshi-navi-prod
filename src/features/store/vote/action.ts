"use server";

import { getDb } from "@/lib/db/drizzle";
import { storeTypeValues, type StoreType, storeVotes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function isStoreType(value: unknown): value is StoreType {
  return (
    typeof value === "string" && storeTypeValues.includes(value as StoreType)
  );
}

export async function createStoreVote(prevState: unknown, formData: FormData) {
  try {
    const db = await getDb();
    const userId = formData.get("userId") as string;
    const storeId = formData.get("storeId") as string;
    const storeType = formData.get("storeType");

    if (!isStoreType(storeType)) {
      return {
        success: false,
        message: null,
        error: "店舗種別が不正です。",
      };
    }

    const voteRows = await db
      .select()
      .from(storeVotes)
      .where(
        and(eq(storeVotes.userId, userId), eq(storeVotes.storeType, storeType)),
      );

    if (voteRows.length > 0) {
      return {
        success: false,
        message: null,
        error: "この店舗には既に投票済みです。",
      };
    }
    await db.insert(storeVotes).values({
      userId: userId,
      storeId: storeId,
      storeType: storeType,
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
