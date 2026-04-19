import UpdateOrganizationConfig from "@/features/organization/update";

export default async function EditOrganizationConfigPage(props: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">組織の設定を編集</h1>
      <UpdateOrganizationConfig organizationId={organization_id} />
    </div>
  );
}
