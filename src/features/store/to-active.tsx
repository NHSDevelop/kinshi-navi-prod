"use client";

import { useActionState } from "react";
import { toActiveStore } from "./action";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";
import DisableAttractionTickets from "@/features/store/attraction/ticket/disable";
import { StoreType } from "@/lib/db/schema";

type Props = {
  storeId: string;
  storeType: StoreType;
  isActive: boolean;
};

export default function ToActiveStore({
  storeId,
  storeType,
  isActive,
}: Props) {
  const [state, formAction, isPending] = useActionState(toActiveStore, null);
  const isActiveStore = state?.isActive ?? isActive;



  return (
    <div className="space-y-4">
      {storeType === "ATTRACTION" && (
        <DisableAttractionTickets
          storeId={storeId}
          isActive={isActiveStore}
        />
      )}
      <form action={formAction}>
        <input type="hidden" name="storeId" value={storeId} />
        <Button type="submit" disabled={isPending} variant="danger">
          {isActiveStore ? "店舗を停止する" : "店舗を開催する"}
        </Button>
      </form>
      {state?.success === false && state?.message && (
        <ErrorPrompt error={state.message} />
      )}
    </div>
  );
}
