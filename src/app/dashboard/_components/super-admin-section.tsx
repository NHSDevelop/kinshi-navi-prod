import Link from "next/link";
import { getDb } from "@/lib/db/drizzle";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";

export async function SuperAdminSection() {
  const session = await getSessionFromRequestHeaders();
  if (!session?.user) return null;

  const userId = session.user.id;
  const db = await getDb();

  const adminRows = await db
    .select()
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  const superAdminRows = adminRows.filter(
    (admin) => admin.role === "SUPER_ADMIN",
  );

  if (superAdminRows.length === 0) return null;

  return (
    <Button asChild variant="card">
      <Link href="/dashboard/super-admin">システム管理画面</Link>
    </Button>
  );
}
