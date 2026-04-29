import Link from "next/link";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function DashBordHomePage() {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const db = await getDb();

  const superAdminRows = await db
    .select()
    .from(admins)
    .where(and(eq(admins.userId, userId), eq(admins.role, "SUPER_ADMIN")))
    .limit(1);

  const adminRows = await db
    .select()
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  const staffRows = await db
    .select()
    .from(staffs)
    .where(eq(staffs.userId, userId))
    .limit(1);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">ダッシュボードトップ</h1>
      <Separator />
      <div className="flex gap-4">
        {superAdminRows.length > 0 && (
          <Button asChild variant="card">
            <Link href="/dashboard/super-admin">システム管理画面</Link>
          </Button>
        )}
        {adminRows.length > 0 && (
          <>
            {adminRows[0].role === "EVENT_ADMIN" && adminRows[0].eventId && (
              <Button asChild variant="card">
                <Link href={`/dashboard/admin/event/${adminRows[0].eventId}`}>
                  イベント管理画面
                </Link>
              </Button>
            )}
            {adminRows[0].role === "STORE_ADMIN" && adminRows[0].storeId && (
              <Button asChild variant="card">
                <Link href={`/dashboard/admin/store/${adminRows[0].storeId}`}>
                  システム管理画面
                </Link>
              </Button>
            )}
          </>
        )}
        {staffRows.length > 0 && staffRows[0].storeId && (
          <Button asChild variant="card">
            <Link href={`/dashboard/staff/store/${staffRows[0].storeId}`}>
              スタッフ画面
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
