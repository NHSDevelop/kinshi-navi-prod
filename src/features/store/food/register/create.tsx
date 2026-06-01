import { getDb } from "@/lib/db/drizzle";
import { foods, items, registerLanes, stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import FoodRegisterForm from "./register-form";

interface CreateRegisterProps {
  storeId: string;
}

export default async function CreateRegister({ storeId }: CreateRegisterProps) {
  const db = await getDb();
  const foodRows = await db
    .select({
      foodId: foods.id,
      storeName: stores.name,
    })
    .from(foods)
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(eq(foods.storeId, storeId))
    .limit(1);

  const food = foodRows[0];
  if (!food) {
    return <p>模擬店が存在しません。</p>;
  }

  const itemList = await db
    .select()
    .from(items)
    .where(eq(items.foodId, food.foodId));

  if (itemList.length === 0) {
    return <p>商品が存在しません。</p>;
  }

  const laneRows = await db
    .select()
    .from(registerLanes)
    .where(eq(registerLanes.foodId, food.foodId));

  if (laneRows.length === 0) {
    return <p>レジレーンが存在しません。</p>;
  }

  return (
    <FoodRegisterForm
      items={itemList}
      lanes={laneRows}
      foodOptions={foodRows}
    />
  );
}
