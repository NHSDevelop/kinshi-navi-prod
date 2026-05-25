import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemInfoManageList } from "@/features/system-info/manage-list";
import Link from "next/link";
import { requireSuperAdminUser } from "@/lib/auth-guard";

export default async function SuperAdminSystemInfoPage() {
  await requireSuperAdminUser();

  return (
    <DashboardPageShell
      title="お知らせ管理"
      description="お知らせの作成、編集、削除をまとめて行います。"
    >
      <div className="space-y-6">
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>お知らせを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="card" asChild>
              <Link href="/dashboard/super-admin/create-system-info">
                お知らせを作成
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>お知らせ一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemInfoManageList />
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
