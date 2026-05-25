/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { GoShare } from "react-icons/go";
import { AiOutlinePlusSquare } from "react-icons/ai";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator &&
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true),
    );

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  if (isInstalled) {
    return null;
  }

  async function handleInstall() {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setIsInstalling(false);
    setDeferredPrompt(null);

    if (result.outcome === "accepted") {
      return;
    }
  }

  return (
    <div className="space-y-4">
      {deferredPrompt && (
        <div className="flex items-center gap-2">
          <Button onClick={handleInstall} disabled={isInstalling}>
            {isInstalling ? "確認中..." : "インストールする"}
          </Button>
        </div>
      )}
      {isIOS && !deferredPrompt && (
        <div className="flex">
          <p className="text-sm md:text-base">
            お使いのデバイスにアプリをインストールするには、
          </p>
          <GoShare />
          <p className="text-sm md:text-base">から</p>
          <AiOutlinePlusSquare />
          <p className="text-sm md:text-base">
            「ホーム画面に追加」を押してください。
          </p>
        </div>
      )}
      {!isIOS && !deferredPrompt && (
        <p className="text-sm text-muted-foreground">
          このブラウザではインストール可能になるとボタンが表示されます。
        </p>
      )}
    </div>
  );
}
