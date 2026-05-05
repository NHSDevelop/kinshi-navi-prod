import { Separator } from "@/components/ui/separator";
import ItemStockStatus from "@/features/store/food/item/stock-status";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";

// 在庫状況は15分単位で十分（ポーリングは5分、force-dynamic廃止してISR化）
export const revalidate = 15 * 60;

export default async function FoodStockStatusPage() {
  const mainEventId = process.env.MAIN_EVENT_ID as string;

  return (
    <div className="flex flex-col gap-4">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <h1 className="text-lg md:text-xl font-bold">各模擬店の商品在庫状況</h1>
      <Separator />
      <ItemStockStatus eventId={mainEventId} />
      <p>※5分ごと、または画面に戻ったときに更新します。</p>
    </div>
  );
}
