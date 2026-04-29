import { getDb } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { cache } from "react";

const getCurrentUserCached = cache(async () => {
  const db = await getDb();

  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    return null;
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return rows[0] ?? null;
});

export async function getCurrentUser() {
  return getCurrentUserCached();
}
