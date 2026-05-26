import UpdateAttractionConfig from "@/features/store/attraction/update";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function EditAttractionConfigPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="企画の設定を編集">
      <UpdateAttractionConfig storeId={store_id} />
    </DashboardPageShell>
  );
}
