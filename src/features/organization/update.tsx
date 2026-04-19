import { getDb } from "@/lib/db/drizzle";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateOrganizationConfigForm from "./update-form";

interface updateOrganizationConfigProps {
  organizationId: string;
}

export default async function UpdateOrganizationConfig({
  organizationId,
}: updateOrganizationConfigProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  if (rows.length === 0) {
    return <p>店舗が存在しません。</p>;
  }
  return <UpdateOrganizationConfigForm organization={rows[0]} />;
}
