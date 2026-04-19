"use client";

import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAnonymousUser() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAnonymousUser = async () => {
    setIsPending(true);
    setError(null);
    try {
      const { error } = await authClient.deleteAnonymousUser();
      if (error) {
        console.log(error);
        setError(
          "ゲストユーザーの削除に失敗しました。時間をおいて再度お試しください。",
        );
        return;
      }
      router.push("/user");
    } catch (error) {
      console.log(error);
      setError("ゲストユーザーの削除に失敗しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="danger">ゲストユーザーを削除</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ゲストユーザーの退会</DialogTitle>
            <DialogDescription>
              ユーザーと関連するデータがすべて削除されます。よろしいですか？
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="danger"
            disabled={isPending}
            onClick={handleDeleteAnonymousUser}
          >
            退会する
          </Button>
        </DialogContent>
      </Dialog>
      {error && <ErrorPrompt error={error} />}
    </div>
  );
}
