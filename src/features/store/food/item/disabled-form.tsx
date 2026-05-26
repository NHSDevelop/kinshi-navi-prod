"use client";

import { useActionState, useState } from "react";
import { disabledItem } from "./action";
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

export default function DisabledItemForm({ items }: Props) {
  const [state, formAction, isPending] = useActionState(disabledItem, null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  return (
    <div className="flex gap-2">
      <Select
        name="itemId"
        onValueChange={setSelectedItemId}
        disabled={isPending}
      >
        <SelectTrigger>
          <SelectValue placeholder="削除する商品" />
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
          <Button variant="danger">商品を削除</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品を削除</DialogTitle>
            <DialogDescription>
              商品に関連する会計履歴・在庫履歴は保持されます。削除してもよろしいですか？
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="itemId" value={selectedItemId} />
            <Button variant="danger" type="submit" disabled={isPending}>
              {isPending ? "削除中..." : "商品を削除"}
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
