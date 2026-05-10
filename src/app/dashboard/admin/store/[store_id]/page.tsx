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
import { AiFillEdit } from "react-icons/ai";
import { Separator } from "@/components/ui/separator";
import { AiFillPlusCircle } from "react-icons/ai";
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

// Store情報は1日に1回程度変わるため、ISR 1時間でキャッシュ
export const revalidate = 3600;

interface AdminStorePageProps {
  params: Promise<{ store_id: string }>;
}

export default async function AdminStorePage({ params }: AdminStorePageProps) {
  const { store_id } = await params;

  const db = await getDb();
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.id, store_id))
    .limit(1);
  if (!storeRows[0]) {
    notFound();
  }

  const attractionRows = await db
    .select()
    .from(attractions)
    .where(eq(attractions.storeId, store_id))
    .limit(1);
  const foodRows = await db
    .select()
    .from(foods)
    .where(eq(foods.storeId, store_id))
    .limit(1);

  const adminRows = await db
    .select({
      id: admins.id,
      name: users.name,
      userId: admins.userId,
      role: admins.role,
    })
    .from(admins)
    .innerJoin(users, eq(users.id, admins.userId))
    .where(and(eq(admins.storeId, store_id), eq(admins.role, "STORE_ADMIN")));

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
      title="店舗の管理"
      description="店舗の基本情報、企画情報、スタッフ情報をまとめて管理できます。"
    >
      <div className="space-y-4 lg:space-y-8">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>店舗の情報</CardTitle>
            <Button asChild variant="card" className="max-w-32">
              <div className="flex gap-2">
                <AiFillEdit />
                <Link
                  href={`/dashboard/admin/store/${store_id}/edit-config/store`}
                >
                  設定を編集
                </Link>
              </div>
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
                  <div className="flex gap-2">
                    <AiFillEdit />
                    <Link
                      href={`/dashboard/admin/store/${store_id}/edit-config/attraction`}
                    >
                      設定を編集
                    </Link>
                  </div>
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
                  <div className="flex gap-2">
                    <AiFillEdit />
                    <Link
                      href={`/dashboard/admin/store/${store_id}/edit-config/food`}
                    >
                      設定を編集
                    </Link>
                  </div>
                </Button>
              </CardHeader>
              <CardContent>
                <FoodInfo foodId={foodRows[0].id} />
              </CardContent>
            </Card>
            <Separator />
            <div className="flex  gap-4">
              <Button asChild variant="card">
                <div className="flex gap-4">
                  <AiFillPlusCircle />
                  <Link href={`/dashboard/admin/store/${store_id}/create-item`}>
                    商品を登録
                  </Link>
                </div>
              </Button>
              <Button asChild variant="card">
                <div className="flex gap-4">
                  <Link href={`/dashboard/admin/store/${store_id}/add-stock`}>
                    商品の在庫を追加
                  </Link>
                </div>
              </Button>
              <Button asChild variant="card">
                <Link
                  href={`/dashboard/staff/store/${store_id}/stock-log-history`}
                >
                  商品在庫の変動履歴
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
                  レジ履歴
                </Link>
              </Button>
            </div>
            <Separator />
            <h3 className="text-lg">商品設定の更新</h3>
            <ItemSelectLink
              foodId={foodRows[0].id}
              href={`/dashboard/admin/store/${store_id}/edit-item`}
              context="商品の設定を編集"
            />
            <Separator />
            <h3 className="text-lg">商品一覧</h3>
            <ItemList foodId={foodRows[0].id} storeId={store_id} />
          </div>
        )}
        <Separator />
        <p className="text-lg">店舗のスタッフを招待</p>
        <Button asChild variant="card">
          <Link href={`/dashboard/admin/store/${store_id}/issue-invite`}>
            招待リンクを発行
          </Link>
        </Button>
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
