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
import { foods, items, stockLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

interface StockLogListProps {
  storeId: string;
}

export default async function StockLogList({ storeId }: StockLogListProps) {
  const db = await getDb();

  const foodRows = await db
    .select({ id: foods.id })
    .from(foods)
    .where(eq(foods.storeId, storeId))
    .limit(1);

  const food = foodRows[0];
  if (!food) {
    return <NotFoundPrompt context="模擬店" />;
  }

  const logRows = await db
    .select({
      id: stockLogs.id,
      itemName: items.name,
      difference: stockLogs.difference,
      meta: stockLogs.meta,
      createdAt: stockLogs.createdAt,
    })
    .from(stockLogs)
    .innerJoin(items, eq(items.id, stockLogs.itemId))
    .where(eq(items.foodId, food.id))
    .orderBy(desc(stockLogs.createdAt));

  if (logRows.length === 0) {
    return <NotFoundPrompt context="在庫履歴" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>商品名</TableHead>
          <TableHead>変動数</TableHead>
          <TableHead>メモ</TableHead>
          <TableHead>記録日時</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logRows.map((log) => {
          const isIncrease = log.difference > 0;
          return (
            <TableRow key={log.id}>
              <TableCell className="font-medium md:text-lg">
                {log.itemName}
              </TableCell>
              <TableCell>
                <Badge
                  className="text-sm"
                  variant={isIncrease ? "success" : "danger"}
                >
                  {log.difference > 0 ? `+${log.difference}` : log.difference}
                </Badge>
              </TableCell>
              <TableCell>{log.meta ?? "-"}</TableCell>
              <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
