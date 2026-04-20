import { CreateItem } from "@/features/store/food/item/create";
import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";

export default async function CreateFoodItemPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const foodRows = await db
    .select()
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
