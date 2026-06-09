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
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

type EventOption = { id: string; name: string, authCode: string | null };

interface Props {
  events: EventOption[];
}

export default function SelectEventAuthCode({
  events,
}: Props) {
  const [selectedAuthCode, setSelectedAuthCode] = useState<string>("");

  return (
    <>
      {events.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Select onValueChange={setSelectedAuthCode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="イベントを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.authCode ?? "未設定"}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedAuthCode ? (
            <p>認証コード:{selectedAuthCode}</p>
          ) : (
            <p>店舗を選択してください</p>
          )}
        </div>
      ) : (
        <NotFoundPrompt context="イベント" />
      )}
    </>
  );
}
