"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { AiOutlineGoogle } from "react-icons/ai";

interface Props {
  callbackURL: string;
}

export default function GoogleSignIn({ callbackURL }: Props) {
  const [isPending, setIsPending] = useState<boolean>(false);

  async function handleGoogleSignIn() {
    setIsPending(true);
    try {
      const { data: session } = await authClient.getSession();

      // deleteAnonymousUser returns an error when the user is not anonymous.
      if (session?.user?.isAnonymous) {
        await authClient.deleteAnonymousUser();
      }

      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Googleログインエラー", { cause: error });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="flex items-center justify-center gap-2 max-w-md"
    >
      <AiOutlineGoogle />
      <p>{isPending ? "ログイン中..." : "Googleでログイン"}</p>
    </Button>
  );
}
