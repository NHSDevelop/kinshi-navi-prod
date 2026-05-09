"use client";

import { useActionState } from "react";
import { toMainEvent } from "./action";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

type Props = {
  eventId: string;
  isMain: boolean;
};

export default function ToMainEvent({ eventId, isMain }: Props) {
  const [state, formAction, isPending] = useActionState(toMainEvent, null);
  const isMainEvent = state?.isMain ?? isMain;

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" disabled={isPending}>
          {isMainEvent ? "メインイベントから外す" : "メインイベントにする"}
        </Button>
      </form>
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
