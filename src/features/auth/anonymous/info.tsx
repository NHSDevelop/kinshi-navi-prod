import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/drizzle";
import { admins, staffs, users } from "@/lib/db/schema";
import { ADMIN_ROLE_MAP } from "@/lib/type";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

interface UserInfoProps {
  userId: string;
}

export default async function UserInfo({ userId }: UserInfoProps) {
  const db = await getDb();

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];

  if (!user) {
    return <NotFoundPrompt context="ユーザー" />;
  }

  const adminRows = await db
    .select()
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);
  const staffRows = await db
    .select()
    .from(staffs)
    .where(eq(staffs.userId, userId))
    .limit(1);

  const Role =
    adminRows.length > 0
      ? (ADMIN_ROLE_MAP[adminRows[0].role as keyof typeof ADMIN_ROLE_MAP]
          ?.label ?? adminRows[0].role)
      : null;

  //TODO adminとstaffと関連する組織やイベントを取得する

  return (
    <Card>
      <CardHeader>
        <CardTitle>ユーザー情報</CardTitle>
      </CardHeader>
      <CardContent>
        <p>ユーザー名：{user.name}</p>
        {user.isAnonymous && <p>ユーザーの種類：匿名ユーザー</p>}
        {adminRows.length > 0 && (
          <div>
            <p>ユーザーの種類：{Role}</p>
            <p>メールアドレス：{user.email}</p>
          </div>
        )}
        {staffRows.length > 0 && (
          <div>
            <p>ユーザーの種類：スタッフ</p>
            <p>メールアドレス：{user.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
