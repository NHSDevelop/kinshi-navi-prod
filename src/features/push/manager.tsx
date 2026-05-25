/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPushPublicKey,
  getUserSubscription,
  subscribeUser,
  unsubscribeUser,
} from "./action";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export function PushNotificationManager() {
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
        const db_sub_length = await getUserSubscription();

        if (db_sub_length === 0) {
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

      const vapidPublicKey = await getPushPublicKey();

      if (!vapidPublicKey) {
        throw new Error("VAPID公開鍵が設定されていません。");
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const serializedSub = JSON.parse(JSON.stringify(sub));
      const result = await subscribeUser(serializedSub);

      if (!result?.success) {
        await sub.unsubscribe();
        throw new Error(
          result?.message ??
            result?.error ??
            "プッシュ通知の購読に失敗しました。",
        );
      }

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
      await unsubscribeUser();
      setSubscription(null);
    } catch (error) {
      console.error("無効化エラー:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          お使いのブラウザはプッシュ通知をサポートしていません。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {subscription ? (
        <>
          <Alert variant="success">
            <AlertDescription>状態：プッシュ通知が有効です。</AlertDescription>
          </Alert>
          <Button
            variant="warn"
            onClick={unsubscribeFromPush}
            disabled={isLoading}
          >
            {isLoading ? "処理中..." : "通知を無効化"}
          </Button>
        </>
      ) : (
        <>
          <Alert variant="warn">
            <AlertDescription>プッシュ通知が無効です。</AlertDescription>
          </Alert>
          <Button
            onClick={subscribeToPush}
            disabled={isLoading}
            variant="success"
          >
            {isLoading ? "処理中..." : "通知を有効化"}
          </Button>
        </>
      )}
    </div>
  );
}
