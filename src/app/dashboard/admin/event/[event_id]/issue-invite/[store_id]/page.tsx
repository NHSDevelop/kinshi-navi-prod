import IssueInviteLink from "@/features/auth/invite/issue-link";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function IssueStoreAdminInvitePage(props: {
  params: Promise<{ event_id: string; store_id: string }>;
}) {
  const { event_id, store_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <DashboardPageShell title="店舗の管理者を招待">
      <IssueInviteLink
        issuerScope="EVENT_ADMIN"
        targetScope="STORE_ADMIN"
        eventId={event_id}
        storeId={store_id}
      />
    </DashboardPageShell>
  );
}
