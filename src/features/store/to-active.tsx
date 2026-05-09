"use client";

import { useActionState } from "react";
import { toActiveStore } from "./action";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

type Props = {
  storeId: string;
  isActive: boolean;
};

export default function ToActiveStore({ storeId, isActive }: Props) {
  const [state, formAction, isPending] = useActionState(toActiveStore, null);
  const isActiveStore = state?.isActive ?? isActive;

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <input type="hidden" name="storeId" value={storeId} />
        <Button type="submit" disabled={isPending}>
          {isActiveStore ? "停止中にする" : "開催中にする"}
        </Button>
      </form>
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
