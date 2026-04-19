"use client";

import { Item } from "@/lib/db/schema";
import { useActionState } from "react";
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
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateStockLogForm({ items }: CreateStockLogFormProps) {
  const [state, formAction, isPending] = useActionState(
    createStockLog,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品の在庫を追加</CardTitle>
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
                    defaultValue={state.itemId}
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
                  <FieldError message={state.zodErrors?.itemId?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>変動数（単位：個）</FieldLabel>
                  <Input
                    name="difference"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={state.difference}
                  />
                  <FieldError message={state.zodErrors?.difference?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>メモ（任意）</FieldLabel>
                  <Input
                    name="meta"
                    disabled={isPending}
                    defaultValue={state.meta}
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
            disabled={isPending}
          >
            {isPending ? "追加中..." : "在庫を追加"}
          </Button>
        </form>
        {state?.success && <MessagePrompt message={state.message} />}
        {!state?.success && state?.message && (
          <ErrorPrompt error={state.message} />
        )}
      </CardContent>
    </Card>
  );
}
