"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CreateAnonymousUser() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Card>
      <CardHeader>
        <CardTitle>ゲストユーザーの作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            チケットを発行するには、ゲストユーザーを作成する必要があります。
          </p>
          <Button onClick={handleCreateAnonymousUser} disabled={isPending}>
            {isPending ? "作成中..." : "ゲストユーザーを作成"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </CardContent>
      <CardFooter>
        <p>
          続行すると
          <Link href="/terms" className="text-indigo-900 underline">
            利用規約
          </Link>
          と
          <Link href="/policy" className="text-indigo-900 underline">
            プライバシーポリシー
          </Link>
          に同意したことになります。
        </p>
      </CardFooter>
    </Card>
  );
}
