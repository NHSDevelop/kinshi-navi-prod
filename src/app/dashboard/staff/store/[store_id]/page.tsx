import { Button } from "@/components/ui/button";
import ToActiveStore from "@/features/store/to-active";
import { getDb } from "@/lib/db/drizzle";
import { attractions, stores, users, staffs, tickets } from "@/lib/db/schema";
import { Separator } from "@/components/ui/separator";

import { and, eq, inArray, sql } from "drizzle-orm";
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
import StoreInfo from "@/features/store/info";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AiFillEdit } from "react-icons/ai";

export const dynamic = "force-dynamic";

export default async function StoreStaffHomePage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [, storeRows, staffRows, activeTicketRows] = await Promise.all([
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
    db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .innerJoin(attractions, eq(tickets.attractionId, attractions.id))
      .where(
        and(
          eq(attractions.storeId, store_id),
          inArray(tickets.status, ["ISSUED", "CALLED"]),
        ),
      ),
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
        <Separator />
        <h2 className="text-lg">操作メニュー</h2>
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
                  href={`/dashboard/staff/store/${store_id}/register-log-history`}
                >
                  会計・在庫履歴
                </Link>
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
        <ToActiveStore
          storeId={storeRows[0].id}
          isActive={storeRows[0].isActive}
          activeTicketCount={Number(activeTicketRows[0]?.count ?? 0)}
        />
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
