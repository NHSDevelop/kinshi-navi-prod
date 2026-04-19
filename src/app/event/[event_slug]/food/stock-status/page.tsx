import { Separator } from "@/components/ui/separator";
import ItemStockStatus from "@/features/store/food/item/stock-status";
import { getEventBySlug } from "@/features/event/action";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";

export default async function FoodStockStatusPage(props: {
  params: Promise<{ event_slug: string }>;
}) {
  const { event_slug } = await props.params;
  const event = await getEventBySlug(event_slug);

  if (!event) {
    return <NotFoundPrompt context="イベント" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <h1 className="text-lg md:text-xl font-bold">各模擬店の商品在庫状況</h1>
      <Separator />
      <ItemStockStatus eventId={event.id} />
      <p>※5分ごと、または画面に戻ったときに更新します。</p>
    </div>
  );
}
