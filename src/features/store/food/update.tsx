import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateFoodConfigForm from "./update-form";

interface UpdateFoodConfigProps {
  storeId: string;
}

export default async function UpdateFoodConfig({
  storeId,
}: UpdateFoodConfigProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(foods)
    .where(eq(foods.storeId, storeId))
    .limit(1);
  const food = rows[0];
  if (!food) {
    return <p>模擬店が存在しません。</p>;
  }
  return <UpdateFoodConfigForm food={food} />;
}
