import FoodRegister from "@/features/store/food/register/register";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function RegisterPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);
  return (
    <DashboardPageShell title="レジ" description="会計を行います。">
      <FoodRegister storeId={store_id} />
    </DashboardPageShell>
  );
}
