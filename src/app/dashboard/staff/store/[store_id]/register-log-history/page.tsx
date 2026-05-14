import { Separator } from "@/components/ui/separator";
import CombinedHistoryList from "@/features/store/food/history/combined-list";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function RegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  return (
    <DashboardPageShell
      title="会計・在庫履歴"
      description="会計と在庫の履歴をまとめて表示します。"
    >
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">会計・在庫履歴</h1>
        <Separator />
        <CombinedHistoryList storeId={store_id} />
      </div>
    </DashboardPageShell>
  );
}
