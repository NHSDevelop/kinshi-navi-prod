"use client";

import { useActionState, useState } from "react";
import { disabledItem, resetItemSoldStock } from "./action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { Item } from "@/lib/db/schema";

type Props = {
  items: Item[];
};

export default function ResetItemSoldStockForm({ items }: Props) {
  const [state, formAction, isPending] = useActionState(
    resetItemSoldStock,
    null,
  );
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  return (
    <div className="flex gap-2">
      <Select
        name="itemId"
        onValueChange={setSelectedItemId}
        disabled={isPending}
      >
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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="danger">商品の総在庫数を反映</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品の総在庫数を反映</DialogTitle>
            <DialogDescription>
              商品の総在庫数が現在の在庫数に反映されます。
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="itemId" value={selectedItemId} />
            <Button variant="danger" type="submit" disabled={isPending}>
              {isPending ? "反映中..." : "反映する"}
            </Button>
            {state?.success === false && state?.message && (
              <ErrorPrompt error={state.message} />
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
