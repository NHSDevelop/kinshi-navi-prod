import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import StoreList from "@/features/store/list";
import { Suspense } from "react";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "店舗一覧 ",
};

export default async function StoreListPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <PageBunner
        title="店舗一覧"
      />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <Suspense fallback={<LoadingPrompt context="店舗の一覧" />}>
          <StoreList />
        </Suspense>
      </section>
    </div>
  );
}
