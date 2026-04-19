import { Separator } from "@/components/ui/separator";
import IssueInviteLink from "@/features/auth/invite/issue-link";

export default async function IssueOrganizationAdminInvitePage(props: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">組織の管理者を招待</h1>
      <Separator />
      <IssueInviteLink
        issuerScope="SUPER_ADMIN"
        targetScope="ORGANIZATION_ADMIN"
        organizationId={organization_id}
      />
    </div>
  );
}
