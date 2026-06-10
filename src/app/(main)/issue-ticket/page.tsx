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
  title: "整理券発行 ",
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
          title="整理券を発行する"
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
        title="整理券を発行する"
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
            管理者やスタッフはこのページで整理券を取得することはできません。
          </p>
        </section>
      )}
    </div>
  );
}
