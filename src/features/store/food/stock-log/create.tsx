import { getDb } from "@/lib/db/drizzle";
import { foods, items } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import CreateStockLogForm from "./create-form";

interface CreateStockLogProps {
  storeId: string;
}

export default async function CreateStockLog({ storeId }: CreateStockLogProps) {
  const db = await getDb();
  const foodRows = await db
    .select({ id: foods.id })
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
    .where(and(eq(items.foodId, food.id), eq(items.isActive, true)));

  if (itemList.length === 0) {
    return <p>商品が存在しません。</p>;
  }

  return <CreateStockLogForm items={itemList} />;
}
