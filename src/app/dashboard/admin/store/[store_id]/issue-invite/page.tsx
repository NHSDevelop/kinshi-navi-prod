import IssueInviteLink from "@/features/auth/invite/issue-link";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";

export default async function IssueStaffnvitePage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  await requireStoreAdminUser(store_id);

  return (
    <DashboardPageShell title="店舗のスタッフを招待">
      <h1 className="font-bold text-xl">店舗のスタッフを招待</h1>
      <IssueInviteLink
        issuerScope="STORE_ADMIN"
        targetScope="STAFF"
        storeId={store_id}
      />
    </DashboardPageShell>
  );
}
