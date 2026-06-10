import AttractionWaitngStatus from "@/features/store/attraction/waitng-status";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getMainEvent } from "@/features/event/action";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "企画の待機状況 ",
};

export const dynamic = "force-dynamic";

export default async function AttractionWaitStatusPage() {
  const mainEvent = await getMainEvent();

  if (!mainEvent) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />
      <PageBunner
        title="企画の待機状況"
      />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="待機状況" />}>
          <AttractionWaitngStatus eventId={mainEvent.id} />
        </Suspense>
      </section>
    </div>
  );
}
