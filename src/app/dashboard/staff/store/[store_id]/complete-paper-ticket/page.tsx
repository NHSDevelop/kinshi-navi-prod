import CompletePaperTicket from "@/features/store/attraction/ticket/complete-paper";
import { getDb } from "@/lib/db/drizzle";
import { attractions, tickets } from "@/lib/db/schema";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { and, desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CompletePaperTicketStaffPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  const db = await getDb();

  const attractionRows = await db
    .select({ id: attractions.id })
    .from(attractions)
    .where(eq(attractions.storeId, store_id))
    .limit(1);

  if (attractionRows.length === 0) {
    return (
      <DashboardPageShell
        title="紙の整理券の受付"
        description="紙で発行された整理券を受付します。"
      >
        <NotFoundPrompt context="企画" />
      </DashboardPageShell>
    );
  }
  const initialPaperTickets = await db
    .select({
      id: tickets.id,
      index: tickets.index,
      numberOfPeople: tickets.numberOfPeople,
      status: tickets.status,
      isPaper: tickets.isPaper,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      userId: tickets.userId,
      attractionId: tickets.attractionId,
    })
    .from(tickets)
    .where(
      and(
        eq(tickets.attractionId, attractionRows[0].id),
        inArray(tickets.status, ["ISSUED", "CALLED", "COMPLETED", "CANCELED"]),
        eq(tickets.isPaper, true),
      ),
    )
    .orderBy(desc(tickets.index));

  return (
    <DashboardPageShell
      title="紙の整理券の受付"
      description="紙で発行された整理券を受付します。"
    >
      <div className="space-y-8">
        <CompletePaperTicket
          storeId={store_id}
          initialTickets={initialPaperTickets}
        />
      </div>
    </DashboardPageShell>
  );
}
