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

export default async function AnonymousUserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
          <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
            ゲストユーザーページ
          </h1>
          <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
            まずゲストユーザーを作成してください。
          </p>
        </section>
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <CreateAnonymousUser />
        </section>
      </div>
    );
  }
  if (user.isAnonymous === false) {
    redirect("/dashboard/user");
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          ゲストユーザーページ
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          通知設定、取得済みチケットの確認、ゲストユーザー管理をこのページで行えます。
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-bold text-main-950 md:text-xl">
          ユーザー設定
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <Suspense fallback={<LoadingPrompt context="ユーザー設定" />}>
            <InstallPrompt />
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
          <DeleteAnonymousUser />
        </section>
      )}
    </div>
  );
}
