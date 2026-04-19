import { getDb } from "@/lib/db/drizzle";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateEventConfigForm from "./update-form";

interface updateEventConfigProps {
  eventId: string;
}

export default async function UpdateEventConfig({
  eventId,
}: updateEventConfigProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (rows.length === 0) {
    return <p>店舗が存在しません。</p>;
  }
  return <UpdateEventConfigForm event={rows[0]} />;
}
