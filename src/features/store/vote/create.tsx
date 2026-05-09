import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { stores, StoreType } from "@/lib/db/schema";
import CreateStoreVoteForm from "./create-form";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { eq } from "drizzle-orm";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

type Props = {
  storeType: StoreType;
};

export default async function CreateStoreVote({ storeType }: Props) {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;
  if (!user) {
    return <CreateAnonymousUser />;
  }
  if (user.isAnonymous === false) {
    return <p>管理者やスタッフは投票することはできません。</p>;
  }
  const mainEventId = process.env.MAIN_EVENT_ID;
  if (!mainEventId) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  const db = await getDb();
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.eventId, mainEventId));
  if (storeRows.length === 0) {
    return <NotFoundPrompt context="店舗" />;
  }
  return <CreateStoreVoteForm stores={storeRows} storeType={storeType} />;
}
