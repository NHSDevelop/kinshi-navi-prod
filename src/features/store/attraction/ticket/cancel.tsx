"use client";

import { useActionState } from "react";
import { cancelTicket } from "./action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Props = {
    ticketId: string;
}

export default function CancelTicket({ticketId}: Props) {
    const[state, formAction, isPending] = useActionState(cancelTicket, null);
    return (
        <form action={formAction}>
            <input type="hidden" name="ticketId" value={ticketId} />
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
            <Button type="submit" variant="danger" disabled={isPending}>
              {isPending ? "キャンセル中..." : "キャンセルする"}
            </Button>
          </DialogContent>
        </Dialog>
        </form>
    )
}