"use client";

import { useActionState, useState } from "react";
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
import { Switch } from "@/components/ui/switch";

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

  const [isUseLane, setisUseLane] = useState<boolean>(food.isUseLane || true);
    

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
                                  <Field>
                                    <FieldLabel>レーンを使用する</FieldLabel>
                                    <Switch
                                      disabled={isPending}
                                      checked={isUseLane}
                                      onCheckedChange={setisUseLane}
                                    />
                                    <FieldError message={state.zodErrors?.isUseLane?.[0]} />
                                  </Field>
                  <FieldError message={state.zodErrors?.foodTag?.[0]} />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="storeId" value={food.storeId} />
            <input type="hidden" name="foodId" value={food.id} />
            <input
              type="hidden"
              name="isUseLane"
              value={isUseLane ? "true" : "false"}
            />
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
