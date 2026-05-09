import { Separator } from "@/components/ui/separator";
import EventInfo from "@/features/event/info";
import StoreSelectLink from "@/features/store/components/select-link";
import { getDb } from "@/lib/db/drizzle";
import { admins, events, stores, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { AiFillEdit, AiFillPlusCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import ToMainEvent from "@/features/event/to-main";
import DeleteEvent from "@/features/event/delete";
import { notFound } from "next/navigation";
import ToActiveEvent from "@/features/event/to-active";
import CreateRegisterLane from "@/features/store/food/register/lane/create";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireEventAdminUser } from "@/lib/auth-guard";

export default async function AdminEventPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  const db = await getDb();
  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.id, event_id))
    .limit(1);

  if (!eventRows[0]) {
    notFound();
  }

  const storeRows = await db
    .select({ id: stores.id, name: stores.name, storeType: stores.storeType })
    .from(stores)
    .where(eq(stores.eventId, event_id));

  const adminRows = await db
    .select({
      id: admins.id,
      name: users.name,
      userId: admins.userId,
      role: admins.role,
    })
    .from(admins)
    .innerJoin(users, eq(users.id, admins.userId))
    .where(and(eq(admins.eventId, event_id), eq(admins.role, "EVENT_ADMIN")));

  //TODO ToActiveEventの時にInfoが変化しないのを修正する

  return (
    <DashboardPageShell
      title="イベントの管理"
      description="イベント情報、配下の店舗、管理者一覧をまとめて操作できます。"
    >
      <div className="space-y-4 lg:space-y-8">
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-lg">イベントの情報</h2>
          <Button asChild variant="card">
            <div className="flex gap-2">
              <AiFillEdit />
              <Link href={`/dashboard/admin/event/${event_id}/edit-config`}>
                設定を編集
              </Link>
            </div>
          </Button>
        </div>

        <EventInfo eventId={event_id} />
        <ToMainEvent eventId={event_id} isMain={eventRows[0].isMain} />
        <ToActiveEvent eventId={event_id} isActive={eventRows[0].isActive} />
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-lg">イベント内の店舗の管理</h2>
          <Button asChild variant="card">
            <div className="flex gap-2">
              <AiFillPlusCircle />
              <Link href={`/dashboard/admin/event/${event_id}/create-store`}>
                店舗を作成
              </Link>
            </div>
          </Button>
        </div>

        {storeRows.length > 0 ? (
          <StoreSelectLink
            href="/dashboard/admin/store"
            stores={storeRows}
            context="店舗の管理ページへ"
          />
        ) : (
          <p>イベント内の店舗が存在しません。</p>
        )}

        <Separator />
        <p className="text-lg">イベント内の店舗の管理者を招待</p>
        {storeRows.length > 0 ? (
          <StoreSelectLink
            href={`/dashboard/admin/event/${event_id}/issue-invite`}
            stores={storeRows}
            context="招待リンクを発行"
          />
        ) : (
          <p>イベント内の店舗が存在しません。</p>
        )}
        <Separator />
        <p className="text-lg">模擬店とレジレーンの紐づけ</p>
        <CreateRegisterLane eventId={event_id} />
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
        <Separator />
        <Button asChild variant="card">
          <Link href={`/dashboard/admin/event/${event_id}/vote-result`}>
            投票結果を見る
          </Link>
        </Button>
        <Separator />
        <DeleteEvent eventId={event_id} pushUrl="/dashboard" />
      </div>
    </DashboardPageShell>
  );
}
