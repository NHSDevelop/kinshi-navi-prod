"use client";

import { useActionState } from "react";
import { toActiveEvent } from "./action";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

type Props = {
  eventId: string;
  isActive: boolean;
};

export default function ToActiveEvent({ eventId, isActive }: Props) {
  const [state, formAction, isPending] = useActionState(toActiveEvent, null);
  const isActiveEvent = state?.isActive ?? isActive;

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" disabled={isPending}>
          {isActiveEvent ? "イベントを停止する" : "イベントを開催する"}
        </Button>
      </form>
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
