import { Separator } from "@/components/ui/separator";
import AttractionWaitngStatus from "@/features/store/attraction/waitng-status";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";
import { notFound } from "next/navigation";
import { getMainEvent } from "@/features/event/action";

export const dynamic = "force-dynamic";

export default async function AttractionWaitStatusPage() {
  const event = await getMainEvent();
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <h1 className="text-lg md:text-xl font-bold">各企画の待機状況</h1>
      <Separator />
      <p>※5分ごと、または画面に戻ったときに更新します。</p>
      <AttractionWaitngStatus eventId={event.id} />
    </div>
  );
}
