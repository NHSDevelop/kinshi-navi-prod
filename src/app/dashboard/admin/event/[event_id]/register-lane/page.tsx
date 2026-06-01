import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import CreateRegisterLane from "@/features/store/food/register/lane/create";

export default async function RegisterLanePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <DashboardPageShell title="レジレーンの管理">
      <CreateRegisterLane eventId={event_id} />
    </DashboardPageShell>
  );
}
