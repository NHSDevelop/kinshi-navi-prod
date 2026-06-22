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

type StoreOption = { id: string; name: string; authCode: string | null };

interface Props {
  stores: StoreOption[];
}

export default function SelectStoreAuthCode({ stores }: Props) {
  const [selectedAuthCode, setSelectedAuthCode] = useState<string>("");

  return (
    <>
      {stores.length > 0 ? (
        <div className="flex flex-col gap-4">
          <Select onValueChange={setSelectedAuthCode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="店舗を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.authCode ?? "未設定"}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedAuthCode ? (
            <p>認証コード：{selectedAuthCode}</p>
          ) : (
            <p>店舗を選択してください</p>
          )}
        </div>
      ) : (
        <NotFoundPrompt context="店舗" />
      )}
    </>
  );
}
