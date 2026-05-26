import FoodRegister from "@/features/store/food/register/register";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function RegisterPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);
  return (
    <DashboardPageShell title="レジページ">
      <FoodRegister storeId={store_id} />
    </DashboardPageShell>
  );
}
