import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getDb } from "@/lib/db/drizzle";
import { attractions, stores } from "@/lib/db/schema";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function StaffIssueTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, storeRows, attractionRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select({ eventId: stores.eventId })
      .from(stores)
      .where(eq(stores.id, store_id))
      .limit(1),
    db
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

  if (storeRows.length === 0) {
    return (
      <DashboardPageShell
        title="紙チケット発行"
        description="端末を持たない方向けに紙チケットを発行します。"
      >
        <NotFoundPrompt context="ユーザー" />
      </DashboardPageShell>
    );
  }
  if (attractionRows.length === 0) {
    return (
      <DashboardPageShell
        title="紙チケット発行"
        description="端末を持たない方向けに紙チケットを発行します。"
      >
        <NotFoundPrompt context="企画" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="紙チケット発行"
      description="端末を持たない方向けに紙チケットを発行します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">スタッフ用チケット発券ページ</h1>
        <p>端末を持たない方へのチケットを発行します。</p>
        <IssueTicket
          eventId={storeRows[0].eventId}
          isPaper={true}
          storeId={store_id}
        />
      </div>
    </DashboardPageShell>
  );
}
