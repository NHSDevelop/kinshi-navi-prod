import { Separator } from "@/components/ui/separator";
import FirstCallTicketForm from "@/features/store/attraction/ticket/first-call-form";
import { getDb } from "@/lib/db/drizzle";
import { attractions } from "@/lib/db/schema";

import { eq } from "drizzle-orm";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

// Attraction情報は1日に1回程度変わるため、ISR 1時間でキャッシュ
export const revalidate = 3600;

export default async function CallTicketPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, attractionRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select({ id: attractions.id, storeId: attractions.storeId })
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

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
