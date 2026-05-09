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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

// Store情報は1日に1回程度変わるため、ISR 1時間でキャッシュ
export const revalidate = 3600;

export default async function StoreStaffHomePage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  const db = await getDb();
  const storeRows = await db
    .select({ id: stores.id, name: stores.name, storeType: stores.storeType })
    .from(stores)
    .where(eq(stores.id, store_id))
    .limit(1);

  if (storeRows.length === 0) {
    return <p>店舗が存在しません。</p>;
  }
  const staffRows = await db
    .select({
      id: staffs.id,
      name: users.name,
      userId: staffs.userId,
    })
    .from(staffs)
    .innerJoin(users, eq(users.id, staffs.userId))
    .where(eq(staffs.storeId, store_id));

  return (
    <DashboardPageShell
      title={`スタッフ画面 | ${storeRows[0].name}`}
      description="担当店舗の操作メニューとスタッフ一覧を表示します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <Separator />
        {storeRows[0].storeType === "ATTRACTION" && (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max gap-2 pb-4">
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/call-ticket`}>
                  チケットを呼び出す
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link
                  href={`/dashboard/staff/store/${store_id}/complete-ticket`}
                >
                  チケットの受付
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/issue-ticket`}>
                  チケットを発行する（紙）
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/ticket-list`}>
                  チケットの一覧
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/show-status`}>
                  待機状況を表示
                </Link>
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
        {storeRows[0].storeType === "FOOD" && (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max gap-2 pb-4">
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/item-list`}>
                  商品一覧
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/add-stock`}>
                  商品の在庫を追加
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link href={`/dashboard/staff/store/${store_id}/register`}>
                  レジページ
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link
                  href={`/dashboard/staff/store/${store_id}/stock-log-history`}
                >
                  商品在庫の変動履歴
                </Link>
              </Button>
              <Button asChild variant="card">
                <Link
                  href={`/dashboard/staff/store/${store_id}/register-log-history`}
                >
                  レジ履歴
                </Link>
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
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
