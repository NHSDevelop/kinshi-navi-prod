import UpdateFoodConfig from "@/features/store/food/update";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function EditFoodConfigPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="模擬店の設定を編集">
      <UpdateFoodConfig storeId={store_id} />
    </DashboardPageShell>
  );
}
