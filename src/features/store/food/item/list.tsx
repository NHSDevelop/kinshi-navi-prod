import { getDb } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import ItemInfo from "./info";

interface ItemListProps {
  foodId: string;
  storeId?: string;
}

export default async function ItemList({ foodId }: ItemListProps) {
  const db = await getDb();
  const itemRows = await db
    .select({
      id: items.id,
      name: items.name,
      stock: items.stock,
      price: items.price,
    })
    .from(items)
    .where(and(eq(items.foodId, foodId), eq(items.isActive, true)));
  return (
    <div className="space-y-4 lg:space-y-8">
      {itemRows.length > 0 ? (
        <div className="flex flex-col gap-4">
          {itemRows.map((item) => (
            <ItemInfo key={item.id} itemId={item.id} />
          ))}
        </div>
      ) : (
        <NotFoundPrompt context="商品" />
      )}
    </div>
  );
}
