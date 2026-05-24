import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CompleteTicket from "@/features/store/attraction/ticket/complete";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

import { eq } from "drizzle-orm";
import Link from "next/link";
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
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

  if (attractionRows.length === 0) {
    return (
      <DashboardPageShell
        title="チケット受付"
        description="受付を完了し、必要に応じて紙チケットへ進みます。"
      >
        <p>企画が存在しません。</p>
      </DashboardPageShell>
    );
  }
  return (
    <DashboardPageShell
      title="チケット受付"
      description="受付を完了し、必要に応じて紙チケットへ進みます。"
    >
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">チケット受付ページ</h1>
        <Separator />
        <CompleteTicket />
        <Button asChild variant="warn">
          <Link href={`/dashboard/staff/store/${store_id}/ticket-list`}>
            紙のチケットの受付
          </Link>
        </Button>
      </div>
    </DashboardPageShell>
  );
}
