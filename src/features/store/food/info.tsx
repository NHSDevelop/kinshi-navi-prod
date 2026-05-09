import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface FoodInfoProps {
  foodId: string;
}

export default async function FoodInfo({ foodId }: FoodInfoProps) {
  const db = await getDb();
  const rows = await db
    .select({ id: foods.id, storeId: foods.storeId })
    .from(foods)
    .where(eq(foods.id, foodId))
    .limit(1);
  const food = rows[0];
  if (!food) {
    return <p>模擬店が存在しません。</p>;
  }
  return <></>; //模擬店固有の情報がないため未追加
}
