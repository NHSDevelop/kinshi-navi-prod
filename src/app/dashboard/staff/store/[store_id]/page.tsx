import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db/drizzle";
import { stores, users, staffs } from "@/lib/db/schema";
import { Separator } from "@/components/ui/separator";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import StoreInfo from "@/features/store/info";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Banknote,
  CirclePlus,
  ConciergeBell,
  History,
  List,
  Monitor,
  ScanLine,
  Ticket,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoreStaffHomePage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [, storeRows, staffRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select({
        id: stores.id,
        name: stores.name,
        storeType: stores.storeType,
        isActive: stores.isActive,
      })
      .from(stores)
      .where(eq(stores.id, store_id))
      .limit(1),
    db
      .select({
        id: staffs.id,
        name: users.name,
        userId: staffs.userId,
      })
      .from(staffs)
      .innerJoin(users, eq(users.id, staffs.userId))
      .where(eq(staffs.storeId, store_id)),
  ]);

  if (storeRows.length === 0) {
    return (
      <DashboardPageShell
        title="スタッフ画面"
        description="担当店舗の操作メニューとスタッフ一覧を表示します。"
      >
        <NotFoundPrompt context="該当する店舗" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`スタッフ画面 | ${storeRows[0].name}`}
      description="担当店舗の操作メニューとスタッフ一覧を表示します。"
    >
      <div className="space-y-4 lg:space-y-8">
        {storeRows[0].storeType === "ATTRACTION" && (
          <div className="space-y-4 lg:space-y-8">
            <h2 className="text-sm font-bold main-950 tracking-wide">
              操作メニュー
            </h2>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
              <Button asChild variant="default" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/call-ticket`}
                  className="flex items-center gap-2 h-full"
                >
                  <ConciergeBell />
                  整理券の呼び出し
                </Link>
              </Button>

              <Button asChild variant="default" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/complete-ticket`}
                  className="flex items-center gap-2 h-full"
                >
                  <ScanLine />
                  整理券の受付
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/ticket-list`}
                  className="flex items-center gap-2 h-full"
                >
                  <List />
                  整理券の一覧
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/issue-ticket`}
                  className="flex items-center gap-2 h-full"
                >
                  <Ticket />
                  紙の整理券の発行
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/complete-paper-ticket`}
                  className="flex items-center gap-2 h-full"
                >
                  <ScanLine />
                  紙の整理券の受付
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/show-status`}
                  className="flex items-center gap-2 h-full"
                >
                  <Monitor />
                  待機状況を表示
                </Link>
              </Button>
            </div>
          </div>
        )}
        {storeRows[0].storeType === "FOOD" && (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
            <Button asChild variant="default" className="w-full">
              <Link
                href={`/dashboard/staff/store/${store_id}/register`}
                className="flex items-center gap-2 h-full"
              >
                <Banknote />
                レジページ
              </Link>
            </Button>

            <Button asChild variant="card" className="w-full">
              <Link
                href={`/dashboard/staff/store/${store_id}/item-list`}
                className="flex items-center gap-2 h-full"
              >
                <List />
                商品一覧
              </Link>
            </Button>
          </div>
        )}
        <Separator />
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>店舗の情報</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreInfo storeId={store_id} isShowCanVoted />
          </CardContent>
        </Card>
        <Separator />
        <h2 className="text-lg">店舗のスタッフ一覧</h2>
        {staffRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffRows.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <NotFoundPrompt context="該当するスタッフ" />
        )}
      </div>
    </DashboardPageShell>
  );
}
