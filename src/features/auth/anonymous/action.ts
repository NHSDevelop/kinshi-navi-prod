import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDbAsync } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const db = await getDbAsync();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = rows[0] ?? null;

  return user;
}
