import { Separator } from "@/components/ui/separator";
import AttracionWaitngStatus from "@/features/store/attraction/waitng-status";
import { getEventBySlug } from "@/features/event/action";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";

export const dynamic = "force-dynamic";

export default async function AttractionWaitStatusPage(props: {
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
      <h1 className="text-lg md:text-xl font-bold">各企画の待機状況</h1>
      <Separator />
      <p>※5分ごと、または画面に戻ったときに更新します。</p>
      <AttracionWaitngStatus eventId={event.id} />
    </div>
  );
}
