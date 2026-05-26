import CreateStore from "@/features/store/create";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function CreateStorePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);
  return (
    <DashboardPageShell title="店舗を作成">
      <CreateStore eventId={event_id} />
    </DashboardPageShell>
  );
}
