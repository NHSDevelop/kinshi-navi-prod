import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getCurrentUser } from "@/features/auth/anonymous/action";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getDbAsync } from "@/lib/db/drizzle";
import { attractions, stores } from "@/lib/db/schema";

import { eq } from "drizzle-orm";

export default async function StaffIssueTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const db = await getDbAsync();
  const user = await getCurrentUser();
  if (!user) {
    return <NotFoundPrompt context="ユーザー" />;
  }
  const { store_id } = await props.params;
  const storeRows = await db
    .select({ eventId: stores.eventId })
    .from(stores)
    .where(eq(stores.id, store_id))
    .limit(1);

  if (storeRows.length === 0) {
    return <NotFoundPrompt context="店舗" />;
  }
  const attractionRows = await db
    .select()
    .from(attractions)
    .where(eq(attractions.storeId, store_id))
    .limit(1);
  if (attractionRows.length === 0) {
    return <NotFoundPrompt context="企画" />;
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">スタッフ用チケット発券ページ</h1>
      <p>端末を持たない方へのチケットを発行します。</p>
      <IssueTicket
        userId={user.id}
        eventId={storeRows[0].eventId}
        isPaper={true}
        storeId={store_id}
      />
    </div>
  );
}
