import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { foods, items, registerLanes } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import FoodRegisterForm from "./register/register-form";

type Props = {
  storeId: string;
};

export default async function FoodRegister({ storeId }: Props) {
  const db = await getDb();
  const foodRows = await db
    .select({ id: foods.id })
    .from(foods)
    .where(eq(foods.storeId, storeId));

  if (foodRows.length === 0) {
    return <NotFoundPrompt context="該当する模擬店" />;
  }

  const foodIds = foodRows.map((food) => food.id);

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
    .where(inArray(registerLanes.foodId, foodIds));

  if (laneRows.length === 0) {
    return <NotFoundPrompt context="レジレーン" />;
  }

  const itemRows = await db
    .select({
      id: items.id,
      name: items.name,
      foodId: items.foodId,
      stock: items.stock,
      price: items.price,
      imageUrl: items.imageUrl,
      description: items.description,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .where(inArray(items.foodId, foodIds));

  if (itemRows.length === 0) {
    return <NotFoundPrompt context="模擬店内の商品" />;
  }

  return <FoodRegisterForm items={itemRows} lanes={laneRows} />;
}
