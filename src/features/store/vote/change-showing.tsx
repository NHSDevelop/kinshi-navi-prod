"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changeEventIsVoteShowing } from "./action";

type Props = {
  eventId: string;
  isVoteShowing: boolean;
};

export default function ChangeEventIsVoteShowing({
  eventId,
  isVoteShowing,
}: Props) {
  const [state, formAction, isPending] = useActionState(changeEventIsVoteShowing, null);
  const isVoteShowingEvent = state?.isVoteShowing ?? isVoteShowing;

  return (
    <div className="space-y-4">
      <form action={formAction} >
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" disabled={isPending} variant="danger">
          {isVoteShowingEvent ? "投票結果を非公開にする" : "投票結果を公開する"}
        </Button>
      </form>
    </div>
  );
}
