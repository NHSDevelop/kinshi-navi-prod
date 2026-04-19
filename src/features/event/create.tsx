"use client";

import { useActionState } from "react";
import { createEvent, EventState } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

interface CreateEventProps {
  organizationId: string;
}

const INITIAL_STATE: EventState = {
  slug: "",
  name: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateEvent({ organizationId }: CreateEventProps) {
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
                  <FieldLabel>識別名</FieldLabel>
                  <FieldDescription>
                    イベントのURLに使用されます（重複不可）。小文字の英数字とハイフンのみの8~16字で設定してください。後から変更することはできません。
                  </FieldDescription>
                  <Input
                    name="slug"
                    defaultValue={state.slug}
                    disabled={isPending}
                  />
                  <FieldError message={state.zodErrors?.slug?.[0]} />
                </Field>
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
          <input type="hidden" name="organizationId" value={organizationId} />
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
