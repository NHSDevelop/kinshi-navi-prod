"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";

export default function CreateAnonymousUser() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInApp, name } = useInAppBrowser();

  const handleCreateAnonymousUser = async () => {
    setIsPending(true);
    setError(null);

    try {
      const { error } = await authClient.signIn.anonymous();
      if (error) {
        setError(
          "ゲストユーザーの作成に失敗しました。時間をおいて再度お試しください。",
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.log(error);
      setError(
        "ゲストユーザーの作成に失敗しました。時間をおいて再度お試しください。",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {isInApp ? (
        <MessagePrompt
          message={
            <div>
              <p className="mb-2">
                現在、アプリ内ブラウザ（{name ?? "InApp WebView"}
                ）で開いています。
              </p>
              <p className="mb-2">
                このブラウザではデータが保持されない場合があるため、デフォルトのブラウザ（Chrome,
                Safariなど）で開いてからゲストユーザーを作成してください。
              </p>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-main-950 md:text-xl">
              ゲストユーザーの作成
            </h2>
            <p className="text-sm text-muted-foreground">
              整理券の発行・人気投票を行うには、ゲストユーザーを作成する必要があります。
            </p>
            <Button onClick={handleCreateAnonymousUser} disabled={isPending}>
              {isPending ? "作成中..." : "ゲストユーザーを作成"}
            </Button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              続行すると
              <Link href="/terms" className="text-main-900 underline">
                利用規約
              </Link>
              と
              <Link href="/policy" className="text-main-900 underline">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
