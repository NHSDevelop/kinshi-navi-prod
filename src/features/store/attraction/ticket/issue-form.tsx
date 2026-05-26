"use client";

import { useActionState, useState } from "react";
import { createTicket, TicketState } from "./action";
import { Store } from "@/lib/db/schema";
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
import { FieldError } from "@/components/ui/field-error";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineUser } from "react-icons/ai";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IssueTicketFormProps {
  stores: Store[];
  isPaper: boolean;
  storeId?: string;
}

const INITIAL_STATE: TicketState = {
  numberOfPeople: "",
  zodErrors: null,
  message: null,
  success: false,
};

export function IssueTicketForm({
  stores,
  isPaper,
  storeId,
}: IssueTicketFormProps) {
  const createTicketWithPaperMode = createTicket.bind(null, isPaper);
  const [state, formAction, isPending] = useActionState(
    createTicketWithPaperMode,
    INITIAL_STATE,
  );
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>整理券を発行</CardTitle>
        {isPaper === false && (
          <CardDescription>
            ※整理券はユーザー一人につき一枚まで取得可能です。
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                {storeId ? (
                  <input type="hidden" name="storeId" value={storeId} />
                ) : (
                  <Field>
                    <FieldLabel>発行する企画</FieldLabel>
                    <Select name="storeId" required disabled={isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="企画を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
                <Field>
                  <FieldLabel>人数</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      name="numberOfPeople"
                      type="hidden"
                      required
                      disabled={isPending}
                      value={numberOfPeople}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={() => setNumberOfPeople((prev) => prev - 1)}
                      disabled={isPending || numberOfPeople <= 1}
                    >
                      <AiOutlineMinus />
                    </Button>
                    <div className="w-12 text-center text-lg font-semibold">
                      {numberOfPeople}
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() => setNumberOfPeople((prev) => prev + 1)}
                    >
                      <AiOutlinePlus />
                    </Button>
                  </div>
                  <FieldError message={state.zodErrors?.numberOfPeople?.[0]} />
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
            {isPending ? "発行中..." : "整理券を発行"}
          </Button>
        </form>
        <div className="pt-4 space-y-4">
          {state?.success && <MessagePrompt message={state.message} />}
          {state?.success && isPaper === false && (
            <Alert>
              <AlertDescription>
                <p className="text-sm md:text-base">
                  取得した整理券はユーザーページから確認できます。
                </p>
              </AlertDescription>
            </Alert>
          )}
          {state?.success && isPaper === true && state?.issuedNumber && (
            <MessagePrompt
              message={`発行された整理券の番号は${state?.issuedNumber}です。整理券用紙に企画名と番号を記入し、来場者に渡してください。`}
            />
          )}
          {!state?.success && state?.message && (
            <ErrorPrompt error={state.message} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
