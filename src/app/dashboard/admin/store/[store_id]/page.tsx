import AttractionInfo from "@/features/store/attraction/info";
import ItemList from "@/features/store/food/item/list";
import StoreInfo from "@/features/store/info";
import { getDb } from "@/lib/db/drizzle";
import {
  attractions,
  foods,
  admins,
  users,
  staffs,
  stores,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
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
import DeleteStore from "@/features/store/delete";
import ToActiveStore from "@/features/store/to-active";
import { notFound } from "next/navigation";
import ItemSelectLink from "@/features/store/food/item/components/select-link";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import FoodInfo from "@/features/store/food/info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DisabledItem from "@/features/store/food/item/disabled";
import {
  Banknote,
  CirclePlus,
  ConciergeBell,
  History,
  List,
  Monitor,
  ScanLine,
  SquarePen,
  Ticket,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminStorePageProps {
  params: Promise<{ store_id: string }>;
}

export default async function AdminStorePage({ params }: AdminStorePageProps) {
  const { store_id } = await params;

  const db = await getDb();

  const [storeRows, attractionRows, foodRows, adminRows, staffRows] =
    await Promise.all([
      db
        .select({
          id: stores.id,
          staffCode: stores.staffCode,
          isActive: stores.isActive,
        })
        .from(stores)
        .where(eq(stores.id, store_id))
        .limit(1),
      db
        .select({ id: attractions.id })
        .from(attractions)
        .where(eq(attractions.storeId, store_id))
        .limit(1),
      db
        .select({ id: foods.id })
        .from(foods)
        .where(eq(foods.storeId, store_id))
        .limit(1),
      db
        .select({
          id: admins.id,
          name: users.name,
          userId: admins.userId,
          role: admins.role,
        })
        .from(admins)
        .innerJoin(users, eq(users.id, admins.userId))
        .where(
          and(eq(admins.storeId, store_id), eq(admins.role, "STORE_ADMIN")),
        ),
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

  if (!storeRows[0]) {
    notFound();
  }

  return (
    <DashboardPageShell
      title="店舗の管理"
      description="店舗の基本情報、企画情報、スタッフ情報をまとめて管理できます。"
    >
      <div className="space-y-4 lg:space-y-8">
        {attractionRows.length > 0 && (
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
        {foodRows.length > 0 && (
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

            <Button asChild variant="card" className="w-full">
              <Link
                href={`/dashboard/staff/store/${store_id}/add-stock`}
                className="flex items-center gap-2 h-full"
              >
                <CirclePlus />
                商品の在庫を追加
              </Link>
            </Button>
          </div>
        )}
        <Separator />
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>店舗の情報</CardTitle>
            <Button asChild variant="card" className="max-w-32">
                
                <Link
                  href={`/dashboard/admin/store/${store_id}/edit-config/store`}
                  className="flex items-center gap-2 h-full"
                >
                  <SquarePen />
                  設定を編集
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <StoreInfo storeId={store_id} isShowCanVoted />
          </CardContent>
        </Card>
        <ToActiveStore
          storeId={storeRows[0].id}
          isActive={storeRows[0].isActive}
        />
        <Separator />
        {attractionRows?.length > 0 && (
          <div className="space-y-4 lg:space-y-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>企画の情報</CardTitle>
                <Button asChild variant="card" className="max-w-32">
                  <Link
                    href={`/dashboard/admin/store/${store_id}/edit-config/attraction`}
                    className="flex items-center gap-2 h-full"
                  >
                    <SquarePen />
                    設定を編集
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <AttractionInfo attractionId={attractionRows[0].id} />
              </CardContent>
            </Card>
            <Separator />
          </div>
        )}
        {foodRows?.length > 0 && (
          <div className="space-y-4 lg:space-y-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>模擬店の情報</CardTitle>
                <Button asChild variant="card" className="max-w-32">
                  <Link
                    href={`/dashboard/admin/store/${store_id}/edit-config/food`}
                    className="flex items-center gap-2 h-full"
                  >
                    設定を編集
                    <SquarePen />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <FoodInfo foodId={foodRows[0].id} />
              </CardContent>
            </Card>
            <Separator />
            <h3 className="text-lg">商品一覧</h3>
            <ItemList foodId={foodRows[0].id} storeId={store_id} />
            <Separator />
            <h3 className="text-lg">商品設定の編集</h3>
            <ItemSelectLink
              foodId={foodRows[0].id}
              href={`/dashboard/admin/store/${store_id}/edit-item`}
              context="商品の設定を編集"
            />
            <Separator />
            <h3 className="text-lg">商品の削除</h3>
            <DisabledItem storeId={store_id} />
          </div>
        )}
        <Separator />
        <p className="text-lg">店舗のスタッフ用認証コード</p>
        <p>認証コード:{storeRows[0].staffCode}</p>
        <Separator />
        <p className="text-lg">店舗の管理者一覧</p>
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
        <p className="text-lg">店舗のスタッフ一覧</p>
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
        <Separator />
        <DeleteStore storeId={store_id} pushUrl="/dashboard" />
      </div>
    </DashboardPageShell>
  );
}
