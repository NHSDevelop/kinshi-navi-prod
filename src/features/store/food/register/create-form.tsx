"use client";

import { useActionState } from "react";
import { createRegisterLog, RegisterLogState } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { FieldError } from "@/components/ui/field-error";

interface CreateRegisterLogFormProps {
  foodId: string;
}

const INITIAL_STATE: RegisterLogState = {
  foodId: "",
  totalAmount: "",
  amountPaid: "",
  meta: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateRegisterLogForm({
  foodId,
}: CreateRegisterLogFormProps) {
  const [state, formAction, isPending] = useActionState(
    createRegisterLog,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>会計を記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <input type="hidden" name="foodId" value={foodId} />
              <FieldGroup>
                <Field>
                  <FieldLabel>合計金額</FieldLabel>
                  <Input
                    name="totalAmount"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={state.totalAmount}
                  />
                  <FieldError message={state.zodErrors?.totalAmount?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>受取金額</FieldLabel>
                  <Input
                    name="amountPaid"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={state.amountPaid}
                  />
                  <FieldError message={state.zodErrors?.amountPaid?.[0]} />
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
            {isPending ? "記録中..." : "会計を記録"}
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
