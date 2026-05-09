import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/db/schema";
import { getDb } from "@/lib/db/drizzle";
import EventSelectLink from "@/features/event/components/select-link";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireSuperAdminUser } from "@/lib/auth-guard";

export default async function SuperAdminHomePage() {
  await requireSuperAdminUser();

  const db = await getDb();

  const eventRows = await db
    .select({
      id: events.id,
      name: events.name,
      isActive: events.isActive,
      isMain: events.isMain,
    })
    .from(events);
  return (
    <DashboardPageShell
      title="システムの管理"
      description="イベントやお知らせをまとめて管理します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>お知らせの作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="card" asChild>
              <Link href="/dashboard/super-admin/create-system-info">
                お知らせを作成
              </Link>
            </Button>
          </CardContent>
        </Card>
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
          <p>管理するイベントが存在しません。</p>
        )}
        <Separator />
      </div>
    </DashboardPageShell>
  );
}
