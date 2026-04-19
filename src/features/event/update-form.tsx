"use client";

import { useActionState, useEffect, useState } from "react";
import { updateEventConfig } from "./action";
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
import { Event } from "@/lib/db/schema";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { UpdateEventConfigState } from "./action";

interface updateEventConfigFormProps {
  event: Event; //isActiveを取得するためEvent型
}

const INITIAL_STATE: UpdateEventConfigState = {
  name: "",
  startedAtDate: "",
  startedAtTime: "",
  finishedAtDate: "",
  finishedAtTime: "",
  description: "",
  zodErrors: null,
  message: null,
  error: null,
  success: false,
};

export default function UpdateEventConfigForm({
  event,
}: updateEventConfigFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateEventConfig,
    INITIAL_STATE,
  );
  const [startedAtDate, setStartedAtDate] = useState<Date | null>(
    event.startedAtDate ? new Date(event.startedAtDate) : null,
  );
  const [startedAtTime, setStartedAtTime] = useState<string>(
    event.startedAtTime || "",
  );
  const [finishedAtDate, setFinishedAtDate] = useState<Date | null>(
    event.finishedAtDate ? new Date(event.finishedAtDate) : null,
  );
  const [finishedAtTime, setFinishedAtTime] = useState<string>(
    event.finishedAtTime || "",
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/dashboard/admin/event/${event.id}`);
    }
  }, [state, router, event.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>イベント情報の編集</CardTitle>
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
                    type="string"
                    required
                    disabled={isPending}
                    defaultValue={state.name || event.name}
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
                  <Textarea
                    name="description"
                    disabled={isPending}
                    defaultValue={state.description || event.description || ""}
                  />
                  <FieldError message={state.zodErrors?.description?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="eventId" value={event.id} />
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
