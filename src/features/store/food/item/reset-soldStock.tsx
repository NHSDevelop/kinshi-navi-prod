import { getDb } from "@/lib/db/drizzle";
import { foods, items } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import ResetItemSoldStockForm from "./reset-soldStock-form";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

type Props = {
  storeId: string;
};

export default async function ResetItemSoldStock({ storeId }: Props) {
  const db = await getDb();
  const foodRows = await db
    .select({ id: foods.id })
    .from(foods)
    .where(eq(foods.storeId, storeId))
    .limit(1);
  const foodId = foodRows[0]?.id;
  const itemRows = await db
    .select()
    .from(items)
    .where(and(eq(items.foodId, foodId), eq(items.isActive, true)));
  if (itemRows.length === 0) {
    return <NotFoundPrompt context="商品" />;
  }

  return <ResetItemSoldStockForm items={itemRows} />;
}
