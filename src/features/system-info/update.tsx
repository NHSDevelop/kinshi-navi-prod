import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateSystemInfoForm from "./update-form";

interface updateSystemInfoProps {
  systemInfoId: string;
}

export default async function UpdateSystemInfo({
  systemInfoId,
}: updateSystemInfoProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(systemInfos)
    .where(eq(systemInfos.id, systemInfoId))
    .limit(1);

  if (rows.length === 0) {
    return <p>お知らせが存在しません。</p>;
  }

  return <UpdateSystemInfoForm systemInfo={rows[0]} />;
}
