import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { getMainEvent } from "@/features/event/action";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Suspense } from "react";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "チケット発行 ",
};

export const dynamic = "force-dynamic";

export default async function TicketIssuePage() {
  const mainEvent = await getMainEvent();

  if (!mainEvent) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
        <PageBunner
          title="チケットを発行する"
          description="ゲストユーザーとしてログインして、チケットを発行できます。"
        />
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <Suspense
            fallback={<LoadingPrompt context="ゲストユーザーの作成画面" />}
          >
            <CreateAnonymousUser />
          </Suspense>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      <PageBunner
        title="チケットを発行する"
        description="混雑時の呼び出しをスムーズにするため、受付用チケットをこの画面から発行できます。"
      />
      {user.isAnonymous ? (
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <Suspense fallback={<LoadingPrompt context="発行画面" />}>
            <IssueTicket eventId={mainEvent.id} isPaper={false} />
          </Suspense>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 md:p-5">
          <p className="text-sm leading-6 md:text-base">
            管理者やスタッフはこのページでチケットを取得することはできません。
          </p>
        </section>
      )}
    </div>
  );
}
