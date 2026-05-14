import { getDb } from "@/lib/db/drizzle";
import { attractions, events, stores, tickets } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { TicketCard } from "./ticket";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

interface UserTicketListProps {
  userId: string;
}

export default async function UserTicketList({ userId }: UserTicketListProps) {
  const db = await getDb();
  const activeTicketRows = await db
    .select({
      id: tickets.id,
      index: tickets.index,
      numberOfPeople: tickets.numberOfPeople,
      status: tickets.status,
      createdAt: tickets.createdAt,
      storeName: stores.name,
      eventName: events.name,
    })
    .from(tickets)
    .innerJoin(attractions, eq(attractions.id, tickets.attractionId))
    .innerJoin(stores, eq(stores.id, attractions.storeId))
    .leftJoin(events, eq(events.id, stores.eventId))
    .where(
      and(
        eq(tickets.userId, userId),
        inArray(tickets.status, ["ISSUED", "CALLED"]),
      ),
    )
    .orderBy(asc(tickets.createdAt));

  if (activeTicketRows.length === 0) {
    return <NotFoundPrompt context="取得したチケット" />;
  }

  const activeTickets = activeTicketRows.map((row) => ({
    id: row.id,
    index: row.index,
    numberOfPeople: row.numberOfPeople,
    createdAt: row.createdAt,
    status: row.status,
    attraction: {
      store: {
        name: row.storeName,
        event: row.eventName ? { name: row.eventName } : null,
      },
    },
  }));

  return <TicketCard ticket={activeTickets[0]} />;
}
