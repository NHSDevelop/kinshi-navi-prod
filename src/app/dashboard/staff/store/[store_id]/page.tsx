import { Button } from "@/components/ui/button";
import ToActiveStore from "@/features/store/to-active";
import { getDb } from "@/lib/db/drizzle";
import { stores, users, staffs } from "@/lib/db/schema";
import { Separator } from "@/components/ui/separator";
import { eq} from "drizzle-orm";
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
            <h2 className="text-sm font-bold text-titan-white-950 tracking-wide">
              操作メニュー
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              <Button asChild variant="default" className="w-full">
                <Link href={`/dashboard/admin/store/${store_id}/call-ticket`}>
                  整理券の呼び出し
                </Link>
              </Button>

              <Button asChild variant="default" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/complete-ticket`}
                >
                  整理券の受付
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link href={`/dashboard/admin/store/${store_id}/ticket-list`}>
                  整理券の一覧
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link href={`/dashboard/admin/store/${store_id}/issue-ticket`}>
                  紙の整理券の発行
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link
                  href={`/dashboard/admin/store/${store_id}/complete-paper-ticket`}
                >
                  紙の整理券の受付
                </Link>
              </Button>

              <Button asChild variant="card" className="w-full">
                <Link href={`/dashboard/admin/store/${store_id}/show-status`}>
                  待機状況を表示
                </Link>
              </Button>
            </div>
          </div>
        )}
        {storeRows[0].storeType === "FOOD" && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            <Button asChild variant="default" className="w-full">
              <Link href={`/dashboard/staff/store/${store_id}/register`}>
                レジページ
              </Link>
            </Button>

            <Button asChild variant="card" className="w-full">
              <Link href={`/dashboard/staff/store/${store_id}/item-list`}>
                商品一覧
              </Link>
            </Button>

            <Button asChild variant="card" className="w-full">
              <Link href={`/dashboard/staff/store/${store_id}/add-stock`}>
                商品の在庫を追加
              </Link>
            </Button>

            <Button asChild variant="card" className="w-full">
              <Link
                href={`/dashboard/staff/store/${store_id}/register-log-history`}
              >
                会計・在庫履歴
              </Link>
            </Button>
          </div>
        )}
        <ToActiveStore
          storeId={storeRows[0].id}
          isActive={storeRows[0].isActive}
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
