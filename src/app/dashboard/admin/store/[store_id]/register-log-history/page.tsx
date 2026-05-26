import { DashboardPageShell } from "@/components/dashboard/page-shell";
import CombinedHistoryList from "@/features/store/food/history/combined-list";
import { requireStoreAdminUser } from "@/lib/auth-guard";

export default async function AdminRegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell
      title="会計・在庫履歴"
      description="会計と在庫の履歴をまとめて表示します。"
    >
      <CombinedHistoryList storeId={store_id} />
    </DashboardPageShell>
  );
}
