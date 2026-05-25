"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { authClient } from "@/lib/auth-client";
import { unlinkBinding } from "./unlink-binding-action";

type BindingType = "EVENT_ADMIN" | "STORE_ADMIN" | "STAFF";

type Props = {
  bindingType: BindingType;
  targetLabel: string;
};

const actionLabelMap: Record<BindingType, string> = {
  EVENT_ADMIN: "イベント管理者の紐づけを解除",
  STORE_ADMIN: "店舗管理者の紐づけを解除",
  STAFF: "店舗スタッフの紐づけを解除",
};

export default function UnlinkBindingButton({
  bindingType,
  targetLabel,
}: Props) {
  const [state, formAction, isPending] = useActionState(unlinkBinding, null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    const handleSignOut = async () => {
      await authClient.signOut();
      router.replace("/");
    };

    void handleSignOut();
  }, [router, state?.success]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger" size="sm">
          解除する
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionLabelMap[bindingType]}</AlertDialogTitle>
          <AlertDialogDescription>
            {targetLabel} との紐づけを解除します。解除後はサインアウトされます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="bindingType" value={bindingType} />
          <AlertDialogFooter>
            <AlertDialogCancel>戻る</AlertDialogCancel>
            <Button type="submit" variant="danger" disabled={isPending}>
              {isPending ? "解除中..." : "解除する"}
            </Button>
          </AlertDialogFooter>
          {state?.success === false && state?.error ? (
            <ErrorPrompt error={state.error} />
          ) : null}
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
