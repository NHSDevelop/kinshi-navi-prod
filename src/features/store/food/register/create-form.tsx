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
import { RegisterLane } from "@/lib/db/schema";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";

interface CreateRegisterLogFormProps {
  foodId: string;
  lanes: RegisterLane[];
}

const INITIAL_STATE: RegisterLogState = {
  foodId: "",
  totalAmount: "",
  amountPaid: "",
  meta: "",
  laneId: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateRegisterLogForm({
  foodId,
  lanes,
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
                  <FieldLabel>レーン番号</FieldLabel>
                  <Select name="storeType" required disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="レーン番号を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {lanes.map((lane) => (
                          <SelectItem key={lane.id} value={lane.id}>
                            {lane.laneNumber}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
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
