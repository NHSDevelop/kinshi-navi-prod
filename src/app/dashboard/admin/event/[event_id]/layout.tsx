import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { getDb } from "@/lib/db/drizzle";
import { admins } from "@/lib/db/schema";

export default async function AdminEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ event_id: string }>;
}) {
  const session = await getSessionFromRequestHeaders();
  if (!session?.user) {
    redirect("/signin");
  }

  const { event_id } = await params;
  const userId = session.user.id;
  const db = await getDb();

  const adminRows = await db
    .select({ role: admins.role, eventId: admins.eventId })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (adminRows.length === 0) {
    redirect("/signin");
  }

  const admin = adminRows[0];

  if (admin.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  if (admin.role === "EVENT_ADMIN" && admin.eventId === event_id) {
    return <>{children}</>;
  }

  redirect("/signin");
}
