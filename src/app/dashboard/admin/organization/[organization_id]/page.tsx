import EventSelectLink from "@/features/event/components/select-link";
import OrganizationInfo from "@/features/organization/info";
import { getDb } from "@/lib/db/drizzle";
import { events, admins, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";
import { AiFillEdit } from "react-icons/ai";
import { Separator } from "@/components/ui/separator";
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

export default async function AdminOrganizationPage(props: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await props.params;

  const db = await getDb();

  const eventRows = await db
    .select({ id: events.id, name: events.name })
    .from(events)
    .where(eq(events.organizationId, organization_id));

  const adminRows = await db
    .select({
      id: admins.id,
      name: users.name,
      userId: admins.userId,
      role: admins.role,
    })
    .from(admins)
    .innerJoin(users, eq(users.id, admins.userId))
    .where(
      and(
        eq(admins.organizationId, organization_id),
        eq(admins.role, "ORGANIZATION_ADMIN"),
      ),
    );

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">組織の管理</h1>
      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-lg">組織の情報</h2>
        <Button asChild variant="card">
          <div className="flex gap-2">
            <AiFillEdit />
            <Link
              href={`/dashboard/admin/organization/${organization_id}/edit-config`}
            >
              設定を編集
            </Link>
          </div>
        </Button>
      </div>
      <OrganizationInfo organizationId={organization_id} />
      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-lg">組織内のイベントの管理</h2>
        <Button asChild variant="card">
          <div className="flex gap-2">
            <AiFillPlusCircle />
            <Link
              href={`/dashboard/admin/organization/${organization_id}/create-event`}
            >
              イベントを作成
            </Link>
          </div>
        </Button>
      </div>
      {eventRows.length > 0 ? (
        <EventSelectLink
          href="/dashboard/admin/event"
          events={eventRows}
          context="イベントページ"
        />
      ) : (
        <p>管理するイベントが存在しません。</p>
      )}
      <Separator />
      <p className="text-lg">組織内のイベントの管理者を招待</p>
      {eventRows.length > 0 ? (
        <EventSelectLink
          href={`/dashboard/admin/organization/${organization_id}/issue-invite`}
          events={eventRows}
          context="招待リンクを発行"
        />
      ) : (
        <p>組織内のイベントが存在しません。</p>
      )}
      <Separator />
      <p className="text-lg">組織の管理者一覧</p>
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
