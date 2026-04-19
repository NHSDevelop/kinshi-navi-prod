import { getDbAsync } from "@/lib/db/drizzle";
import { admins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin/dashboard/super-admin");
  }

  const userId = session.user.id;

  const db = await getDbAsync();

  const rows = await db
    .select({ userId: admins.userId })
    .from(admins)
    .where(and(eq(admins.userId, userId), eq(admins.role, "SUPER_ADMIN")))
    .limit(1);

  if (rows.length === 0) {
    redirect("/signin/dashboard/super-admin");
  }

  return <>{children}</>;
}
