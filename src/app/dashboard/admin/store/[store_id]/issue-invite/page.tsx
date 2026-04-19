import IssueInviteLink from "@/features/auth/invite/issue-link";

export default async function IssueStaffnvitePage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">店舗のスタッフを招待</h1>
      <IssueInviteLink
        issuerScope="STORE_ADMIN"
        targetScope="STAFF"
        storeId={store_id}
      />
    </div>
  );
}
