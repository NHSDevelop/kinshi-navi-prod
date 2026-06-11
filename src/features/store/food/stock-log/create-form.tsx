"use client";

import { Item } from "@/lib/db/schema";
import { useActionState, useState, useEffect } from "react";
import createStockLog, { StockLogState } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { FieldError } from "@/components/ui/field-error";

interface CreateStockLogFormProps {
  items: Item[];
}

const INITIAL_STATE: StockLogState = {
  itemId: "",
  difference: "",
  meta: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateStockLogForm({ items }: CreateStockLogFormProps) {
  const [state, formAction, isPending] = useActionState(
    createStockLog,
    INITIAL_STATE,
  );

  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [difference, setDifference] = useState<string>("");
  const [meta, setMeta] = useState<string>("");

  const selectedItem = items.find((item) => item.id === selectedItemId);

  useEffect(() => {
    if (state.success) {
      setSelectedItemId("");
      setDifference("");
      setMeta("");
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品の在庫を調整</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>商品</FieldLabel>
                  <Select
                    name="itemId"
                    required
                    disabled={isPending}
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="商品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (現在: {item.stock}個)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError message={state.zodErrors?.itemId?.[0]} />
                </Field>
                
                <Field>
                  <FieldLabel>変動数（単位：個）</FieldLabel>
                  <Input
                    name="difference"
                    type="number"
                    required
                    disabled={isPending}
                    value={difference}
                    onChange={(e) => setDifference(e.target.value)}
                    placeholder="仕入れは正の数、廃棄などは負の数を入力"
                  />
                  <FieldError message={state.zodErrors?.difference?.[0]} />
                  {selectedItem && difference && parseInt(difference) < 0 && (
                    selectedItem.stock + parseInt(difference) < 0
                  ) && (
                    <FieldError
                      message={`在庫不足です。現在の在庫(${selectedItem.stock}個)を超える減算はできません。`}
                    />
                  )}
                </Field>
                
                <Field>
                  <FieldLabel>メモ（任意）</FieldLabel>
                  <Input
                    name="meta"
                    disabled={isPending}
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    placeholder="例: 定期仕入れ、廃棄処分など"
                  />
                  <FieldError message={state.zodErrors?.meta?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={
              !!(isPending || 
              (selectedItem && difference && parseInt(difference) < 0 && selectedItem.stock + parseInt(difference) < 0))
            }
          >
            {isPending ? "更新中..." : "在庫を更新"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          {state?.success && <MessagePrompt message={state.message} />}
          {!state?.success && state?.message && (
            <ErrorPrompt error={state.message} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}