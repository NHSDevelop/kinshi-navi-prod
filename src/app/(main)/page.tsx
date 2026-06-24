import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { SystemInfoList } from "@/features/system-info/list";
import { Suspense } from "react";
import { Metadata } from "next";
import { InstallPrompt } from "@/features/push/install";
import { HelpPrompt } from "@/components/prompt/help";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "トップページ",
};

export const dynamic = "force-dynamic";

export default async function EventTopPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10">
      <section>
        <div className="flex flex-col gap-6 ">
          <div className="max-w-2xl space-y-4">
            <h1 className="font-bold tracking-tight text-4xl lg:text-5xl">
              Kinshi Navi
              <span className="block text-sm font-medium tracking-wider mt-1 md:text-base  lg:inline lg:mt-0 lg:ml-2">
                ー長野高校金鵄祭システムー
              </span>
            </h1>
            <Separator />
            <div className="p-2 space-y-1 text-sm">
              <p className="text-sm lg:text-base">第78回金鵄祭へようこそ。</p>
              <p className="text-sm lg:text-base">
                第78回金鵄祭は、6/26~6/28に行われる長野県長野高等学校の文化祭です。
              </p>
              <p className="text-sm lg:text-base">
                Kinshi
                Naviでは、整理券の取得、在庫やイベントの確認、人気投票などが行えます。
                スマホで利用される方は、画面左上のメニューバーを押すと、各ページに移動できます。
              </p>
            </div>
          </div>

          <div className="w-full max-w-md px-4">
            <Image
              src="/images/poster.webp"
              alt="ポスター画像"
              width={1423}
              height={2048}
              sizes="(max-w-768px) 100vw, 448px"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>
      </section>
      <Separator />
      <Button asChild className="max-w-xs">
        <Link href="/help">使い方ガイド</Link>
      </Button>
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
