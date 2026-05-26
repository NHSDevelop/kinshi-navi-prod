import { Button } from "@/components/ui/button";
import CompleteTicket from "@/features/store/attraction/ticket/complete";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

import { eq } from "drizzle-orm";
import Link from "next/link";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

export const dynamic = "force-dynamic";

export default async function CallTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, attractionRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

  if (attractionRows.length === 0) {
    return (
      <DashboardPageShell
        title="整理券受付"
        description="呼び出した整理券の受付を完了します。"
      >
        <NotFoundPrompt context="企画" />
      </DashboardPageShell>
    );
  }
  return (
    <DashboardPageShell
      title="整理券受付"
      description="呼び出した整理券の受付を完了します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <CompleteTicket />
        <Button asChild variant="warn">
          <Link href={`/dashboard/staff/store/${store_id}/ticket-list`}>
            紙の整理券の受付
          </Link>
        </Button>
      </div>
    </DashboardPageShell>
  );
}
