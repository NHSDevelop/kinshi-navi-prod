import StoreInfo from "@/features/store/info";
import AttractionInfo from "@/features/store/attraction/info";
import { getDb } from "@/lib/db/drizzle";
import { stores, attractions, foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import FoodInfo from "@/features/store/food/info";
import ItemList from "@/features/store/food/item/list";

export default async function StorePage(props: {
  params: Promise<{ store_slug: string }>;
}) {
  const db = await getDb();
  const { store_slug } = await props.params;
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, store_slug))
    .limit(1);

  if (!storeRows[0]) {
    return <NotFoundPrompt context="店舗" />;
  }
  let attraction = null;
  let food = null;

  if (storeRows[0].storeType === "ATTRACTION") {
    const attractionRows = await db
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, storeRows[0].id))
      .limit(1);
    if (!attractionRows[0]) {
      return <NotFoundPrompt context="店舗に紐づいた企画情報" />;
    }
    attraction = attractionRows[0];
  }

  if (storeRows[0].storeType === "FOOD") {
    const foodRows = await db
      .select()
      .from(foods)
      .where(eq(foods.storeId, storeRows[0].id))
      .limit(1);
    if (!foodRows[0]) {
      return <NotFoundPrompt context="店舗に紐づいた模擬店情報" />;
    }
    food = foodRows[0];
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{storeRows[0].name} | 店舗ページ</h1>
      <StoreInfo storeId={storeRows[0].id} />
      {storeRows[0].storeType === "ATTRACTION" && attraction && (
        <AttractionInfo attractionId={attraction.id} />
      )}
      {storeRows[0].storeType === "FOOD" && food && (
        <div className="flex flex-col gap-4 md:gap-8">
          <FoodInfo foodId={food.id} />
          <ItemList foodId={food.id} />
        </div>
      )}
    </div>
  );
}
