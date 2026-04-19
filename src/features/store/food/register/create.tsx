import { getDb } from "@/lib/db/drizzle";
import { foods, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import FoodRegisterForm from "../register-form";

interface CreateRegisterProps {
  storeId: string;
}

export default async function CreateRegister({ storeId }: CreateRegisterProps) {
  const db = await getDb();
  const foodRows = await db
    .select()
    .from(foods)
    .where(eq(foods.storeId, storeId))
    .limit(1);

  const food = foodRows[0];
  if (!food) {
    return <p>模擬店が存在しません。</p>;
  }

  const itemList = await db
    .select()
    .from(items)
    .where(eq(items.foodId, food.id));

  if (itemList.length === 0) {
    return <p>商品が存在しません。</p>;
  }

  return <FoodRegisterForm foodId={food.id} items={itemList} />;
}
