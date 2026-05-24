import { Separator } from "@/components/ui/separator";
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
      <div className="space-y-4 lg:space-y-8">
        <h1 className="font-bold text-xl">レジページ</h1>
        <Separator />
        <FoodRegister storeId={store_id} />
      </div>
    </DashboardPageShell>
  );
}
