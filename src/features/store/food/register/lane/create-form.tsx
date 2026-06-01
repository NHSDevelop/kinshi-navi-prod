"use client";

import { useActionState, useEffect } from "react";
import {
  createRegisterLane,
  CreateRegisterLaneState,
  deleteRegisterLane,
  toggleRegisterLaneActive,
} from "./action";
import { RegisterLane } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { MessagePrompt } from "@/components/prompt/message-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  eventId: string;
  lanes: RegisterLane[];
};

type LaneItemProps = {
  lane: RegisterLane;
};

const INITIAL_STATE: CreateRegisterLaneState = {
  eventId: "",
  laneCount: "",
  zodErrors: null,
  message: null,
  success: false,
};

function LaneItem({ lane }: LaneItemProps) {
  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleRegisterLaneActive,
    null,
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteRegisterLane,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (toggleState?.success || deleteState?.success) {
      router.refresh();
    }
  }, [deleteState?.success, router, toggleState?.success]);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant={lane.isActive ? "success" : "warn"}>
          {`レーン ${lane.laneNumber}`}
          {lane.name ? ` - ${lane.name}` : ""}
        </Badge>
        <div className="flex gap-2 flex-wrap items-end">
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
      {toggleState?.success === false && toggleState?.message && (
        <ErrorPrompt error={toggleState.message} />
      )}
      {deleteState?.success === false && deleteState?.message && (
        <ErrorPrompt error={deleteState.message} />
      )}
    </div>
  );
}

export default function CreateRegisterLaneForm({ eventId, lanes }: Props) {
  const [state, formAction, isPending] = useActionState(
    createRegisterLane,
    INITIAL_STATE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>レジレーンの作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex gap-2 items-end">
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
            <Button
              type="submit"
              variant="card"
              className="mt-4"
              disabled={isPending}
            >
              {isPending ? "作成中..." : "レジレーンを作成"}
            </Button>
          </div>
          <input type="hidden" name="eventId" value={eventId} />
        </form>
        <Separator className="my-4" />
        {state.success && <MessagePrompt message={state.message} />}
        {!state.success && state.message && (
          <ErrorPrompt error={state.message} />
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
                <LaneItem key={lane.id} lane={lane} />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
