import AttractionTicketList from "@/features/store/attraction/ticket/attraction-list";
import { getDb } from "@/lib/db/drizzle";
import { attractions, tickets } from "@/lib/db/schema";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { and, desc, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function TicketListPage(props: {
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
        title="整理券一覧"
        description="企画の整理券一覧を表示します。"
      >
        <NotFoundPrompt context="企画" />
      </DashboardPageShell>
    );
  }
  const initialTickets = await db
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
      ),
    )
    .orderBy(desc(tickets.index));

  return (
    <DashboardPageShell
      title="整理券一覧"
      description="企画の整理券一覧を表示します。"
    >
      <AttractionTicketList
        storeId={store_id}
        initialTickets={initialTickets}
      />
    </DashboardPageShell>
  );
}
