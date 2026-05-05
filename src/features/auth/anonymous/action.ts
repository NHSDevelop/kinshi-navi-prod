import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { cache } from "react";

const getCurrentUserCached = cache(async () => {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    return null;
  }

  return session.user;
});

export async function getCurrentUser() {
  return getCurrentUserCached();
}
