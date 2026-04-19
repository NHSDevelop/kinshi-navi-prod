import AttractionTicketList from "@/features/store/attraction/ticket/attraction-list";
import { getDb } from "@/lib/db/drizzle";
import { attractions, tickets } from "@/lib/db/schema";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

import { eq } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";

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
    return <NotFoundPrompt context="企画" />;
  }
  const initialTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.attractionId, attractionRows[0].id));

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">チケットの一覧</h1>
      <Separator />
      <AttractionTicketList
        storeId={store_id}
        initialTickets={initialTickets}
      />
    </div>
  );
}
