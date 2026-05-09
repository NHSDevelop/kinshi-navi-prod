import { CreateItem } from "@/features/store/food/item/create";
import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";
import { requireStoreAdminUser } from "@/lib/auth-guard";
// Item情報は1日に1回程度変わるため、ISR 1時間でキャッシュ
export const revalidate = 3600;
export default async function CreateFoodItemPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  const db = await getDb();

  const foodRows = await db
    .select({ id: foods.id, storeId: foods.storeId })
    .from(foods)
    .where(eq(foods.storeId, store_id))
    .limit(1);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">商品を登録</h1>
      <Separator />
      {foodRows?.length > 0 && <CreateItem foodId={foodRows[0].id} />}
    </div>
  );
}
