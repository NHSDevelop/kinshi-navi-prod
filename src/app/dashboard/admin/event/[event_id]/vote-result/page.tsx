import StoreVoteResult from "@/features/store/vote/result";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function IssueStoreAdminInvitePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <DashboardPageShell title="投票結果">
      <StoreVoteResult />
    </DashboardPageShell>
  );
}
