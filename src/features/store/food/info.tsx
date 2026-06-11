import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { FOOD_TAG_MAP } from "@/lib/type";
import { eq } from "drizzle-orm";

interface FoodInfoProps {
  foodId: string;
}

export default async function FoodInfo({ foodId }: FoodInfoProps) {
  const db = await getDb();
  const rows = await db
    .select({ id: foods.id, storeId: foods.storeId, tag: foods.tag, isUseLane: foods.isUseLane })
    .from(foods)
    .where(eq(foods.id, foodId))
    .limit(1);
  const food = rows[0];
  if (!food) {
    return <p>模擬店が存在しません。</p>;
  }
  const foodTag =
    FOOD_TAG_MAP[food.tag as keyof typeof FOOD_TAG_MAP]?.label ?? food.tag;
  return (
    <div className="flex gap-2 md:flex-1">
      <div className="flex flex-col items-start gap-4">
        <p>模擬店の種類:</p>
        <p>レーンの使用:</p>
      </div>
      <div className="flex flex-col items-start gap-4">
        <p>{foodTag ?? "未設定"}</p>
        <p>{food.isUseLane ? "使用" : "不使用"}</p>
      </div>
    </div>
  );
}
