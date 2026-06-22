import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { foods, items, registerLanes, stores } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import FoodRegisterForm from "./register-form";

type Props = {
  eventId: string;
  storeId?: string | null;
};

export default async function FoodRegister({ eventId, storeId }: Props) {
  const db = await getDb();

  const laneRows = await db
    .select({
      id: registerLanes.id,
      eventId: registerLanes.eventId,
      foodId: registerLanes.foodId,
      laneNumber: registerLanes.laneNumber,
      name: registerLanes.name,
      isActive: registerLanes.isActive,
      createdAt: registerLanes.createdAt,
      updatedAt: registerLanes.updatedAt,
    })
    .from(registerLanes)
    .where(eq(registerLanes.eventId, eventId));

  const allFoodRowsInEvent = await db
    .select({
      foodId: foods.id,
      storeId: foods.storeId,
      isUseLane: foods.isUseLane,
      storeName: stores.name,
    })
    .from(foods)
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(eq(stores.eventId, eventId));

  if (allFoodRowsInEvent.length === 0) {
    return <NotFoundPrompt context="模擬店" />;
  }

  const currentStore = storeId
    ? allFoodRowsInEvent.find((food) => food.storeId === storeId)
    : null;

  const currentStoreIsUseLane = currentStore
    ? (currentStore.isUseLane ?? false)
    : false;

  const laneUseFoodIds = allFoodRowsInEvent
    .filter((food) => food.isUseLane ?? false)
    .map((food) => food.foodId);

  const targetFoodIds = [...laneUseFoodIds];
  if (currentStore && !currentStoreIsUseLane) {
    targetFoodIds.push(currentStore.foodId);
  }

  if (targetFoodIds.length === 0) {
    return <NotFoundPrompt context="対象の模擬店" />;
  }

  const itemRows = await db
    .select({
      id: items.id,
      foodId: items.foodId,
      name: items.name,
      price: items.price,
      stock: items.stock,
      isActive: items.isActive,
      storeName: stores.name,
    })
    .from(items)
    .innerJoin(foods, eq(foods.id, items.foodId))
    .innerJoin(stores, eq(stores.id, foods.storeId))
    .where(and(inArray(items.foodId, targetFoodIds), eq(items.isActive, true)));

  if (itemRows.length === 0) {
    return <NotFoundPrompt context="模擬店内の商品" />;
  }

  const sanitizedFoodOptions = allFoodRowsInEvent
    .filter((food) => (food.isUseLane ?? false) || food.storeId === storeId)
    .map((food) => ({
      foodId: food.foodId,
      storeName: food.storeName,
      isUseLane: food.isUseLane ?? false,
    }));

  return (
    <FoodRegisterForm
      items={itemRows}
      lanes={laneRows}
      foodOptions={sanitizedFoodOptions}
      defaultFoodId={currentStore ? currentStore.foodId : "none"}
      isStoreLaneUser={currentStoreIsUseLane}
    />
  );
}
