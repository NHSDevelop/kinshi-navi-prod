import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Redirector } from "@/components/navigation/redirector";

export const dynamic = "force-dynamic";

export default async function DashBoardPage() {
  const session = await getSessionFromRequestHeaders();

  if (!session?.user || session.user.isAnonymous) {
    return <Redirector redirectTo="/login" />;
  }

  const db = await getDb();
  const userId = session.user.id;

  const [adminRow, staffRow] = await Promise.all([
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

  let targetUrl: string | null = null;

  if (adminRow.length > 0) {
    if (adminRow[0].role === "SUPER_ADMIN") {
      targetUrl = "/dashboard/super-admin";
    } else if (adminRow[0].role === "EVENT_ADMIN" && adminRow[0].eventId) {
      targetUrl = `/dashboard/admin/event/${adminRow[0].eventId}`;
    } else if (adminRow[0].role === "STORE_ADMIN" && adminRow[0].storeId) {
      targetUrl = `/dashboard/admin/store/${adminRow[0].storeId}`;
    }
  } else if (staffRow.length > 0 && staffRow[0].storeId) {
    targetUrl = `/dashboard/staff/store/${staffRow[0].storeId}`;
  }

  if (targetUrl) {
    return <Redirector redirectTo={targetUrl} />;
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
