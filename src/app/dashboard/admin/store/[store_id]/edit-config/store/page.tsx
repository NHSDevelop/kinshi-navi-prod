import UpdateStoreConfig from "@/features/store/update";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function EditStoreConfigPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="店舗の設定を編集">
      <UpdateStoreConfig storeId={store_id} />
    </DashboardPageShell>
  );
}
