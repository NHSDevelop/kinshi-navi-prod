import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { events, stores } from "@/lib/db/schema";
import { getDb } from "@/lib/db/drizzle";
import EventSelectLink from "@/features/event/components/select-link";
import StoreSelectLink from "@/features/store/components/select-link";
import Link from "next/link";
import { AiFillPlusCircle } from "react-icons/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireSuperAdminUser } from "@/lib/auth-guard";
import ToMainEvent from "@/features/event/to-main";

export const dynamic = "force-dynamic";

export default async function SuperAdminHomePage() {
  const db = await getDb();

  const [, eventRows, storeRows] = await Promise.all([
    requireSuperAdminUser(),
    db
      .select({
        id: events.id,
        name: events.name,
        isActive: events.isActive,
        isMain: events.isMain,
      })
      .from(events),
    db.select({ id: stores.id, name: stores.name }).from(stores),
  ]);

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
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>お知らせの管理</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="card" asChild>
              <Link href="/dashboard/super-admin/system-info">
                お知らせを管理
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDFを管理</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="card" asChild>
              <Link href="/dashboard/super-admin/pdf-documents">PDFを管理</Link>
            </Button>
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>イベントの管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="card">
              <Link
                href="/dashboard/super-admin/create-event"
                className="flex items-center gap-2"
              >
                <AiFillPlusCircle />
                イベントを作成
              </Link>
            </Button>
            {eventRows.length > 0 ? (
              <EventSelectLink
                href="/dashboard/admin/event"
                events={eventRows}
                context="イベントページ"
              />
            ) : (
              <p>管理するイベントが存在しません。</p>
            )}
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>メインイベントの管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToMainEvent />
          </CardContent>
        </Card>
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>スタッフページへ移動</CardTitle>
          </CardHeader>
          <CardContent>
            {storeRows.length > 0 ? (
              <StoreSelectLink
                href="/dashboard/staff/store"
                stores={storeRows}
                context="スタッフページ"
              />
            ) : (
              <p>管理する店舗が存在しません。</p>
            )}
          </CardContent>
        </Card>
        <Separator />
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>イベントの管理者を招待</CardTitle>
          </CardHeader>
          <CardContent>
            {eventRows.length > 0 ? (
              <EventSelectLink
                href={`/dashboard/super-admin/issue-invite`}
                events={eventRows}
                context="招待リンクを発行"
              />
            ) : (
              <p>管理するイベントが存在しません。</p>
            )}
          </CardContent>
        </Card>
        <Separator />
      </div>
    </DashboardPageShell>
  );
}
