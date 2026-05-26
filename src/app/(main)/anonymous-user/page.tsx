import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { PushNotificationManager } from "@/features/push/manager";
import UserTicketList from "@/features/store/attraction/ticket/user-list";
import DeleteAnonymousUser from "@/features/auth/anonymous/delete";
import { redirect } from "next/navigation";
import { InstallPrompt } from "@/features/push/install";
import { HelpPrompt } from "@/components/prompt/help";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { Separator } from "@/components/ui/separator";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ゲストユーザーページ ",
};

export default async function AnonymousUserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <PageBunner
          title="ゲストユーザーページ"
          description="まずユーザーを作成して下さい。"
        />
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <Suspense fallback={<LoadingPrompt context="ユーザー作成ボタン" />}>
            <CreateAnonymousUser />
          </Suspense>
        </section>
      </div>
    );
  }
  if (user.isAnonymous === false) {
    redirect("/dashboard/user");
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <PageBunner
        title="ゲストユーザーページ"
        description="通知設定、取得済みチケットの確認、ゲストユーザー管理をこのページで行えます。"
      />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-bold text-main-950 md:text-xl mb-4">
          ユーザー設定
        </h2>
        <Separator />
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className=" text-main-950 md:text-lg">
              Webアプリのインストール
            </h3>
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
                    インストールする際、チケットなどのデータはブラウザから受け継がれませんのでご注意ください。
                  </li>
                </ul>
              </div>
            </HelpPrompt>
          </div>
          <Suspense fallback={<LoadingPrompt context="インストールガイド" />}>
            <InstallPrompt />
          </Suspense>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <h3 className=" text-main-950 md:text-lg">プッシュ通知の設定</h3>
            <HelpPrompt title="プッシュ通知について">
              <div>
                <ul className="w-auto list-disc space-y-4">
                  <li className="text-sm">
                    プッシュ通知を有効にすると、チケットの呼び出しなどの情報をリアルタイムで受け取ることができます。
                  </li>
                  <li className="text-sm">
                    iPhone / iPadをお使いの場合:
                    Webアプリとしてインストールした場合のみ利用することができます。
                  </li>
                  <li className="text-sm">
                    Android / PCをお使いの場合：
                    ブラウザ・Webアプリのどちらも利用することができます。
                  </li>
                  <li className="text-sm">
                    ページ内の「プッシュ通知を有効にする」を押した後、画面に表示される通知の許可画面で「通知を許可」を押すことでプッシュ通知機能をご利用いただけます。
                  </li>
                </ul>
              </div>
            </HelpPrompt>
          </div>
          <Suspense fallback={<LoadingPrompt context="プッシュ通知" />}>
            <PushNotificationManager />
          </Suspense>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-main-950 md:text-xl">
            取得したチケット
          </h2>
          <HelpPrompt title="チケットについて">
            <ul className="w-auto list-disc space-y-4">
              <li className="text-sm">
                チケットが「呼び出し中」になったら、企画の開催場所までお越しください。
              </li>
              <li className="text-sm">
                企画に参加する際は、画面右上のユーザーアイコンから、「ゲストユーザーページ」にあるチケットのQRコードを受付にて係員に表示してください。
              </li>
              <li className="text-sm">
                チケットが呼び出されたかどうかは、このページ以外にも「イベントページ」→「企画の待機状況」からご覧になることができます。
              </li>
              <li className="text-sm">
                呼び出されていてもチケットが「発券済み」の場合は、お手数ですが画面の再読み込みをお願いします。
              </li>
              <li className="text-sm">
                プッシュ通知を購読していると、チケットが呼び出されたときに通知を受け取ることができます。
              </li>
            </ul>
          </HelpPrompt>
        </div>
        <div className="mt-4">
          <Suspense fallback={<LoadingPrompt context="取得したチケット" />}>
            <UserTicketList userId={user.id} />
          </Suspense>
        </div>
      </section>

      {user.isAnonymous && (
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <Suspense fallback={<LoadingPrompt context="削除ボタン" />}>
            <DeleteAnonymousUser />
          </Suspense>
        </section>
      )}
    </div>
  );
}
