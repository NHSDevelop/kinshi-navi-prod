"use client";

import { useActionState } from "react";
import { createItem, ItemState } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { useRouter } from "next/navigation";

interface CreateItemProps {
  foodId: string;
}

const INITIAL_STATE: ItemState = {
  name: "",
  price: "",
  zodErrors: null,
  message: null,
  success: false,
};

export function CreateItem({ foodId }: CreateItemProps) {
  const [state, formAction, isPending] = useActionState(
    createItem,
    INITIAL_STATE,
  );
  const router = useRouter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>商品を登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel>商品名</FieldLabel>
                <Input
                  name="name"
                  required
                  disabled={isPending}
                  defaultValue={state.name}
                />
                <FieldError message={state.zodErrors?.name?.[0]} />
              </Field>
              <Field>
                <FieldLabel>価格（円）</FieldLabel>
                <Input
                  name="price"
                  type="number"
                  required
                  disabled={isPending}
                  defaultValue={state.price}
                />
                <FieldError message={state.zodErrors?.price?.[0]} />
              </Field>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="foodId" value={foodId} />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "登録中..." : "商品を登録"}
          </Button>
        </form>

        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
        )}
        {state?.success && (
          <Button
            onClick={() => {
              router.refresh();
            }}
          >
            別の商品を登録
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
