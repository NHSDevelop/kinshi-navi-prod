"use client";

import { Store, StoreType } from "@/lib/db/schema";
import { useActionState } from "react";
import { createStoreVote } from "./action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { STORE_TYPE_MAP } from "@/lib/type";

type Props = {
  userId: string;
  stores: Store[];
  storeType: StoreType;
};

export default function CreateStoreVoteForm({
  userId,
  stores,
  storeType,
}: Props) {
  const [state, formAction, isPending] = useActionState(createStoreVote, null);
  const storeTypeLabel =
    STORE_TYPE_MAP[storeType as keyof typeof STORE_TYPE_MAP]?.label ??
    storeType;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${storeTypeLabel}投票`}</CardTitle>
        <CardDescription>
          ※投票はユーザー一人につき企画・模擬店ごとに一回まで可能です。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="storeType" value={storeType} />
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>{`投票する${storeTypeLabel}`} </FieldLabel>
                  <Select name="storeId" required disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder={`${storeTypeLabel}を選択`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {stores
                          .filter((store) => store.storeType === storeType)
                          .map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
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

          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "投票中..." : "投票する"}
          </Button>
        </form>
        <div className="pt-4 space-y-4">
          {state?.success && <MessagePrompt message={state.message} />}

          {state?.success === false && state?.message && (
            <ErrorPrompt error={state.message} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
