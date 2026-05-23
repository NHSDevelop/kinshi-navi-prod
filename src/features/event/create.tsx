"use client";

import { useActionState, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from "date-fns/locale";

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
  const [startedAtDate, setStartedAtDate] = useState<Date | null>(null);
  const [startedAtTime, setStartedAtTime] = useState<string>("");
  const [finishedAtDate, setFinishedAtDate] = useState<Date | null>(null);
  const [finishedAtTime, setFinishedAtTime] = useState<string>("");

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
                <Field>
                  <FieldLabel>開催日</FieldLabel>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <DatePicker
                        selected={startedAtDate}
                        onChange={(date: Date | null) => setStartedAtDate(date)}
                        dateFormat="yyyy/MM/dd"
                        disabled={isPending}
                        locale={ja}
                        className="w-full border px-3 py-2"
                        placeholderText="開始日を選択"
                      />
                      <input
                        type="hidden"
                        name="startedAtDate"
                        value={startedAtDate ? startedAtDate.toISOString() : ""}
                      />
                    </div>
                    <span>〜</span>
                    <div className="flex-1">
                      <DatePicker
                        selected={finishedAtDate}
                        onChange={(date: Date | null) =>
                          setFinishedAtDate(date)
                        }
                        dateFormat="yyyy/MM/dd"
                        disabled={isPending}
                        locale={ja}
                        className="w-full border px-3 py-2"
                        placeholderText="終了日を選択"
                      />
                      <input
                        type="hidden"
                        name="finishedAtDate"
                        value={
                          finishedAtDate ? finishedAtDate.toISOString() : ""
                        }
                      />
                    </div>
                  </div>
                  <FieldError
                    message={
                      state.zodErrors?.startedAtDate?.[0] ||
                      state.zodErrors?.finishedAtDate?.[0]
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>開催時間</FieldLabel>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={startedAtTime}
                        onChange={(e) => setStartedAtTime(e.target.value)}
                        disabled={isPending}
                        name="startedAtTime"
                      />
                    </div>
                    <span>〜</span>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={finishedAtTime}
                        onChange={(e) => setFinishedAtTime(e.target.value)}
                        disabled={isPending}
                        name="finishedAtTime"
                      />
                    </div>
                  </div>
                  <FieldError
                    message={
                      state.zodErrors?.startedAtTime?.[0] ||
                      state.zodErrors?.finishedAtTime?.[0]
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>詳細</FieldLabel>
                  <Textarea name="description" disabled={isPending} />
                  <FieldError message={state.zodErrors?.description?.[0]} />
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
