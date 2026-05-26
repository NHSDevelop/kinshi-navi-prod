/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { MessagePrompt } from "@/components/prompt/message-prompt";

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
    return (
      <div className="flex flex-col gap-4">
        <MessagePrompt message="PWAとしてインストール済みです。" />
        <MessagePrompt message="アンインストールする際、取得した整理券のデータは失われますのでご注意ください。" />
      </div>
    );
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
        <div className="flex flex-col gap-4">
          <Button onClick={handleInstall} disabled={isInstalling}>
            {isInstalling ? "確認中..." : "インストールする"}
          </Button>
        </div>
      )}
      {isIOS && !deferredPrompt && (
        <div className="flex flex-col gap-4">
          <p className="text-sm md:text-base">
            お使いのデバイスでは、次の手順のようにしてWebアプリをインストールします。
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="card">インストール手順を表示</Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>iPhone/iPadへのインストール方法</DialogTitle>
                <DialogDescription>
                  下の画像の手順に従ってインストールしてください。
                </DialogDescription>
                <Carousel className="mx-auto w-full max-w-[min(84vw,420px)]">
                  <CarouselContent className="ml-0">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <CarouselItem key={index} className="basis-full pl-0">
                        <div className="p-1 sm:p-2">
                          <Image
                            src={`/images/screenshots/help-install-pwa/${index + 1}.webp`}
                            alt={`インストール手順画像の${index + 1}枚目`}
                            width={1080}
                            height={2340}
                            className="mx-auto h-auto max-h-[70vh] w-full rounded-lg object-contain"
                            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 58vw, 420px"
                            quality={90}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                </Carousel>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
