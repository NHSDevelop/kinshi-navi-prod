import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { foods, items, registerLanes, stores } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import FoodRegisterForm from "./register-form";

type Props = {
  storeId: string;
};

export default async function FoodRegister({ storeId }: Props) {
  const db = await getDb();
  const foodRows = await db
    .select({
      foodId: foods.id,
      storeName: stores.name,
    })
    .from(foods)
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(eq(foods.storeId, storeId));

  if (foodRows.length === 0) {
    return <NotFoundPrompt context="該当する模擬店" />;
  }

  const foodIds = foodRows.map((food) => food.foodId);

  const laneRows = await db
    .select()
    .from(registerLanes)
    .where(inArray(registerLanes.foodId, foodIds));

  if (laneRows.length === 0) {
    return <NotFoundPrompt context="レジレーン" />;
  }

  const itemRows = await db
    .select()
    .from(items)
    .where(inArray(items.foodId, foodIds));

  if (itemRows.length === 0) {
    return <NotFoundPrompt context="模擬店内の商品" />;
  }

  return (
    <FoodRegisterForm
      items={itemRows}
      lanes={laneRows}
      foodOptions={foodRows}
    />
  );
}
