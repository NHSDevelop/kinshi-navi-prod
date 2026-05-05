import { Separator } from "@/components/ui/separator";
import AttractionWaitngStatus from "@/features/store/attraction/waitng-status";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";

// 待機状況は15分単位で十分（ポーリングは5分）
export const revalidate = 15 * 60;

export default async function AttractionWaitStatusPage() {
  const eventId = process.env.MAIN_EVENT_ID as string;

  return (
    <div className="flex flex-col gap-4">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <h1 className="text-lg md:text-xl font-bold">各企画の待機状況</h1>
      <Separator />
      <p>※5分ごと、または画面に戻ったときに更新します。</p>
      <AttractionWaitngStatus eventId={eventId} />
    </div>
  );
}
