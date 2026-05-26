import UpdateEventConfig from "@/features/event/update";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function EditEventConfigPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <DashboardPageShell title="イベントの設定を編集">
      <UpdateEventConfig eventId={event_id} />
    </DashboardPageShell>
  );
}
