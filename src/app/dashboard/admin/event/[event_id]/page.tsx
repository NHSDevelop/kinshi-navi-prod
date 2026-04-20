import { Separator } from "@/components/ui/separator";
import EventInfo from "@/features/event/info";
import StoreSelectLink from "@/features/store/components/select-link";
import { getDbAsync } from "@/lib/db/drizzle";
import { admins, stores, users } from "@/lib/db/schema";
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

export default async function AdminEventPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;

  const db = await getDbAsync();

  const storeRows = await db
    .select({ id: stores.id, name: stores.name })
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

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントの管理</h1>
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
  );
}
