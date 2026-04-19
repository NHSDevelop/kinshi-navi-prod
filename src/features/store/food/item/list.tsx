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

interface ItemListProps {
  foodId: string;
}

export default async function ItemList({ foodId }: ItemListProps) {
  const db = await getDb();
  const itemList = await db
    .select()
    .from(items)
    .where(eq(items.foodId, foodId));
  return (
    <div className="space-y-4 lg:space-y-8">
      {itemList.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名</TableHead>
              <TableHead>価格（円）</TableHead>
              <TableHead>在庫数（個）</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="商品" />
      )}
    </div>
  );
}
