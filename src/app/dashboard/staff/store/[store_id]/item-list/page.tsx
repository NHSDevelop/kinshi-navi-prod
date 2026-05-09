import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Separator } from "@/components/ui/separator";
import ItemList from "@/features/store/food/item/list";
import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

// Item情報は1日に1回程度変わるため、ISR 1時間でキャッシュ
export const revalidate = 3600;

export default async function ItemListPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  const db = await getDb();
  const foodRows = await db
    .select({ id: foods.id })
    .from(foods)
    .where(eq(foods.storeId, store_id))
    .limit(1);
  if (foodRows.length === 0) {
    return <NotFoundPrompt context="該当する模擬店" />;
  }
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">商品の一覧</h1>
      <Separator />
      <ItemList foodId={foodRows[0].id} />
    </div>
  );
}
