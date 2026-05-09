import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { getDb } from "@/lib/db/drizzle";
import { admins, stores } from "@/lib/db/schema";

export default async function AdminStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store_id: string }>;
}) {
  const session = await getSessionFromRequestHeaders();
  if (!session?.user) {
    redirect("/signin");
  }

  const { store_id } = await params;
  const userId = session.user.id;
  const db = await getDb();

  const adminRows = await db
    .select({
      role: admins.role,
      eventId: admins.eventId,
      storeId: admins.storeId,
    })
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

  if (admin.role === "STORE_ADMIN" && admin.storeId === store_id) {
    return <>{children}</>;
  }

  if (admin.role === "EVENT_ADMIN" && admin.eventId) {
    const storeRows = await db
      .select({ eventId: stores.eventId })
      .from(stores)
      .where(and(eq(stores.id, store_id), eq(stores.eventId, admin.eventId)))
      .limit(1);

    if (storeRows.length > 0) {
      return <>{children}</>;
    }
  }

  redirect("/signin");
}
