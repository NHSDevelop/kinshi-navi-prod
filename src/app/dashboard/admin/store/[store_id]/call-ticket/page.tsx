import FirstCallTicketForm from "@/features/store/attraction/ticket/first-call-form";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

import { eq } from "drizzle-orm";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function CallTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, attractionRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select({ id: attractions.id, storeId: attractions.storeId })
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

  if (attractionRows.length === 0) {
    return (
      <DashboardPageShell
        title="チケット呼び出し"
        description="待機中のチケットを呼び出します。"
      >
        <p>企画が存在しません。</p>
      </DashboardPageShell>
    );
  }
  return (
    <DashboardPageShell
      title="チケット呼び出し"
      description="待機中のチケットを呼び出します。"
    >
      <FirstCallTicketForm attractionId={attractionRows[0].id} />
    </DashboardPageShell>
  );
}
