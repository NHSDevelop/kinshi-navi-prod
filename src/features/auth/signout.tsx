"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Signout() {
  const router = useRouter();
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsPending(true);
    await authClient.signOut();
    setIsPending(false);
    router.push("/");
  };
  return (
    <Button variant="card" onClick={handleSignOut}>
      {isPending ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
}
