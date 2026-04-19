"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Signout() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };
  return (
    <Button variant="card" onClick={handleSignOut}>
      サインアウト
    </Button>
  );
}
