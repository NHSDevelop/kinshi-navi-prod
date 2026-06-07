"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

export function Redirector({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="h-8 w-8" />
        <span className="text-sm text-muted-foreground">リダイレクト中…</span>
      </div>
    </div>
  );
}
