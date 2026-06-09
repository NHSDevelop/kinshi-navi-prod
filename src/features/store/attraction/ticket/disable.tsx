"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { disableAttractionTickets } from "./action";

type Props = {
  storeId: string;
  isActive: boolean;
};

export default function DisableAttractionTickets({
  storeId,
  isActive,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    disableAttractionTickets,
    null,
  );

  if (isActive) {
    return null;
  }

  const formId = `disable-attraction-tickets-${storeId}`;

  return (
    <div className="space-y-4">
      {state?.success ? (
        <Alert variant="success">
          <AlertTitle>整理券を無効化しました</AlertTitle>
          <AlertDescription>
            <p>整理券の無効化が完了しました。</p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warn">
          <AlertTitle>停止中の企画です</AlertTitle>
          <AlertDescription>
            <p>
              期間を選択し、開催中に発行された整理券を無効化することができます。期間を指定しない場合はすべて無効化されます。
            </p>
            <form action={formAction} id={formId} className="mt-3 space-y-4">
              <input type="hidden" name="storeId" value={storeId} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-from`}>開始日時</Label>
                  <Input
                    id={`${formId}-from`}
                    name="createdAtFrom"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-to`}>終了日時</Label>
                  <Input
                    id={`${formId}-to`}
                    name="createdAtTo"
                    type="datetime-local"
                  />
                </div>
              </div>
            </form>
            <div className="mt-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="danger" disabled={isPending}>
                    整理券を一括無効化する
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      整理券を無効化します。よろしいですか？
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      無効化は取り消せません。
                      指定した期間の整理券だけが対象になります。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      form={formId}
                      type="submit"
                      variant="danger"
                      disabled={isPending}
                    >
                      {isPending ? "無効化中..." : "無効化する"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
