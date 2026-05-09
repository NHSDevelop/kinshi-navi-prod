"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { deleteEvent } from "./action";
import { useRouter } from "next/navigation";

type Props = {
  eventId: string;
  pushUrl: string;
};

export default function DeleteEvent({ eventId, pushUrl }: Props) {
  const [state, formAction, isPending] = useActionState(deleteEvent, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(pushUrl);
    }
  }, [router, state?.success, pushUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">イベントを削除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>イベントを削除</DialogTitle>
          <DialogDescription>
            このイベントを削除します。よろしいですか？
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />
          <Button variant="danger" type="submit" disabled={isPending}>
            {isPending ? "削除中..." : "イベントを削除"}
          </Button>
          {state?.success === false && state?.error && (
            <ErrorPrompt error={state.error} />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
