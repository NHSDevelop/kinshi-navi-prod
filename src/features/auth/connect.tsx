"use client";

import { useActionState } from "react";
import { connectStoreOrEvent } from "./action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import Link from "next/link";

export default function ConnectAuthUser() {
  const [state, formAction, isPending] = useActionState(
    connectStoreOrEvent,
    null,
  );
  return (
    <div>
      <form action={formAction} className="space-y-4">
        <p>認証コードを入力</p>
        <div className="flex gap-4">
          <Input name="authCode" required disabled={isPending} />
          <Button type="submit" variant="card">
            紐付ける
          </Button>
        </div>
      </form>
      {state?.success && <MessagePrompt message={state.message} />}
      {!state?.success && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
      {state?.success && (
        <Button asChild variant="card">
          <Link href="/dashboard">管理画面へ</Link>
        </Button>
      )}
    </div>
  );
}
