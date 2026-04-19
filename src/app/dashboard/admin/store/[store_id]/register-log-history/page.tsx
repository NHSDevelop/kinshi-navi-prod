import { Separator } from "@/components/ui/separator";
import RegisterLogList from "@/features/store/food/register/list";

export default async function AdminRegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">会計履歴</h1>
      <Separator />
      <RegisterLogList storeId={store_id} />
    </div>
  );
}
