import { Separator } from "@/components/ui/separator";
import StockLogList from "@/features/store/food/stock-log/list";

export default async function AdminStockLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">在庫履歴</h1>
      <Separator />
      <StockLogList storeId={store_id} />
    </div>
  );
}
