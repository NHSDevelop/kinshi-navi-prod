"use client";

import { useActionState } from "react";
import { updateFoodConfig, FoodConfigState } from "./action";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { Food, foodTagValues } from "@/lib/db/schema";
import { FOOD_TAG_MAP } from "@/lib/type";

interface UpdateFoodConfigProps {
  food: Food;
}

const INITIAL_STATE: FoodConfigState = {
  foodTag: "",
  zodErrors: null,
  message: null,
  success: false,
};

export default function UpdateFoodConfigForm({ food }: UpdateFoodConfigProps) {
  const [state, formAction, isPending] = useActionState(
    updateFoodConfig,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>模擬店情報の編集</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel>模擬店の種類</FieldLabel>
                  <Field>
                    <Select name="foodTag" disabled={isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="模擬店の種類を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {foodTagValues.map((type) => {
                            const storeTypeLabel =
                              FOOD_TAG_MAP[type as keyof typeof FOOD_TAG_MAP]
                                ?.label ?? type;
                            return (
                              <SelectItem key={type} value={type}>
                                {storeTypeLabel}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <FieldError message={state.zodErrors?.foodTag?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="storeId" value={food.storeId} />
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
