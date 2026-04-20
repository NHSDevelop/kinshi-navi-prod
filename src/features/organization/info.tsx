import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db/drizzle";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface OrganizationInfoProps {
  organizationId: string;
}

export default async function OrganizationInfo({
  organizationId,
}: OrganizationInfoProps) {
  const db = await getDb();
  const organizationRows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  const organization = organizationRows[0];
  if (!organization) {
    return <p>組織が存在しません。</p>;
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 items-center">
          <CardTitle>{organization.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <div className="flex flex-col items-start gap-4">
          <p>名前：</p>
          <p>詳細：</p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <p>{organization.name}</p>
          <p>{organization.description ?? "なし"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
