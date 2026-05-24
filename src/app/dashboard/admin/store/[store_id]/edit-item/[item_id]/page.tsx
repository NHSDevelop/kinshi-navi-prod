import UpdateItem from "@/features/store/food/item/update";
import { Separator } from "@/components/ui/separator";
import { requireStoreAdminUser } from "@/lib/auth-guard";

export default async function EditItemPage(props: {
  params: Promise<{ store_id: string; item_id: string }>;
}) {
  const { store_id, item_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">商品の設定を編集</h1>
      <Separator />
      <UpdateItem itemId={item_id} />
    </div>
  );
}
