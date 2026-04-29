import { getDb } from "@/lib/db/drizzle";
import { foods, registerLanes, stores } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import CreateRegisterLaneForm from "./create-form";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";

type Props = {
  eventId: string;
};

export default async function CreateRegisterLane({ eventId }: Props) {
  const db = await getDb();

  const foodStoreRows = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      foodId: foods.id,
    })
    .from(stores)
    .innerJoin(foods, eq(foods.storeId, stores.id))
    .where(and(eq(stores.eventId, eventId), eq(stores.storeType, "FOOD")));

  if (foodStoreRows.length === 0) {
    return <NotFoundPrompt context="模擬店" />;
  }

  const laneRows = await db
    .select()
    .from(registerLanes)
    .where(eq(registerLanes.eventId, eventId))
    .orderBy(asc(registerLanes.laneNumber));

  return (
    <CreateRegisterLaneForm
      eventId={eventId}
      stores={foodStoreRows}
      lanes={laneRows}
    />
  );
}
