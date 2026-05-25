import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { IssueTicketForm } from "./issue-form";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

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
      and(
        eq(stores.eventId, eventId),
        eq(stores.storeType, "ATTRACTION"),
        eq(stores.isActive, true),
      ),
    );

  if (storeList.length === 0) {
    return <NotFoundPrompt context="開催中の企画" />;
  }

  return (
    <IssueTicketForm stores={storeList} isPaper={isPaper} storeId={storeId} />
  );
}
