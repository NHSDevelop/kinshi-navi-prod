import CreateAnonymousUser from "@/features/auth/anonymous/create";
import Link from "next/link";
import UserInfo from "@/features/auth/anonymous/info";
import Signout from "@/features/auth/signout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ユーザーログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAnonymousUser />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">ユーザーページ</h1>
      <Separator />
      <div className="flex gap-4">
        <Button asChild variant="card">
          <Link href={"/dashboard/user/settings"}>ユーザー設定</Link>
        </Button>
        {!user.isAnonymous && <Signout />}
      </div>
      <Card>
        <CardContent className="pt-6">
          <UserInfo userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
