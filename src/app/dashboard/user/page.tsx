import Link from "next/link";
import UserInfo from "@/features/auth/anonymous/info";
import Signout from "@/features/auth/signout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { LogIn, Settings } from "lucide-react";

export default async function ManagedUserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;
  return (
    <DashboardPageShell
      title="管理ユーザーページ"
      description="権限区分や紐づいているイベント・店舗の確認、アカウント設定、ログアウトをまとめています。"
    >
      {user ? (
        <div className="flex flex-col gap-4">
          <Separator />
          <div className="flex gap-4">
            <Button asChild variant="card">
              <Link href={"/dashboard/user/settings"} className="flex items-center gap-2 w-full h-full"><Settings />ユーザー設定</Link>
            </Button>
            {!user.isAnonymous && <Signout />}
          </div>
          <Card className="border-main-200/80 shadow-sm">
            <CardContent className="pt-6">
              <UserInfo userId={user.id} />
            </CardContent>
          </Card>
        </div>
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
