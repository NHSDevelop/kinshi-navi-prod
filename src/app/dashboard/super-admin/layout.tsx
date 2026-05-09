import { getDb } from "@/lib/db/drizzle";
import { admins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const db = await getDb();

  const rows = await db
    .select({ userId: admins.userId })
    .from(admins)
    .where(and(eq(admins.userId, userId), eq(admins.role, "SUPER_ADMIN")))
    .limit(1);

  if (rows.length === 0) {
    redirect("/signin");
  }

  return <>{children}</>;
}
