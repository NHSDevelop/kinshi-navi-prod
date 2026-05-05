import { Separator } from "@/components/ui/separator";
import CreateSystemInfo from "@/features/system-info/create";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function SuperAdminCreateSystemInfoPage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">お知らせを作成</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>システムのお知らせを作成</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSystemInfo />
        </CardContent>
      </Card>
    </div>
  );
}
