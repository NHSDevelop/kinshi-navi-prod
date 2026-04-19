"use client";

import { useActionState } from "react";
import { createStore, StoreState } from "./action";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FieldGroup,
  FieldSet,
  Field,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
} from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { storeTypeValues } from "@/lib/db/schema";
import { STORE_TYPE_MAP } from "@/lib/type";

interface CreateStoreProps {
  eventId: string;
}

const INITIAL_STATE: StoreState = {
  slug: "",
  name: "",
  storeType: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function CreateStore({ eventId }: CreateStoreProps) {
  const [state, formAction, isPending] = useActionState(
    createStore,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>店舗を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>識別名</FieldLabel>
                  <FieldDescription>
                    組織のURLに使用される文字列です（重複不可）。小文字英数字とハイフンのみの8~16字で設定してください。後から変更することはできません。
                  </FieldDescription>
                  <Input
                    name="slug"
                    defaultValue={state.slug}
                    disabled={isPending}
                  />
                  <FieldError message={state.zodErrors?.slug?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>店舗名</FieldLabel>
                  <Input
                    name="name"
                    defaultValue={state.name}
                    disabled={isPending}
                  />
                  <FieldError message={state.zodErrors?.name?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>店舗の種類</FieldLabel>
                  <Select name="storeType" required disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="店舗の種類を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {storeTypeValues.map((type) => (
                          <SelectItem key={type} value={type}>
                            {(
                              STORE_TYPE_MAP as Record<
                                string,
                                { label: string }
                              >
                            )[type]?.label ?? type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
          </FieldGroup>
          <input type="hidden" name="eventId" value={eventId} />
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "作成中..." : "店舗を作成"}
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
            別の店舗を作成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
