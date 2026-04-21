"use client";

import { useActionState } from "react";
import { createEvent, EventState } from "./action";
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

const INITIAL_STATE: EventState = {
  name: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateEvent() {
  const [state, formAction, isPending] = useActionState(
    createEvent,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>イベントを作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>イベント名</FieldLabel>
                  <Input
                    name="name"
                    defaultValue={state.name}
                    disabled={isPending}
                  />
                  <FieldError message={state.zodErrors?.name?.[0]} />
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
            {isPending ? "作成中..." : "イベントを作成"}
          </Button>
        </form>
        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
        )}
        {state?.success && (
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            別のイベントを作成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
