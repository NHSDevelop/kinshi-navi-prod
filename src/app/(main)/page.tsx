import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { SystemInfoList } from "@/features/system-info/list";
import { Suspense } from "react";
import { Metadata } from "next";
import { InstallPrompt } from "@/features/push/install";
import { HelpPrompt } from "@/components/prompt/help";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "トップページ",
};

export const dynamic = "force-dynamic";

export default async function EventTopPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      <section className="relative overflow-hidden rounded-2xl border border-main-200 bg-linear-to-br from-main-100/40 via-main-50/30 to-white p-5 shadow-xs md:p-6">
        <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-main-200/20 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-biloba-flower-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-main-300/40 to-transparent" />
        <div className="relative flex flex-col gap-2.5">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-biloba-flower-950 md:text-2xl lg:text-3xl">
              Kinshi Navi
              <span className="block text-xs font-medium text-biloba-flower-950 tracking-wider mt-1 md:text-sm lg:inline lg:mt-0 lg:ml-2">
                ー長野高校金鵄祭システムー
              </span>
            </h1>
            <p className="text-xs leading-relaxed text-biloba-flower-950 md:text-sm">
              第78回金鵄祭へようこそ。
              <br />
              Kinshi
              Naviでは、整理券の取得、在庫やイベントの確認、人気投票などが行えます。
              <br />
              スマホで利用される方は、画面左上のメニューバーを押すと、各ページに移動できます。
            </p>
          </div>
        </div>
      </section>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>運営からのお知らせ</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingPrompt context="お知らせ" />}>
            <SystemInfoList />
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Webアプリのインストール</CardTitle>
          <HelpPrompt title="Webアプリのインストールについて">
            <div>
              <ul className="w-auto list-disc space-y-4">
                <li className="text-sm">
                  ホーム画面に追加して、アプリのように素早く起動できます。
                </li>
                <li className="text-sm">
                  インストールは数十秒で終わり、通信料はほとんど発生しません。
                </li>
                <li className="text-sm">
                  インストールする際、整理券などのデータはブラウザから受け継がれませんのでご注意ください。
                </li>
              </ul>
            </div>
          </HelpPrompt>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingPrompt context="インストールガイド" />}>
            <InstallPrompt />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
