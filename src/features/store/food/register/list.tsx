import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/lib/db/drizzle";
import { foods, registerLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

interface RegisterLogListProps {
  storeId: string;
}

export default async function RegisterLogList({
  storeId,
}: RegisterLogListProps) {
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
      id: registerLogs.id,
      totalAmount: registerLogs.totalAmount,
      amountPaid: registerLogs.amountPaid,
      meta: registerLogs.meta,
      createdAt: registerLogs.createdAt,
    })
    .from(registerLogs)
    .where(eq(registerLogs.foodId, food.id))
    .orderBy(desc(registerLogs.createdAt));

  if (logRows.length === 0) {
    return <NotFoundPrompt context="会計履歴" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>合計金額</TableHead>
          <TableHead>受取金額</TableHead>
          <TableHead>お釣り</TableHead>
          <TableHead>メモ</TableHead>
          <TableHead>記録日時</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logRows.map((log) => {
          const change = log.amountPaid - log.totalAmount;
          const isPositive = change >= 0;
          return (
            <TableRow key={log.id}>
              <TableCell>{log.totalAmount.toLocaleString()}円</TableCell>
              <TableCell>{log.amountPaid.toLocaleString()}円</TableCell>
              <TableCell>
                <Badge
                  className="text-sm"
                  variant={isPositive ? "success" : "danger"}
                >
                  {change >= 0
                    ? `${change.toLocaleString()}円`
                    : `${change.toLocaleString()}円不足`}
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
