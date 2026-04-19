"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSystemInfo } from "./action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { Textarea } from "@/components/ui/textarea";
import { SystemInfo } from "@/lib/db/schema";
import { UpdateSystemInfoState } from "./action";

interface updateSystemInfoFormProps {
  systemInfo: SystemInfo;
}

const INITIAL_STATE: UpdateSystemInfoState = {
  title: "",
  meta: "",
  zodErrors: null,
  success: false,
  message: null,
  error: null,
};

export default function UpdateSystemInfoForm({
  systemInfo,
}: updateSystemInfoFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateSystemInfo,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/system-info/${systemInfo.id}`);
    }
  }, [state, router, systemInfo.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>お知らせの編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>タイトル</FieldLabel>
                  <Input
                    name="title"
                    required
                    disabled={isPending}
                    defaultValue={state.title || systemInfo.title}
                  />
                  <FieldError message={state.zodErrors?.title?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>本文</FieldLabel>
                  <Textarea
                    name="meta"
                    disabled={isPending}
                    defaultValue={state.meta || systemInfo.meta}
                  />
                  <FieldError message={state.zodErrors?.meta?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="systemInfoId" value={systemInfo.id} />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "反映中..." : "変更を反映"}
          </Button>
        </form>
        <div className="space-y-4 lg:space-y-8">
          {state?.message && <MessagePrompt message={state.message} />}
          {state?.error && <ErrorPrompt error={state.error} />}
        </div>
      </CardContent>
    </Card>
  );
}
