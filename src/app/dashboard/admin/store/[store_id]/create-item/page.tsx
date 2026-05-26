import { CreateItem } from "@/features/store/food/item/create";
import { getDb } from "@/lib/db/drizzle";
import { foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { requireStoreAdminUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function CreateFoodItemPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, foodRows] = await Promise.all([
    requireStoreAdminUser(store_id),
    db
      .select({ id: foods.id, storeId: foods.storeId })
      .from(foods)
      .where(eq(foods.storeId, store_id))
      .limit(1),
  ]);

  return (
    <DashboardPageShell title="商品登録">
      {foodRows?.length > 0 && <CreateItem foodId={foodRows[0].id} />}
    </DashboardPageShell>
  );
}
