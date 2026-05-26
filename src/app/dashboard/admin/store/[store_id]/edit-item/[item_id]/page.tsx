import UpdateItem from "@/features/store/food/item/update";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function EditItemPage(props: {
  params: Promise<{ store_id: string; item_id: string }>;
}) {
  const { store_id, item_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="商品の設定を編集">
      <UpdateItem itemId={item_id} />
    </DashboardPageShell>
  );
}
