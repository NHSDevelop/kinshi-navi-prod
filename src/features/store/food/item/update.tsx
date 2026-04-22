import { getDb } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateItemForm from "./update-form";

type Props = {
  itemId: string;
};

export default async function UpdateItem({ itemId }: Props) {
  const db = await getDb();
  const itemRows = await db
    .select()
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);
  const item = itemRows[0];
  if (!item) {
    return <p>商品が存在しません。</p>;
  }

  return <UpdateItemForm item={item} />;
}
