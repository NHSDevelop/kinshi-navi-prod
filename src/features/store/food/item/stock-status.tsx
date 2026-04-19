import { Fragment } from "react";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDb } from "@/lib/db/drizzle";
import { foods, items, stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ItemStockStatusProps {
  eventId: string;
}

export default async function ItemStockStatus({
  eventId,
}: ItemStockStatusProps) {
  const db = await getDb();

  const itemRows = await db
    .select({
      foodId: foods.id,
      storeId: stores.id,
      storeName: stores.name,
      itemId: items.id,
      itemName: items.name,
      stock: items.stock,
    })
    .from(items)
    .innerJoin(foods, eq(foods.id, items.foodId))
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(eq(stores.eventId, eventId))
    .orderBy(stores.name, items.name);

  if (itemRows.length === 0) {
    return <NotFoundPrompt context="商品" />;
  }

  // foodごとにitemをグループ化
  const foodItemMap = new Map<
    string,
    {
      foodId: string;
      storeId: string;
      storeName: string;
      items: Array<{
        itemId: string;
        itemName: string;
        stock: number;
      }>;
    }
  >();

  for (const row of itemRows) {
    const current = foodItemMap.get(row.foodId);

    if (!current) {
      foodItemMap.set(row.foodId, {
        foodId: row.foodId,
        storeId: row.storeId,
        storeName: row.storeName,
        items: [
          {
            itemId: row.itemId,
            itemName: row.itemName,
            stock: row.stock,
          },
        ],
      });
      continue;
    }

    current.items.push({
      itemId: row.itemId,
      itemName: row.itemName,
      stock: row.stock,
    });
  }

  const stockStatusList = Array.from(foodItemMap.values()).sort((a, b) =>
    a.storeName.localeCompare(b.storeName),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>模擬店名</TableHead>
          <TableHead>商品名</TableHead>
          <TableHead>在庫</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockStatusList.map((food) => (
          <Fragment key={food.foodId}>
            {food.items.map((item, itemIndex) => (
              <TableRow key={item.itemId}>
                {itemIndex === 0 && (
                  <TableCell
                    className="font-semibold md:text-lg"
                    rowSpan={food.items.length}
                  >
                    {food.storeName}
                  </TableCell>
                )}
                <TableCell>{item.itemName}</TableCell>
                <TableCell>
                  <Badge
                    className="text-sm"
                    variant={item.stock === 0 ? "danger" : "default"}
                  >
                    {item.stock}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
