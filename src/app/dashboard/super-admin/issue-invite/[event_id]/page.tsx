import IssueInviteLink from "@/features/auth/invite/issue-link";
import { requireSuperAdminUser } from "@/lib/auth-guard";

export default async function IssueEventAdminInvitePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  await requireSuperAdminUser();

  const { event_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントの管理者を招待</h1>
      <IssueInviteLink
        issuerScope="SUPER_ADMIN"
        targetScope="EVENT_ADMIN"
        eventId={event_id}
      />
    </div>
  );
}
