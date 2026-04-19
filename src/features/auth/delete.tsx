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
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAuthUser() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const handleDeleteAuthUser = async () => {
    setIsPending(true);
    setError(null);
    try {
      const { error } = await authClient.deleteUser({
        password: password,
      });
      if (error) {
        console.log(error);
        setError(
          "ユーザーの削除に失敗しました。時間をおいて再度お試しください。",
        );
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      setError("ユーザーの削除に失敗しました。");
    } finally {
      setIsPending(false);
      setPassword("");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="danger">ユーザー退会</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー退会</DialogTitle>
            <DialogDescription>
              ユーザーと関連するデータがすべて削除されます。よろしいですか？
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={password}
            placeholder="パスワードを入力"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="danger"
            disabled={isPending}
            onClick={handleDeleteAuthUser}
          >
            退会する
          </Button>
        </DialogContent>
      </Dialog>
      {error && <ErrorPrompt error={error} />}
    </div>
  );
}
