import IssueInviteLink from "@/features/auth/invite/issue-link";

export default async function IssueEventAdminInvitePage(props: {
  params: Promise<{ organization_id: string; event_id: string }>;
}) {
  const { organization_id, event_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントの管理者を招待</h1>
      <IssueInviteLink
        issuerScope="ORGANIZATION_ADMIN"
        targetScope="EVENT_ADMIN"
        organizationId={organization_id}
        eventId={event_id}
      />
    </div>
  );
}
