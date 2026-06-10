import { Button } from "@/components/ui/button";
import CompleteTicket from "@/features/store/attraction/ticket/complete";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

import { eq } from "drizzle-orm";
import Link from "next/link";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function CompleteTicketStaffPage(props: {
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
        description="受付を完了し、必要に応じて紙整理券へ進みます。"
      >
        <p>企画が存在しません。</p>
      </DashboardPageShell>
    );
  }
  return (
    <DashboardPageShell
      title="整理券受付"
      description="受付を完了し、必要に応じて紙整理券へ進みます。"
    >
      <CompleteTicket />
      <Button asChild variant="warn">
        <Link href={`/dashboard/staff/store/${store_id}/ticket-list`} className="flex items-center gap-2 w-full h-full">
          
          紙の整理券の受付
        </Link>
      </Button>
    </DashboardPageShell>
  );
}
