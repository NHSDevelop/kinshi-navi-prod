"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import { deleteSystemInfo, type DeleteSystemInfoState } from "./action";

type Props = {
  systemInfoId: string;
};

const INITIAL_STATE: DeleteSystemInfoState = {
  success: false,
  message: null,
  error: null,
};

export default function DeleteSystemInfo({ systemInfoId }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    deleteSystemInfo,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/super-admin/system-info");
    }
  }, [router, state?.success]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="systemInfoId" value={systemInfoId} />
        <Button variant="danger" type="submit" disabled={isPending}>
          {isPending ? "削除中..." : "お知らせを削除"}
        </Button>
      </form>
      {state?.success === false && state?.error && (
        <ErrorPrompt error={state.error} />
      )}
    </div>
  );
}
