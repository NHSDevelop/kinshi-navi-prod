import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { IssueTicketForm } from "./issue-form";

interface IssueTicketProps {
  eventId: string;
  storeId?: string;
  isPaper: boolean;
}

export default async function IssueTicket({
  eventId,
  isPaper,
  storeId,
}: IssueTicketProps) {
  const db = await getDb();
  const storeList = await db
    .select()
    .from(stores)
    .where(
      and(eq(stores.eventId, eventId), eq(stores.storeType, "ATTRACTION")),
    );

  if (storeList.length === 0) {
    return <p>企画が存在しません</p>;
  }

  return (
    <IssueTicketForm stores={storeList} isPaper={isPaper} storeId={storeId} />
  );
}
