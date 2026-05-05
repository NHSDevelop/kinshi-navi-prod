import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

function DashboardSectionSkeleton() {
  return <Skeleton className="h-10 w-48 rounded-lg" />;
}

async function SuperAdminButton({ userId }: { userId: string }) {
  const db = await getDb();

  const adminRows = await db
    .select({ id: admins.id, role: admins.role })
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

async function AdminButton({ userId }: { userId: string }) {
  const db = await getDb();

  const adminRows = await db
    .select({
      id: admins.id,
      role: admins.role,
      eventId: admins.eventId,
      storeId: admins.storeId,
    })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (adminRows.length === 0) return null;

  const admin = adminRows[0];

  if (admin.role === "EVENT_ADMIN" && admin.eventId) {
    return (
      <Button asChild variant="card">
        <Link href={`/dashboard/admin/event/${admin.eventId}`}>
          イベント管理画面
        </Link>
      </Button>
    );
  }

  if (admin.role === "STORE_ADMIN" && admin.storeId) {
    return (
      <Button asChild variant="card">
        <Link href={`/dashboard/admin/store/${admin.storeId}`}>
          店舗管理画面
        </Link>
      </Button>
    );
  }

  return null;
}

async function StaffButton({ userId }: { userId: string }) {
  const db = await getDb();

  const staffRows = await db
    .select({ id: staffs.id, storeId: staffs.storeId })
    .from(staffs)
    .where(eq(staffs.userId, userId))
    .limit(1);

  if (staffRows.length === 0 || !staffRows[0].storeId) return null;

  const staff = staffRows[0];

  return (
    <Button asChild variant="card">
      <Link href={`/dashboard/staff/store/${staff.storeId}`}>スタッフ画面</Link>
    </Button>
  );
}

export default async function DashBordHomePage() {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">ダッシュボードトップ</h1>
      <Separator />
      <div className="flex gap-4">
        {/* SuperAdmin セクション - 独立した並列実行 */}
        <Suspense fallback={<DashboardSectionSkeleton />}>
          <SuperAdminButton userId={userId} />
        </Suspense>

        {/* Admin セクション - 独立した並列実行 */}
        <Suspense fallback={<DashboardSectionSkeleton />}>
          <AdminButton userId={userId} />
        </Suspense>

        {/* Staff セクション - 独立した並列実行 */}
        <Suspense fallback={<DashboardSectionSkeleton />}>
          <StaffButton userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
