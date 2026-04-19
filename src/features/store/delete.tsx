"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { deleteStore } from "./action";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { useRouter } from "next/navigation";

type Props = {
  storeId: string;
  pushUrl: string;
};

export default function DeleteStore({ storeId, pushUrl }: Props) {
  const [state, formAction, isPending] = useActionState(deleteStore, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(pushUrl);
    }
  }, [router, state?.success, pushUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">店舗を削除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>店舗を削除</DialogTitle>
          <DialogDescription>
            この店舗と関連するデータがすべて削除されます。よろしいですか？
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="storeId" value={storeId} />
          <Button variant="danger" type="submit" disabled={isPending}>
            {isPending ? "削除中..." : "店舗を削除"}
          </Button>
          {state?.success === false && state?.error && (
            <ErrorPrompt error={state.error} />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
