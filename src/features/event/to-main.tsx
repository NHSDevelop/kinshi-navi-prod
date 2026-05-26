import { getDb } from "@/lib/db/drizzle";
import ToMainEventForm from "./to-main-form";
import { events } from "@/lib/db/schema";

export default async function ToMainEvent() {
  const db = await getDb();
  const eventRows = await db.select().from(events);

  return <ToMainEventForm events={eventRows} />;
}
