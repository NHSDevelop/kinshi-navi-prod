import { getDb } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ItemInfo from "./info";

interface ItemListProps {
  foodId: string;
  storeId?: string;
}

export default async function ItemList({ foodId, storeId }: ItemListProps) {
  const db = await getDb();
  const itemRows = await db
    .select()
    .from(items)
    .where(eq(items.foodId, foodId));
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
