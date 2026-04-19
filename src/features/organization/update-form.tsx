"use client";

import { useActionState } from "react";
import { updateOrganizationConfig } from "./action";
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
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { Organization } from "@/lib/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UpdateOrganizationConfigState } from "./action";

interface updateOrganizationConfigFormProps {
  organization: Organization; //isActiveを取得するためOrganization型
}

const INITIAL_STATE: UpdateOrganizationConfigState = {
  name: "",
  description: "",
  zodErrors: null,
  message: null,
  error: null,
  success: false,
};

export default function UpdateOrganizationConfigForm({
  organization,
}: updateOrganizationConfigFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateOrganizationConfig,
    INITIAL_STATE,
  );
  useEffect(() => {
    if (state?.success) {
      router.push(`/dashboard/admin/organization/${organization.id}`);
    }
  }, [state, router, organization.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>組織情報の編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>組織名</FieldLabel>
                  <Input
                    name="name"
                    type="string"
                    required
                    disabled={isPending}
                    defaultValue={state.name || organization.name}
                  />
                  <FieldError message={state.zodErrors?.name?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>詳細</FieldLabel>
                  <Textarea
                    name="description"
                    disabled={isPending}
                    defaultValue={
                      state.description || organization.description || ""
                    }
                  />
                  <FieldError message={state.zodErrors?.description?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input
              type="hidden"
              name="organizationId"
              value={organization.id}
            />
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
