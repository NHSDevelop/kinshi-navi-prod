import CreateStockLog from "@/features/store/food/stock-log/create";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function AddItemStockPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  return (
    <DashboardPageShell title="在庫追加" description="商品の在庫を追加します。">
      <CreateStockLog storeId={store_id} />
    </DashboardPageShell>
  );
}
