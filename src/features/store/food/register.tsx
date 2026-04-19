import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { foods, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import FoodRegisterForm from "./register-form";

type Props = {
  storeId: string;
};

export default async function FoodRegister({ storeId }: Props) {
  const db = await getDb();
  const foodRows = await db
    .select()
    .from(foods)
    .where(eq(foods.storeId, storeId))
    .limit(1);
  const food = foodRows[0];
  if (!food) {
    return <NotFoundPrompt context="該当する模擬店" />;
  }
  const itemRows = await db
    .select()
    .from(items)
    .where(eq(items.foodId, food.id));
  if (itemRows.length === 0) {
    return <NotFoundPrompt context="模擬店内の商品" />;
  }
  return <FoodRegisterForm foodId={food.id} items={itemRows} />;
}
