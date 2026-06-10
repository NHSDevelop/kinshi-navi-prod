"use server";

import { getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import {
  storeTypeValues,
  type StoreType,
  stores,
  storeVotes,
  events,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getMainEvent } from "@/features/event/action";
import { revalidatePath } from "next/cache";

function isStoreType(value: unknown): value is StoreType {
  return (
    typeof value === "string" && storeTypeValues.includes(value as StoreType)
  );
}

export async function createStoreVote(prevState: unknown, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "ログインが必要です。",
      };
    }

    const db = await getDb();
    const mainEvent = await getMainEvent();
    if (!mainEvent) {
      return {
        success: false,
        message: "メインイベントが設定されていません。",
      };
    }

    if(!mainEvent.isVoting) {
      return {
        success: false,
        message: "現在投票は行えません。",
      };
    }

    const storeId = formData.get("storeId") as string;
    const storeType = formData.get("storeType");

    if (!isStoreType(storeType)) {
      return {
        success: false,
        message: "店舗種別が不正です。",
      };
    }

    const storeRows = await db
      .select({ id: stores.id })
      .from(stores)
      .where(
        and(
          eq(stores.id, storeId),
          eq(stores.eventId, mainEvent.id),
          eq(stores.storeType, storeType),
        ),
      )
      .limit(1);

    if (!storeRows[0]) {
      return {
        success: false,
        message: "投票対象の店舗が不正です。",
      };
    }

    const voteRows = await db
      .select()
      .from(storeVotes)
      .where(
        and(
          eq(storeVotes.userId, user.id),
          eq(storeVotes.storeType, storeType),
          eq(storeVotes.eventId, mainEvent.id),
        ),
      );

    if (voteRows.length > 0) {
      return {
        success: false,
        message:
          "投票はユーザー一人につき企画・模擬店ごとに一回しかできません。",
      };
    }
    await db.insert(storeVotes).values({
      userId: user.id,
      storeId: storeId,
      storeType: storeType,
      eventId: mainEvent.id,
    });
    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました。",
    };
  }
}

export async function changeEventIsVoting(prevState: unknown, formData: FormData) {
  const eventId = formData.get("eventId") as string;
  if(!eventId) {
    return {
      success: false,
      message: "指定されたイベントがありません",
    };
  }
  try {
    const db = await getDb();
    const eventRows = await db.select({"isVoting": events.isVoting}).from(events).where(eq(events.id, eventId));
    const event = eventRows[0]
    if(!event) {
      return {
      success: false,
      message: "指定されたイベントがありません",
    };
    }
    
    await db.update(events).set({isVoting: !event.isVoting});
    revalidatePath("/vote/attraction");
    revalidatePath("/vote/food");
    return {
      success: true,
      message: "操作が完了しました。",
      isVoting: !event.isVoting,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました。",
    };
  }
}

export async function changeEventIsVoteShowing(prevState: unknown, formData: FormData) {
  const eventId = formData.get("eventId") as string;
  if(!eventId) {
    return {
      success: false,
      message: "指定されたイベントがありません",
    };
  }
  try {
    const db = await getDb();
    const eventRows = await db.select({"isVoteShowing": events.isVoteShowing}).from(events).where(eq(events.id, eventId));
    const event = eventRows[0]
    if(!event) {
      return {
      success: false,
      message: "指定されたイベントがありません",
    };
    }
    
    await db.update(events).set({isVoteShowing: !event.isVoteShowing});
    revalidatePath("/vote/result");
    return {
      success: true,
      message: "操作が完了しました。",
      isVoteShowing: !event.isVoteShowing,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました。",
    };
  }
}
