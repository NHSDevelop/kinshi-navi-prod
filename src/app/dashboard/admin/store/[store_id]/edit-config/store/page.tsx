import UpdateStoreConfig from "@/features/store/update";
import { requireStoreAdminUser } from "@/lib/auth-guard";

export default async function EditStoreConfigPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">店舗の設定を編集</h1>
      <UpdateStoreConfig storeId={store_id} />
    </div>
  );
}
