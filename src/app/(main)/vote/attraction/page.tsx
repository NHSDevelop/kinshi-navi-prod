import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import CreateStoreVote from "@/features/store/vote/create";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AttractionVotePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          企画の投票
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          クラス企画の投票フォームです。気に入った企画に投票してください。
        </p>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="投票画面" />}>
          <CreateStoreVote storeType="ATTRACTION" />
        </Suspense>
      </section>
    </div>
  );
}
