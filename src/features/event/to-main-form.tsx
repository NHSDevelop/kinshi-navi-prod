"use client";

import { useActionState, useState } from "react";
import { toMainEvent } from "./action";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Event } from "@/lib/db/schema";

type Props = {
  events: Event[];
};

export default function ToMainEventForm({ events }: Props) {
  const [state, formAction, isPending] = useActionState(toMainEvent, null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <div className="flex gap-2">
          <Select onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="イベントを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <input type="hidden" name="eventId" value={selectedEventId} />
          <Button type="submit" disabled={isPending}>
            メインイベントにする
          </Button>
        </div>
      </form>
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
