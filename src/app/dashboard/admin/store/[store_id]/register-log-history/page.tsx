import { Separator } from "@/components/ui/separator";
import RegisterLogList from "@/features/store/food/register/list";
import { requireStoreAdminUser } from "@/lib/auth-guard";

export default async function AdminRegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">会計履歴</h1>
      <Separator />
      <RegisterLogList storeId={store_id} />
    </div>
  );
}
