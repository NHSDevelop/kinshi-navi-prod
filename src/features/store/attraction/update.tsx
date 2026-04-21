import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateAttractionConfigForm from "./update-form";

interface UpdateAttractionConfigProps {
  storeId: string;
}

export default async function UpdateAttractionConfig({
  storeId,
}: UpdateAttractionConfigProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(attractions)
    .where(eq(attractions.storeId, storeId))
    .limit(1);
  const attraction = rows[0];
  if (!attraction) {
    return <p>企画が存在しません。</p>;
  }
  return <UpdateAttractionConfigForm attraction={attraction} />;
}
