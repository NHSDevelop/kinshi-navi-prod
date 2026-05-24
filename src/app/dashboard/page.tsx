import { redirect } from "next/navigation";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function DashBoardPage() {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user || session.user.isAnonymous) {
    redirect("/signin");
  }

  const db = await getDb();
  const userId = session.user.id;

  const [superAdminRow, adminRow, staffRow] = await Promise.all([
    db
      .select({ userId: admins.userId })
      .from(admins)
      .where(and(eq(admins.userId, userId), eq(admins.role, "SUPER_ADMIN")))
      .limit(1),
    db
      .select({
        role: admins.role,
        eventId: admins.eventId,
        storeId: admins.storeId,
      })
      .from(admins)
      .where(eq(admins.userId, userId))
      .limit(1),
    db
      .select({ storeId: staffs.storeId })
      .from(staffs)
      .where(eq(staffs.userId, userId))
      .limit(1),
  ]);

  if (superAdminRow.length > 0) {
    redirect("/dashboard/super-admin");
  }

  if (adminRow.length > 0) {
    if (adminRow[0].role === "EVENT_ADMIN" && adminRow[0].eventId) {
      redirect(`/dashboard/admin/event/${adminRow[0].eventId}`);
    }

    if (adminRow[0].role === "STORE_ADMIN" && adminRow[0].storeId) {
      redirect(`/dashboard/admin/store/${adminRow[0].storeId}`);
    }
  }

  if (staffRow.length > 0 && staffRow[0].storeId) {
    redirect(`/dashboard/staff/store/${staffRow[0].storeId}`);
  }

  return (
    <DashboardPageShell
      title="ダッシュボードトップ"
      description="Kinshi Navi の管理者ダッシュボードです。権限に応じて各管理画面へ移動します。"
    >
      <Card className="border-main-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>ユーザー権限の確認</CardTitle>
        </CardHeader>
        <CardContent>
          <NotFoundPrompt context="ユーザーに紐づいた権限" />
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
