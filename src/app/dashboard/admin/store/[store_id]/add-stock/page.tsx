import CreateStockLog from "@/features/store/food/stock-log/create";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function AddItemStockPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="商品の在庫を追加">
      <CreateStockLog storeId={store_id} />
    </DashboardPageShell>
  );
}
