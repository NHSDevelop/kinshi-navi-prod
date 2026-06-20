"use client";

import { useActionState, useEffect } from "react";
import { cancelTicket } from "./action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

type Props = {
  ticketId: string;
};

export default function CancelTicket({ ticketId }: Props) {
  const [state, formAction, isPending] = useActionState(cancelTicket, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">キャンセルする</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>整理券をキャンセル</DialogTitle>
          <DialogDescription>
            整理券をキャンセルします。キャンセルした整理券は元に戻せませんが、よろしいですか？
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="ticketId" value={ticketId} />
          <Button
            type="submit"
            variant="danger"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "キャンセル中..." : "キャンセルする"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
