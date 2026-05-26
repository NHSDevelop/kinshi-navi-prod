"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { disableAttractionTickets } from "./action";

type Props = {
  storeId: string;
  isActive: boolean;
  activeTicketCount: number;
};

export default function DisableAttractionTickets({
  storeId,
  isActive,
  activeTicketCount,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    disableAttractionTickets,
    null,
  );

  if (isActive || activeTicketCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {state?.success ? (
        <Alert variant="success">
          <AlertTitle>整理券を無効化しました</AlertTitle>
          <AlertDescription>
            <p>
              {state.count && state.count > 0
                ? `${state.count}件の整理券を無効化しました。`
                : "無効化する整理券はありませんでした。"}
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warn">
          <AlertTitle>停止中の企画です</AlertTitle>
          <AlertDescription>
            <p>
              企画を停止したあと、残っている整理券をまとめて無効化してください。
            </p>
            <form action={formAction} className="mt-3">
              <input type="hidden" name="storeId" value={storeId} />
              <Button type="submit" variant="danger" disabled={isPending}>
                {isPending
                  ? "無効化中..."
                  : `${activeTicketCount}件の整理券を一括無効化する`}
              </Button>
            </form>
          </AlertDescription>
        </Alert>
      )}
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
