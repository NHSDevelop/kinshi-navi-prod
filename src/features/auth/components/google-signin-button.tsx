"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type GoogleSignInButtonProps = {
  callbackURL: string;
  disabled?: boolean;
  className?: string;
};

export function GoogleSignInButton({
  callbackURL,
  disabled = false,
  className,
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    setIsPending(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (error) {
      console.error("Google sign-in failed:", error);
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      onClick={handleSignIn}
      disabled={disabled || isPending}
    >
      {isPending ? "Googleに移動中..." : "Googleでログイン"}
    </Button>
  );
}
