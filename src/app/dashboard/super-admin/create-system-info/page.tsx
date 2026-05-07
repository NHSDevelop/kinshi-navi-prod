import { Separator } from "@/components/ui/separator";
import CreateSystemInfo from "@/features/system-info/create";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function SuperAdminCreateSystemInfoPage() {
  return (
    <DashboardPageShell
      title="お知らせを作成"
      description="システム全体に出すお知らせを登録します。"
    >
      <Card className="border-main-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>システムのお知らせを作成</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSystemInfo />
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
