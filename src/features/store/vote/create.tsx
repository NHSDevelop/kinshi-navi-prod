import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { stores, StoreType } from "@/lib/db/schema";
import CreateStoreVoteForm from "./create-form";
import { getCurrentUser } from "@/features/auth/anonymous/action";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { getMainEvent } from "@/features/event/action";
import { eq } from "drizzle-orm";

type Props = {
  storeType: StoreType;
};

export default async function CreateStoreVote({ storeType }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return <CreateAnonymousUser />;
  }
  if (user.isAnonymous === false) {
    return <p>管理者やスタッフは投票することはできません。</p>;
  }
  const event = await getMainEvent();
  if (!event) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  const db = await getDb();
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.eventId, event.id));
  if (storeRows.length === 0) {
    return <NotFoundPrompt context="店舗" />;
  }
  return (
    <CreateStoreVoteForm
      stores={storeRows}
      storeType={storeType}
      userId={user.id}
    />
  );
}
