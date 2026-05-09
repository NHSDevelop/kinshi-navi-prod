import UpdateItem from "@/features/store/food/item/update";
import { Separator } from "@/components/ui/separator";

export default async function EditItemPage(props: {
  params: Promise<{ store_id: string; item_id: string }>;
}) {
  const { item_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">商品の設定を編集</h1>
      <Separator />
      <UpdateItem itemId={item_id} />
    </div>
  );
}
