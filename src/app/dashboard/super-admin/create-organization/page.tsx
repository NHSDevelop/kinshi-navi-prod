import { Separator } from "@/components/ui/separator";
import { CreateOrganization } from "@/features/organization/create";

export default async function SuperAdminOrganizationPage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">組織を作成</h1>
      <Separator />
      <CreateOrganization />
    </div>
  );
}
