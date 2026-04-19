"use server";

import { getDb } from "@/lib/db/drizzle";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:support@gakusai-hub.jp",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export type PushSubscriptionJSONInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};

export async function getUserSubscription(userId: string) {
  const db = await getDb();
  return await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

export async function subscribeUser(
  sub: PushSubscriptionJSONInput,
  userId: string,
) {
  try {
    const db = await getDb();
    await db
      .insert(pushSubscriptions)
      .values({
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: userId,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.userId,
        set: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          endpoint: sub.endpoint,
        },
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

export async function unsubscribeUser(userId: string) {
  try {
    const db = await getDb();
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
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

export async function sendPushNotification(
  sub: typeof pushSubscriptions.$inferSelect,
  title: string,
  message: string,
  url: string,
) {
  if (!sub) {
    throw new Error("No subscription available");
  }
  const subscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: title,
        body: message,
        icon: "/images/icon-192x192.png",
        url,
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Push通知の送信に失敗:", error);
    return { success: false, error: "Push通知の送信に失敗しました。" };
  }
}
