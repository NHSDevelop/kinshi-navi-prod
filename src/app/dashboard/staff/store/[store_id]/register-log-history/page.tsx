import { Separator } from "@/components/ui/separator";
import RegisterLogList from "@/features/store/food/register/list";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function RegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStaffOrManageStoreUser(store_id);

  return (
    <DashboardPageShell title="会計履歴" description="会計の履歴を表示します。">
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">会計履歴</h1>
        <Separator />
        <RegisterLogList storeId={store_id} />
      </div>
    </DashboardPageShell>
  );
}
