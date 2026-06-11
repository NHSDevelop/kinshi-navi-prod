import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDb } from "@/lib/db/drizzle";
import {
  foods,
  items,
  registerLogs,
  registerLanes,
  stockLogs,
  stores,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

type SaleStockChange = {
  id: string;
  itemName: string;
  difference: number;
  meta: string | null;
  createdAt: Date;
};

type HistoryBlock =
  | {
      id: string;
      type: "REGISTER";
      totalAmount: number;
      amountPaid: number;
      laneNumber: number | null;
      meta: string | null;
      createdAt: Date;
      storeName: string | null;
      relatedStockChanges: SaleStockChange[];
    }
  | {
      id: string;
      type: "STOCK";
      itemName: string;
      difference: number;
      meta: string | null;
      createdAt: Date;
    };

export default async function CombinedHistoryList() {
  const db = await getDb();

  const [registerRows, stockRows] = await Promise.all([
    db
      .select({
        id: registerLogs.id,
        totalAmount: registerLogs.totalAmount,
        amountPaid: registerLogs.amountPaid,
        laneNumber: registerLanes.laneNumber,
        meta: registerLogs.meta,
        createdAt: registerLogs.createdAt,
        storeName: stores.name,
      })
      .from(registerLogs)
      .leftJoin(registerLanes, eq(registerLanes.id, registerLogs.laneId))
      .leftJoin(foods, eq(foods.id, registerLogs.foodId))
      .leftJoin(stores, eq(stores.id, foods.storeId))
      .orderBy(asc(registerLogs.createdAt)),
    db
      .select({
        id: stockLogs.id,
        itemName: items.name,
        difference: stockLogs.difference,
        meta: stockLogs.meta,
        createdAt: stockLogs.createdAt,
      })
      .from(stockLogs)
      .innerJoin(items, eq(items.id, stockLogs.itemId))
      .orderBy(asc(stockLogs.createdAt)),
  ]);

  const pendingSaleStockChanges: SaleStockChange[] = [];

  const mergedEvents: Array<
    | {
        type: "REGISTER";
        id: string;
        createdAt: Date;
        totalAmount: number;
        amountPaid: number;
        laneNumber: number | null;
        meta: string | null;
        storeName: string | null;
      }
    | {
        type: "STOCK";
        id: string;
        createdAt: Date;
        itemName: string;
        difference: number;
        meta: string | null;
      }
  > = [
    ...registerRows.map((log) => ({
      type: "REGISTER" as const,
      id: log.id,
      createdAt: log.createdAt,
      totalAmount: log.totalAmount,
      amountPaid: log.amountPaid,
      laneNumber: log.laneNumber,
      meta: log.meta,
      storeName: log.storeName,
    })),
    ...stockRows.map((log) => ({
      type: "STOCK" as const,
      id: log.id,
      createdAt: log.createdAt,
      itemName: log.itemName,
      difference: log.difference,
      meta: log.meta,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const historyBlocks: HistoryBlock[] = [];

  for (const event of mergedEvents) {
    if (event.type === "STOCK") {
      if (event.meta?.startsWith("会計時に販売:")) {
        pendingSaleStockChanges.push(event);
        continue;
      }

      historyBlocks.push({
        id: event.id,
        type: "STOCK",
        itemName: event.itemName,
        difference: event.difference,
        meta: event.meta,
        createdAt: event.createdAt,
      });
      continue;
    }

    historyBlocks.push({
      id: event.id,
      type: "REGISTER",
      totalAmount: event.totalAmount,
      amountPaid: event.amountPaid,
      laneNumber: event.laneNumber,
      meta: event.meta,
      createdAt: event.createdAt,
      storeName: event.storeName,
      relatedStockChanges: pendingSaleStockChanges.splice(0),
    });
  }

  if (pendingSaleStockChanges.length > 0) {
    historyBlocks.push({
      id: `unlinked-sale-stock-${pendingSaleStockChanges[0].id}`,
      type: "STOCK",
      itemName: "会計に紐づかない在庫変動",
      difference: pendingSaleStockChanges.reduce(
        (sum, change) => sum + change.difference,
        0,
      ),
      meta: pendingSaleStockChanges
        .map((change) => `${change.itemName}: ${change.meta ?? "-"}`)
        .join(" / "),
      createdAt: pendingSaleStockChanges[0].createdAt,
    });
  }

  if (historyBlocks.length === 0) {
    return <NotFoundPrompt context="会計・在庫履歴" />;
  }

  return (
    <div className="space-y-4">
      {historyBlocks.map((block) => {
        if (block.type === "REGISTER") {
          const change = block.amountPaid - block.totalAmount;
          const changeLabel =
            change >= 0
              ? `${change.toLocaleString()}円`
              : `${change.toLocaleString()}円不足`;

          return (
            <Card key={block.id} className="border-main-200/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-sm" variant="info">
                      会計
                    </Badge>
                    <CardTitle className="text-lg">
                      {block.storeName ? `${block.storeName} の会計記録` : "レーン会計"}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(block.createdAt).toLocaleString()}</span>
                    <span>レジレーン: {block.laneNumber ?? "未設定"}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">合計金額</p>
                    <p className="text-lg font-semibold">
                      {block.totalAmount.toLocaleString()}円
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">受取金額</p>
                    <p className="text-lg font-semibold">
                      {block.amountPaid.toLocaleString()}円
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">お釣り</p>
                    <p className="text-lg font-semibold">{changeLabel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">メモ</p>
                  <p className="mt-1 text-sm">{block.meta ?? "-"}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="text-sm" variant="default">
                      在庫変動
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      この会計に紐づく在庫変動
                    </p>
                  </div>

                  {block.relatedStockChanges.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {block.relatedStockChanges.map((stockChange) => {
                        const isIncrease = stockChange.difference > 0;
                        return (
                          <div
                            key={stockChange.id}
                            className="rounded-lg border bg-muted/30 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium">
                                {stockChange.itemName}
                              </p>
                              <Badge
                                className="text-sm"
                                variant={isIncrease ? "success" : "danger"}
                              >
                                {stockChange.difference > 0
                                  ? `+${stockChange.difference}`
                                  : stockChange.difference}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {stockChange.meta ?? "-"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(stockChange.createdAt).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      この会計では在庫変動は記録されていません。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }

        const isIncrease = block.difference > 0;

        return (
          <Card key={block.id} className="border-dashed shadow-none">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="text-sm" variant="danger">
                    在庫
                  </Badge>
                  <CardTitle className="text-lg">在庫調整</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(block.createdAt).toLocaleString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{block.itemName}</p>
                <Badge
                  className="text-sm"
                  variant={isIncrease ? "success" : "danger"}
                >
                  {block.difference > 0
                    ? `+${block.difference}`
                    : block.difference}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {block.meta ?? "-"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}