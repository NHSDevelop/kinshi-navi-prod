"use server";

import { getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { pushSubscriptions } from "@/lib/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { eq } from "drizzle-orm";
import webpush from "web-push";

const vapidSubject = "mailto:support@kinshi-navi.com";
let isWebPushConfigured = false;

function configureWebPush() {
  if (isWebPushConfigured) {
    return;
  }

  const publicKey = getRuntimeEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  const privateKey = getRuntimeEnv("VAPID_PRIVATE_KEY");

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured.");
  }

  webpush.setVapidDetails(vapidSubject, publicKey, privateKey);
  isWebPushConfigured = true;
}

export type PushSubscriptionJSONInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};

export async function getPushPublicKey() {
  return getRuntimeEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY") ?? null;
}

export async function getUserSubscription(): Promise<number> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return 0;
  }

  const db = await getDb();
  const subRows = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, user.id));
  return subRows.length;
}

export async function subscribeUser(sub: PushSubscriptionJSONInput) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "匿名ユーザーを作成して下さい。",
      };
    }

    const db = await getDb();
    await db
      .insert(pushSubscriptions)
      .values({
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: user.id,
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

export async function unsubscribeUser() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "匿名ユーザーを作成して下さい。",
      };
    }

    const db = await getDb();
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));
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

  configureWebPush();

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
