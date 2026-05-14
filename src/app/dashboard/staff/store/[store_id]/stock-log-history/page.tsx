import { Separator } from "@/components/ui/separator";
import StockLogList from "@/features/store/food/stock-log/list";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function StockLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  return (
    <DashboardPageShell
      title="在庫履歴"
      description="在庫の変動履歴を表示します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">在庫履歴</h1>
        <Separator />
        <StockLogList storeId={store_id} />
      </div>
    </DashboardPageShell>
  );
}
