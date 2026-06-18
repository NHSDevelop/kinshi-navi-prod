import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import CreateStoreVote from "@/features/store/vote/create";
import { Suspense } from "react";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "企画の投票",
};

export const dynamic = "force-dynamic";

export default function AttractionVotePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      <PageBunner title="企画の投票" />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="投票画面" />}>
          <CreateStoreVote storeType="ATTRACTION" />
        </Suspense>
      </section>
    </div>
  );
}
