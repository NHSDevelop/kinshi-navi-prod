import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Card, CardContent } from "@/components/ui/card";
import { getDb } from "@/lib/db/drizzle";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";

type Props = {
  itemId: string;
};

export default async function ItemInfo({ itemId }: Props) {
  const db = await getDb();
  const itemRows = await db
    .select()
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);
  return (
    <>
      {itemRows.length > 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4 sm:gap-8 sm:flex-row items-center">
              {itemRows[0].imageUrl ? (
                <Image
                  src={itemRows[0].imageUrl}
                  alt={`${itemRows[0].name}の画像`}
                  width={150}
                  height={200}
                  className="object-contain rounded-md border-2"
                />
              ) : (
                <Image
                  src="/images/default-image.webp"
                  alt={`デフォルトの画像`}
                  width={150}
                  height={200}
                  className="object-contain rounded-md"
                  loading="eager"
                />
              )}
              <div className="flex gap-2 md:flex-1">
                <div className="flex flex-col items-start gap-4">
                  <p>名前：</p>
                  <p>価格：</p>
                  <p>在庫数：</p>
                  <p>詳細：</p>
                </div>
                <div className="flex flex-col items-start gap-4">
                  <p>{itemRows[0].name}</p>
                  <p>{itemRows[0].price}円</p>
                  <p>{itemRows[0].stock}個</p>
                  <p>{itemRows[0].description ?? "なし"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <NotFoundPrompt context="該当する商品" />
      )}
    </>
  );
}
