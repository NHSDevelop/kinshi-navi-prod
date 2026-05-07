import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import StoreList from "@/features/store/list";
import { Suspense } from "react";

export default async function StoreListPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          店舗一覧
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          企画と模擬店をまとめて確認できます。店舗名をクリックすると、詳細を確認できます。
        </p>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="店舗の一覧" />}>
          <StoreList />
        </Suspense>
      </section>
    </div>
  );
}
