"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changeEventIsVoting } from "./action";

type Props = {
  eventId: string;
  isVoting: boolean;
};

export default function ChangeEventIsVoting({
  eventId,
  isVoting,
}: Props) {
  const [state, formAction, isPending] = useActionState(changeEventIsVoting, null);
  const isVotingEvent = state?.isVoting ?? isVoting;

  return (
    <div className="space-y-4">
      <form action={formAction} >
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" disabled={isPending} variant="danger">
          {isVotingEvent ? "投票を停止する" : "投票を再開する"}
        </Button>
      </form>
    </div>
  );
}
