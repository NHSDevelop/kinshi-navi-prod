"use client";

import { useActionState, useEffect } from "react";
import {
  assignRegisterLaneToFood,
  createRegisterLane,
  CreateRegisterLaneState,
  deleteRegisterLane,
  toggleRegisterLaneActive,
} from "./action";
import { RegisterLane } from "@/lib/db/schema";
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
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StoreOption = {
  storeId: string;
  storeName: string;
  foodId: string;
};

type Props = {
  eventId: string;
  stores: StoreOption[];
  lanes: RegisterLane[];
};

type LaneItemProps = {
  lane: RegisterLane;
  stores: StoreOption[];
};

const INITIAL_STATE: CreateRegisterLaneState = {
  eventId: "",
  laneCount: "",
  zodErrors: null,
  message: null,
  success: false,
};

function LaneItem({ lane, stores }: LaneItemProps) {
  const [assignState, assignAction, isAssignPending] = useActionState(
    assignRegisterLaneToFood,
    null,
  );
  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleRegisterLaneActive,
    null,
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteRegisterLane,
    null,
  );
  const router = useRouter();

  const assignedStoreName =
    stores.find((store) => store.foodId === lane.foodId)?.storeName ??
    "未紐づけ";

  useEffect(() => {
    if (assignState?.success || toggleState?.success || deleteState?.success) {
      router.refresh();
    }
  }, [
    assignState?.success,
    deleteState?.success,
    router,
    toggleState?.success,
  ]);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant={lane.isActive ? "success" : "warn"}>
          {`レーン ${lane.laneNumber}`} ({assignedStoreName})
          {lane.name ? ` - ${lane.name}` : ""}
        </Badge>
        <div className="flex gap-2 flex-wrap items-end">
          <form action={assignAction} className="flex gap-2 items-end">
            <input type="hidden" name="laneId" value={lane.id} />
            <Field className="min-w-44">
              <FieldLabel>模擬店</FieldLabel>
              <Select
                name="foodId"
                required
                disabled={isAssignPending}
                defaultValue={lane.foodId ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="模擬店を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {stores.map((store) => (
                      <SelectItem key={store.foodId} value={store.foodId}>
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Button type="submit" variant="card" disabled={isAssignPending}>
              {isAssignPending ? "紐づけ中..." : "紐づけ"}
            </Button>
          </form>
          <form action={toggleAction}>
            <input type="hidden" name="laneId" value={lane.id} />
            <Button type="submit" variant="outline" disabled={isTogglePending}>
              {isTogglePending
                ? "更新中..."
                : lane.isActive
                  ? "無効化"
                  : "有効化"}
            </Button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="laneId" value={lane.id} />
            <Button type="submit" variant="danger" disabled={isDeletePending}>
              {isDeletePending ? "削除中..." : "削除"}
            </Button>
          </form>
        </div>
      </div>
      {assignState?.success === false && assignState?.message && (
        <ErrorPrompt error={assignState.message} />
      )}
      {toggleState?.success === false && toggleState?.message && (
        <ErrorPrompt error={toggleState.message} />
      )}
      {deleteState?.success === false && deleteState?.message && (
        <ErrorPrompt error={deleteState.message} />
      )}
    </div>
  );
}

export default function CreateRegisterLaneForm({
  eventId,
  stores,
  lanes,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    createRegisterLane,
    INITIAL_STATE,
  );
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>レジレーンの作成と紐づけ</CardTitle>
      </CardHeader>
      <CardContent>
        {stores.length === 0 && (
          <p className="text-sm text-muted-foreground">
            紐づけ可能な模擬店がありません。
          </p>
        )}

        <form action={formAction}>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel>作成するレーン数</FieldLabel>
                <Input
                  name="laneCount"
                  type="number"
                  min={1}
                  max={50}
                  required
                  disabled={isPending}
                  defaultValue={state.laneCount}
                />
                <FieldError message={state.zodErrors?.laneCount?.[0]} />
              </Field>
            </FieldSet>
            <FieldSeparator />
            <input type="hidden" name="eventId" value={eventId} />
          </FieldGroup>
          <Button
            type="submit"
            variant="card"
            className="mt-4"
            disabled={isPending}
          >
            {isPending ? "作成中..." : "レジレーンを作成"}
          </Button>
        </form>

        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
        )}

        {state.success && (
          <Button className="mt-3" onClick={() => router.refresh()}>
            一覧を更新
          </Button>
        )}

        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">現在のレーン</p>
          {lanes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              まだレーンが登録されていません。
            </p>
          )}
          <div className="space-y-3">
            {lanes
              .slice()
              .sort((a, b) => a.laneNumber - b.laneNumber)
              .map((lane) => (
                <LaneItem key={lane.id} lane={lane} stores={stores} />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
