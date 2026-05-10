import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TicketIssuePage() {
  const mainEventId = process.env.MAIN_EVENT_ID as string;

  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
        <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
          <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
            チケットを発行する
          </h1>
          <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
            ゲストユーザーとしてログインして、チケットを発行できます。
          </p>
        </section>
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
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          チケットを発行する
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          混雑時の呼び出しをスムーズにするため、受付用チケットをこの画面から発行できます。
        </p>
      </section>
      {user.isAnonymous ? (
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <Suspense fallback={<LoadingPrompt context="発行画面" />}>
            <IssueTicket eventId={mainEventId} isPaper={false} />
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
