import { Separator } from "@/components/ui/separator";
import CreateStockLog from "@/features/store/food/stock-log/create";

export default async function AddItemStockPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">商品の在庫を追加</h1>
      <Separator />
      <CreateStockLog storeId={store_id} />
    </div>
  );
}
