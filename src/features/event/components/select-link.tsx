"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type EventOption = { id: string; name: string };

interface EventSelectLinkProps {
  events: EventOption[];
  href: string;
  context: string;
}

export default function EventSelectLink({
  events,
  href,
  context,
}: EventSelectLinkProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  return (
    <div className="flex gap-4 items-center">
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

      {selectedEventId ? (
        <Button asChild variant="card">
          <Link href={`${href}/${selectedEventId}`}>{context}</Link>
        </Button>
      ) : (
        <p>イベントを選択してください</p>
      )}
    </div>
  );
}
