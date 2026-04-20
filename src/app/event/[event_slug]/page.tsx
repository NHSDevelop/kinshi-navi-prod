import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import EventInfo from "@/features/event/info";
import { getEventBySlug } from "@/features/event/action";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const revalidate = 60;

export default async function EventTopPage(props: {
  params: Promise<{ event_slug: string }>;
}) {
  const { event_slug } = await props.params;
  const event = await getEventBySlug(event_slug);

  if (!event) {
    return <NotFoundPrompt context="イベント" />;
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="text-lg md:text-xl font-bold">
        {event.name} | イベントページ
      </h1>
      <Separator />
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max gap-2 pb-4">
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/event/${event_slug}/issue-ticket`}>
              チケットを発行
            </Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/event/${event_slug}/store-list`}>店舗一覧</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/event/${event_slug}/attraction/waiting-status`}>
              企画の待機状況
            </Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/event/${event_slug}/food/stock-status`}>
              模擬店の在庫状況
            </Link>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <h2 className="text-lg md:text-xl">イベント情報</h2>
      <EventInfo eventId={event.id} />
    </div>
  );
}
