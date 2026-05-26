import { getDb } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpdateItemForm from "./update-form";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

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
    return <NotFoundPrompt context="商品" />;
  }
  if (!item.isActive) {
    return <ErrorPrompt error="商品はすでに削除されています。" />;
  }

  return <UpdateItemForm item={item} />;
}
