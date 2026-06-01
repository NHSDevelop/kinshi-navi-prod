import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { stores, StoreType } from "@/lib/db/schema";
import CreateStoreVoteForm from "./create-form";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { and, eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";
import { getMainEvent } from "@/features/event/action";

type Props = {
  storeType: StoreType;
};

export default async function CreateStoreVote({ storeType }: Props) {
  const mainEvent = await getMainEvent();
  if (!mainEvent) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  // セッション取得と店舗リストの取得を並列化
  const dbPromise = getDb().then((db) =>
    db
      .select()
      .from(stores)
      .where(
        and(
          eq(stores.eventId, mainEvent.id),
          eq(stores.canVoted, true),
          eq(stores.storeType, storeType),
        ),
      ),
  );

  const [session, storeRows] = await Promise.all([
    getSessionFromRequestHeaders(),
    dbPromise,
  ]);

  const user = session?.user;
  if (!user) {
    return (
      <Suspense fallback={<LoadingPrompt context="ユーザー作成ボタン" />}>
        <CreateAnonymousUser />
      </Suspense>
    );
  }
  if (user.isAnonymous === false) {
    return <p>管理者やスタッフは投票することはできません。</p>;
  }

  if (storeRows.length === 0) {
    return <NotFoundPrompt context="店舗" />;
  }
  return (
    <Suspense fallback={<LoadingPrompt context="投票画面" />}>
      <CreateStoreVoteForm stores={storeRows} storeType={storeType} />
    </Suspense>
  );
}
