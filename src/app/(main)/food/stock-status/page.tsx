import ItemStockStatus from "@/features/store/food/item/stock-status";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

export default async function FoodStockStatusPage() {
  const mainEventId = process.env.MAIN_EVENT_ID as string;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          各模擬店の商品在庫状況
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          売り切れや在庫数を一覧で確認できます。5分ごと、または画面に戻ったときに更新します。
        </p>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="在庫状況" />}>
          <ItemStockStatus eventId={mainEventId} />
        </Suspense>
      </section>
    </div>
  );
}
