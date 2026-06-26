"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineReload } from "react-icons/ai";

export function ReloadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReload = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button type="button" onClick={handleReload} disabled={isPending}>
      <div className="flex items-center gap-2 max-w-xs">
        <AiOutlineReload className={isPending ? "animate-spin" : ""} />
        {isPending ? "更新中..." : "再読み込み"}
      </div>
    </Button>
  );
}
