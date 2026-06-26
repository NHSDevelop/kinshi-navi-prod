import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { SystemInfoList } from "@/features/system-info/list";
import { Suspense } from "react";
import { Metadata } from "next";
import { InstallPrompt } from "@/features/push/install";
import { HelpPrompt } from "@/components/prompt/help";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserTicketList from "@/features/store/attraction/ticket/user-list";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { ReloadButton } from "@/components/navigation/reload-button";

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
        </div>
      </section>
      <Separator />
      {user && user.isAnonymous && (
        <div className="space-y-4">
          <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-main-950 md:text-xl">
                取得した整理券
              </h2>
              <div className="flex gap-2 justify-end items-center">
                <ReloadButton />
                <HelpPrompt title="整理券について">
                  <ul className="w-auto list-disc space-y-4">
                    <li className="text-sm">
                      整理券が「呼び出し中」になったら、企画の開催場所までお越しください。
                    </li>
                    <li className="text-sm">
                      企画に参加する際は、画面右上のユーザーアイコンから、「ゲストユーザーページ」にある整理券のQRコードを受付にて係員に表示してください。
                    </li>
                    <li className="text-sm">
                      整理券が呼び出されたかどうかは、このページ以外にも「イベントページ」→「企画の待機状況」からご覧になることができます。
                    </li>
                    <li className="text-sm">
                      呼び出されていても整理券が「発券済み」の場合は、お手数ですが画面の再読み込みをお願いします。
                    </li>
                    <li className="text-sm">
                      プッシュ通知を購読していると、整理券が呼び出されたときに通知を受け取ることができます。
                    </li>
                  </ul>
                </HelpPrompt>
              </div>
            </div>
            <p className="text-sm">
              ※整理券の状態が更新されない場合、お手数ですが「再読み込み」を押してください。
            </p>
            <div className="mt-4">
              <Suspense fallback={<LoadingPrompt context="取得した整理券" />}>
                <UserTicketList userId={user.id} />
              </Suspense>
            </div>
          </section>
        </div>
      )}
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
