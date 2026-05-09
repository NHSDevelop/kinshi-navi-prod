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

type ItemOption = { id: string; name: string };

interface ItemSelectLinkClientProps {
  items: ItemOption[];
  href: string;
  context: string;
}

export default function ItemSelectLinkClient({
  items,
  href,
  context,
}: ItemSelectLinkClientProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  return (
    <div className="flex gap-4 items-center">
      <Select onValueChange={setSelectedItemId}>
        <SelectTrigger>
          <SelectValue placeholder="商品を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selectedItemId ? (
        <Button asChild variant="card">
          <Link href={`${href}/${selectedItemId}`}>{context}</Link>
        </Button>
      ) : (
        <p>商品を選択してください</p>
      )}
    </div>
  );
}
