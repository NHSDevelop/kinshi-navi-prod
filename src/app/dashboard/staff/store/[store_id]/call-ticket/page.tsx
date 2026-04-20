import { Separator } from "@/components/ui/separator";
import FirstCallTicketForm from "@/features/store/attraction/ticket/first-call-form";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";

import { eq } from "drizzle-orm";

export default async function CallTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const db = await getDb();
  const { store_id } = await props.params;
  const attractionRows = await db
    .select()
    .from(attractions)
    .where(eq(attractions.storeId, store_id))
    .limit(1);
  if (attractionRows.length === 0) {
    return <p>企画が存在しません。</p>;
  }
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">チケットの呼び出し</h1>
      <Separator />
      <FirstCallTicketForm attractionId={attractionRows[0].id} />
    </div>
  );
}
