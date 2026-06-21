import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface AttractionInfoProps {
  attractionId: string;
}

export default async function AttractionInfo({
  attractionId,
}: AttractionInfoProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(attractions)
    .where(eq(attractions.id, attractionId))
    .limit(1);
  const attraction = rows[0];
  if (!attraction) {
    return <p>企画が存在しません。</p>;
  }
  return (
    <div className="flex gap-2 md:flex-1">
      <div className="flex flex-col items-start gap-4">
        <p>一組当たりのプレイ時間：</p>
        <p>一組当たりの最大人数：</p>
        <p>会場内の最大組数：</p>
      </div>
      <div className="flex flex-col items-start gap-4">
        <p>{attraction.playTime}分</p>
        <p>{attraction.peopleCapacity}人</p>
        <p>{attraction.maxGroups}組</p>
      </div>
    </div>
  );
}
