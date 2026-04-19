import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/db/schema";
import { getDbAsync } from "@/lib/db/drizzle";
import EventSelectLink from "@/features/event/components/select-link";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";

export default async function SuperAdminHomePage() {
  const db = await getDbAsync();

  const eventRows = await db.select().from(events);
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">システムの管理</h1>
      <Separator />
      <Button variant="card" asChild>
        <Link href="/dashboard/super-admin/create-system-info">
          お知らせを作成
        </Link>
      </Button>
      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-lg">イベントの管理</h2>
        <Button asChild variant="card">
          <div className="flex gap-2">
            <AiFillPlusCircle />
            <Link href="/dashboard/super-admin/create-event">
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
      <p className="text-lg">イベントの管理者を招待</p>
      {eventRows.length > 0 ? (
        <EventSelectLink
          href={`/dashboard/super-admin/issue-invite`}
          events={eventRows}
          context="招待リンクを発行"
        />
      ) : (
        <p>組織内のイベントが存在しません。</p>
      )}
      <Separator />
    </div>
  );
}
