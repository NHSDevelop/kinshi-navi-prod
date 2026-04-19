import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateStoreConfigForm from "./update-form";

interface updateStoreConfigProps {
  storeId: string;
}

export default async function UpdateStoreConfig({
  storeId,
}: updateStoreConfigProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const store = rows[0];
  if (!store) {
    return <p>店舗が存在しません。</p>;
  }
  return <UpdateStoreConfigForm store={store} />;
}
