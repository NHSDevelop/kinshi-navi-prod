import { getDb } from "@/lib/db/drizzle";
import { registerLanes } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import CreateRegisterLaneForm from "./create-form";

type Props = {
  eventId: string;
};

export default async function CreateRegisterLane({ eventId }: Props) {
  const db = await getDb();

  const laneRows = await db
    .select()
    .from(registerLanes)
    .where(eq(registerLanes.eventId, eventId))
    .orderBy(asc(registerLanes.laneNumber));

  return <CreateRegisterLaneForm eventId={eventId} lanes={laneRows} />;
}
