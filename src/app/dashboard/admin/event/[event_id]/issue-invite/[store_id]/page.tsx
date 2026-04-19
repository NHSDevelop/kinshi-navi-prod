import IssueInviteLink from "@/features/auth/invite/issue-link";

export default async function IssueStoreAdminInvitePage(props: {
  params: Promise<{ event_id: string; store_id: string }>;
}) {
  const { event_id, store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">店舗の管理者を招待</h1>
      <IssueInviteLink
        issuerScope="EVENT_ADMIN"
        targetScope="STORE_ADMIN"
        eventId={event_id}
        storeId={store_id}
      />
    </div>
  );
}
