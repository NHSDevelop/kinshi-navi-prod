/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { getUserSubscription, subscribeUser, unsubscribeUser } from "./action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationManagerProps {
  userId: string;
}

export function PushNotificationManager({
  userId,
}: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const isRegistering = useRef(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function registerServiceWorker() {
    if (isRegistering.current) return;
    isRegistering.current = true;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      const client_sub = await registration.pushManager.getSubscription();

      if (client_sub) {
        const db_sub = await getUserSubscription(userId);
        if (db_sub.length === 0) {
          await client_sub.unsubscribe();
          setSubscription(null);
          return;
        }
      }

      setSubscription(client_sub);
    } catch (error) {
      console.error("SW registration failed:", error);
    } finally {
      isRegistering.current = false;
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      if (permission !== "granted") {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== "granted") {
          setIsLoading(false);
          return;
        }
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub, userId);
      setSubscription(sub);
    } catch (error) {
      console.error("購読エラー:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      await subscription?.unsubscribe();
      await unsubscribeUser(userId);
      setSubscription(null);
    } catch (error) {
      console.error("解除エラー:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">
          お使いのブラウザはプッシュ通知をサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プッシュ通知の購読設定</CardTitle>
        <CardDescription>
          プッシュ通知を有効にすると、チケットの呼び出しなどの情報をリアルタイムで受け取ることができます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-8">
        {subscription ? (
          <>
            <p>状態：プッシュ通知が有効です。</p>
            <Button
              variant="warn"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
            >
              {isLoading ? "処理中..." : "プッシュ通知を無効にする"}
            </Button>
          </>
        ) : (
          <>
            <p>状態：プッシュ通知が無効です。</p>
            <Button onClick={subscribeToPush} disabled={isLoading}>
              {isLoading ? "処理中..." : "プッシュ通知を有効にする"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
