"use client";

import { createSystemInfo } from "./action";
import { useActionState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  FieldSet,
  Field,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { Textarea } from "@/components/ui/textarea";

export default function CreateSystemInfo() {
  const [state, formAction, isPending] = useActionState(createSystemInfo, null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>システムのお知らせを作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>タイトル</FieldLabel>
                  <Input name="title" disabled={isPending} />
                </Field>
                <Field>
                  <FieldLabel>本文</FieldLabel>
                  <Textarea name="meta" disabled={isPending} />
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
            {isPending ? "作成中..." : "お知らせを作成"}
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
