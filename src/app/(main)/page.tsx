import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { SystemInfoList } from "@/features/system-info/list";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function EventTopPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 lg:gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-main-200/80 bg-linear-to-br from-main-100 via-main-50 to-white p-6 shadow-sm md:p-8 lg:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-main-300/70 to-transparent" />
        <div className="relative flex flex-col gap-5">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-main-950 md:text-3xl lg:text-4xl">
              Kinshi Navi
              <br />
              ー長野高校金鵄祭システムー
            </h1>
            <p className="text-sm leading-6 text-main-900/75 md:text-base">
              第78回金鵄祭へようこそ。
              <br />
              Kinshi
              Naviでは、整理券の取得、在庫やイベントの確認、人気投票などが行えます。
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-bold text-main-950 md:text-xl mb-4">
          運営からのお知らせ
        </h2>
        <Suspense fallback={<LoadingPrompt context="お知らせ" />}>
          <SystemInfoList />
        </Suspense>
      </section>
    </div>
  );
}
