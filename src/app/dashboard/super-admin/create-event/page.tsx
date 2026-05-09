import CreateEvent from "@/features/event/create";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function CreateEventPage() {
  return (
    <DashboardPageShell
      title="イベントを作成"
      description="新しいイベントの情報を登録します。"
    >
      <Card className="border-main-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>イベント作成フォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateEvent />
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
