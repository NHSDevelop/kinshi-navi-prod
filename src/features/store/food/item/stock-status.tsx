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
import { and, eq, asc } from "drizzle-orm";

interface ItemStockStatusProps {
  eventId: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_STORE_NAME_LENGTH = 10;

export default async function ItemStockStatus({
  eventId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: ItemStockStatusProps) {
  const db = await getDb();

  const offset = (page - 1) * pageSize;

  const itemRows = await db
    .select({
      foodId: foods.id,
      storeId: stores.id,
      storeName: stores.name,
      itemId: items.id,
      itemName: items.name,
      stock: items.stock,
      soldStock: items.soldStock,
    })
    .from(items)
    .innerJoin(foods, eq(foods.id, items.foodId))
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(and(eq(stores.eventId, eventId), eq(items.isActive, true)))
    .orderBy(asc(stores.name), asc(items.name))
    .limit(pageSize)
    .offset(offset);

  if (itemRows.length === 0) {
    return <NotFoundPrompt context="商品" />;
  }

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
        soldStock: number | null;
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
            soldStock: row.soldStock,
          },
        ],
      });
      continue;
    }

    current.items.push({
      itemId: row.itemId,
      itemName: row.itemName,
      stock: row.stock,
      soldStock: row.soldStock,
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
        =
        {stockStatusList.map((food) => {
          const truncatedStoreName =
            food.storeName.length > MAX_STORE_NAME_LENGTH
              ? `${food.storeName.slice(0, MAX_STORE_NAME_LENGTH)}...`
              : food.storeName;

          return (
            <Fragment key={food.foodId}>
              {food.items.map((item, itemIndex) => (
                <TableRow key={item.itemId}>
                  {itemIndex === 0 && (
                    <TableCell
                      className="font-semibold md:text-lg"
                      rowSpan={food.items.length}
                      title={food.storeName}
                    >
                      {truncatedStoreName}
                    </TableCell>
                  )}
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>
                    <Badge
                      className="text-sm"
                      variant={item.stock === 0 ? "danger" : "default"}
                    >
                      {item.stock}/{item.stock + (item.soldStock ?? 0)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
