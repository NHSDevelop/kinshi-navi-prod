"use client";

import { Role, InviteTargetRole } from "@/lib/db/schema";
import { useActionState, useState } from "react";
import { createInvite } from "./action";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { AiFillCopy } from "react-icons/ai";
import { AiFillCheckCircle } from "react-icons/ai";

interface IssueInviteLinkProps {
  issuerScope: Role;
  targetScope: InviteTargetRole;
  organizationId?: string;
  eventId?: string;
  storeId?: string;
}

export default function IssueInviteLink({
  issuerScope,
  targetScope,
  organizationId,
  eventId,
  storeId,
}: IssueInviteLinkProps) {
  const [state, formAction, isPending] = useActionState(createInvite, null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState<string | null>(null);

  const handleCopyInviteUrl = async () => {
    if (!state?.inviteUrl) return;

    await navigator.clipboard.writeText(state.inviteUrl);
    setCopiedInviteUrl(state.inviteUrl);
  };

  return (
    <div>
      <form action={formAction}>
        <FieldGroup>
          <FieldTitle>招待リンクを作成する</FieldTitle>
          <FieldContent>
            <input type="hidden" name="issuerScope" value={issuerScope} />
            <input type="hidden" name="targetScope" value={targetScope} />
            {organizationId && (
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
            )}
            {eventId && <input type="hidden" name="eventId" value={eventId} />}
            {storeId && <input type="hidden" name="storeId" value={storeId} />}
            <Field>
              <FieldDescription>
                リンクの使用可能回数（1~10回）を設定
              </FieldDescription>
              <Input
                type="number"
                name="maxUses"
                min={1}
                max={10}
                defaultValue={1}
                disabled={isPending}
              />
            </Field>
            <Field></Field>
          </FieldContent>
        </FieldGroup>

        <Button
          type="submit"
          variant="card"
          className="mt-4"
          disabled={isPending}
        >
          {isPending ? "作成中..." : "リンクを作成"}
        </Button>
      </form>
      <div className="flex flex-col gap-4 mt-4">
        {state?.success && state?.inviteUrl && (
          <FieldGroup className="py-4">
            <Field>
              <FieldDescription>
                発行済みの招待リンク（有効期限は1週間です。）
              </FieldDescription>
              <FieldContent>
                <div className="flex">
                  <Input value={state.inviteUrl} readOnly />
                  <Button type="button" onClick={handleCopyInviteUrl}>
                    {copiedInviteUrl === state.inviteUrl ? (
                      <AiFillCheckCircle />
                    ) : (
                      <AiFillCopy />
                    )}
                  </Button>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
        )}
        {state?.message && <MessagePrompt message={state.message} />}
        {state?.error && <ErrorPrompt error={state.error} />}
      </div>
    </div>
  );
}
