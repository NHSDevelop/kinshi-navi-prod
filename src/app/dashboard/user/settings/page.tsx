import { Separator } from "@/components/ui/separator";
import DeleteAuthUser from "@/features/auth/delete";
import { redirect } from "next/navigation";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function UserSettingsPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
  }
  return (
    <DashboardPageShell
      title="ユーザー設定"
      description="アカウント削除などの設定を行います。"
    >
      <Card className="border-main-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>アカウント設定</CardTitle>
        </CardHeader>
        <CardContent>
          {user.isAnonymous === false && <DeleteAuthUser />}
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
  );
}
