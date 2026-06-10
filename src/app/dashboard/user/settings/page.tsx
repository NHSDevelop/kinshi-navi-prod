import DeleteAuthUser from "@/features/auth/delete";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default async function UserSettingsPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  return (
    <DashboardPageShell
      title="ユーザー設定"
      description="アカウント削除などの設定を行います。"
    >
      {user ? (
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
          </CardHeader>
          <CardContent>
            {user.isAnonymous === false && <DeleteAuthUser />}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p>設定を編集するにはログインしてください。</p>
            <Button asChild variant="card" >
              <Link href="/login" className="flex items-center gap-2 w-full h-full"><LogIn />ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardPageShell>
  );
}
