import { Separator } from "@/components/ui/separator";
import EventInfo from "@/features/event/info";
import StoreSelectLink from "@/features/store/components/select-link";
import { getDb } from "@/lib/db/drizzle";
import { admins, events, stores, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { AiFillEdit, AiFillPlusCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { notFound } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SelectStoreAuthCode from "@/features/store/components/select-auth-code";

export const dynamic = "force-dynamic";

export default async function AdminEventPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  const db = await getDb();

  const [eventRows, storeRows, adminRows] = await Promise.all([
    db.select().from(events).where(eq(events.id, event_id)).limit(1),
    db
      .select({ id: stores.id, name: stores.name, authCode: stores.adminCode })
      .from(stores)
      .where(eq(stores.eventId, event_id)),
    db
      .select({
        id: admins.id,
        name: users.name,
        userId: admins.userId,
        role: admins.role,
      })
      .from(admins)
      .innerJoin(users, eq(users.id, admins.userId))
      .where(and(eq(admins.eventId, event_id), eq(admins.role, "EVENT_ADMIN"))),
  ]);

  if (!eventRows[0]) {
    notFound();
  }

  return (
    <DashboardPageShell
      title="イベントの管理"
      description="イベント情報、配下の店舗、管理者一覧をまとめて操作できます。"
    >
      <div className="space-y-4 lg:space-y-8">
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>イベントの情報</CardTitle>
            <Button asChild variant="card">
              <Link
                href={`/dashboard/admin/event/${event_id}/edit-config`}
                className="flex items-center gap-2"
              >
                <AiFillEdit />
                設定を編集
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <EventInfo eventId={event_id} />
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>イベント内の店舗の管理</CardTitle>
            <Button asChild variant="card">
              <Link
                href={`/dashboard/admin/event/${event_id}/create-store`}
                className="flex items-center gap-2"
              >
                <AiFillPlusCircle />
                <p>店舗を作成</p>
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeRows.length > 0 ? (
              <StoreSelectLink
                href="/dashboard/admin/store"
                stores={storeRows}
                context="店舗の管理ページへ"
              />
            ) : (
              <p>イベント内の店舗が存在しません。</p>
            )}
          </CardContent>
        </Card>
        <Separator />
        <p className="text-lg">その他の操作</p>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max gap-2 pb-4">
            <Button asChild variant="card">
              <Link href={`/dashboard/admin/event/${event_id}/register-lane`}>
                レジレーンの管理
              </Link>
            </Button>
            <Button asChild variant="card">
              <Link href={`/dashboard/admin/event/${event_id}/vote-result`}>
                投票結果を見る
              </Link>
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Separator />
        <p className="text-lg">イベント内の店舗の管理者の認証コード
        </p>
        {storeRows.length > 0 ? (
          <SelectStoreAuthCode stores={storeRows} />
        ) : (
          <p>イベント内の店舗が存在しません。</p>
        )}
        <Separator />
        <p className="text-lg">イベントの管理者一覧</p>
        {adminRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRows.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <NotFoundPrompt context="該当する管理者" />
        )}
      </div>
    </DashboardPageShell>
  );
}
