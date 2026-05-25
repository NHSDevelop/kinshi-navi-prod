import CreateAnonymousUser from "@/features/auth/anonymous/create";
import Link from "next/link";
import UserInfo from "@/features/auth/anonymous/info";
import Signout from "@/features/auth/signout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

export default async function UserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <DashboardPageShell
        title="ユーザーページ"
        description="匿名ユーザーとしての利用開始やアカウント情報の確認ができます。"
      >
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>ユーザーログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<LoadingPrompt context="ゲストユーザーの作成画面" />}
            >
              <CreateAnonymousUser />
            </Suspense>
          </CardContent>
        </Card>
      </DashboardPageShell>
    );
  }
  return (
    <DashboardPageShell
      title="ユーザーページ"
      description="アカウント設定やログアウト、登録情報の確認をまとめています。"
    >
      <div className="flex flex-col gap-4">
        <Separator />
        <div className="flex gap-4">
          <Button asChild variant="card">
            <Link href={"/dashboard/user/settings"}>ユーザー設定</Link>
          </Button>
          {!user.isAnonymous && <Signout />}
        </div>
        <Card className="border-main-200/80 shadow-sm">
          <CardContent className="pt-6">
            <UserInfo userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
