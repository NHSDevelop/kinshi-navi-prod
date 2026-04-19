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

type StoreOption = { id: string; name: string };

interface StoreSelectLinkProps {
  stores: StoreOption[];
  href: string;
  context: string;
}

export default function StoreSelectLink({
  stores,
  href,
  context,
}: StoreSelectLinkProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  return (
    <div className="flex gap-4 items-center">
      <Select onValueChange={setSelectedStoreId}>
        <SelectTrigger>
          <SelectValue placeholder="店舗を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedStoreId ? (
        <Button asChild variant="card">
          <Link href={`${href}/${selectedStoreId}`}>{context}</Link>
        </Button>
      ) : (
        <p>店舗を選択してください</p>
      )}
    </div>
  );
}
