"use client";

import { useActionState } from "react";
import { updateAttractionConfig, AttractionConfigState } from "./action";
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
import { Attraction } from "@/lib/db/schema";

interface UpdateAttractionConfigProps {
  attraction: Attraction;
}

const INITIAL_STATE: AttractionConfigState = {
  playTime: "",
  peopleCapacity: "",
  maxGroups: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function UpdateAttractionConfigForm({
  attraction,
}: UpdateAttractionConfigProps) {
  const [state, formAction, isPending] = useActionState(
    updateAttractionConfig,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>企画情報の編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>一組当たりのプレイ時間</FieldLabel>
                  <Input
                    name="playTime"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={state.playTime ?? attraction.playTime ?? 5}
                  />
                  <FieldError message={state.zodErrors?.playTime?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>一組当たりの最大人数</FieldLabel>
                  <Input
                    name="peopleCapacity"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={
                      state.peopleCapacity ?? attraction.peopleCapacity ?? 5
                    }
                  />
                  <FieldError message={state.zodErrors?.peopleCapacity?.[0]} />
                </Field>
                <Field>
                  <FieldLabel>会場内の最大組数</FieldLabel>
                  <Input
                    name="maxGroups"
                    type="number"
                    required
                    disabled={isPending}
                    defaultValue={state.maxGroups ?? attraction.maxGroups ?? 1}
                  />
                  <FieldError message={state.zodErrors?.maxGroups?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="attractionId" value={attraction.id} />
            <Button
              type="submit"
              variant="card"
              className="mt-4"
              disabled={isPending}
            >
              {isPending ? "反映中..." : "変更を反映"}
            </Button>
          </FieldGroup>
        </form>
        {state?.success && <MessagePrompt message={state.message} />}
        {!state?.success && state?.message && (
          <ErrorPrompt error={state.message} />
        )}
      </CardContent>
    </Card>
  );
}
