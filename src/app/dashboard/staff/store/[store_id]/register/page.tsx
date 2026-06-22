import FoodRegister from "@/features/store/food/register/register";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { eq } from "drizzle-orm";

export default async function RegisterPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  const db = await getDb();
  const store = await db
    .select({ eventId: stores.eventId })
    .from(stores)
    .where(eq(stores.id, store_id));

  if (!store[0].eventId) {
    return <NotFoundPrompt context="指定された企画" />;
  }

  return (
    <DashboardPageShell title="レジ" description="会計を行います。">
      <FoodRegister eventId={store[0].eventId} storeId={store_id} />
    </DashboardPageShell>
  );
}
