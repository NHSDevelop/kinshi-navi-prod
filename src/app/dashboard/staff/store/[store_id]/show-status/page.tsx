import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoutePollingRefresh } from "@/components/polling/route-polling-refresh";
import { getDb } from "@/lib/db/drizzle";
import { attractions, tickets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireStaffOrManageStoreUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function ShowAttractionStatusPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  const db = await getDb();

  const [_, attractionRows] = await Promise.all([
    requireStaffOrManageStoreUser(store_id),
    db
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, store_id))
      .limit(1),
  ]);

  const attraction = attractionRows[0];
  if (!attraction) {
    return <NotFoundPrompt context="該当する企画" />;
  }
  const ticketRows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.attractionId, attraction.id));

  // 待ち人数（ISSUED ステータスの合計人数）
  const waitingPeople = ticketRows
    .filter((ticket) => ticket.status === "ISSUED")
    .reduce((sum, ticket) => sum + ticket.numberOfPeople, 0);

  // 最新の呼び出し番号（CALLED ステータスの最新）
  const calledTickets = ticketRows
    .filter((ticket) => ticket.status === "CALLED")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const latestCalledNumber = calledTickets[0]?.index ?? null;

  // 待ち時間（分）
  const groupCount = Math.ceil(
    waitingPeople / (attraction.peopleCapacity || 1),
  );
  const waitingMinutes = groupCount * (attraction.playTime || 0);

  return (
    <div className="flex flex-col gap-6">
      <RoutePollingRefresh intervalMs={5 * 60 * 1000} />

      <h1 className="text-xl font-bold">企画の待機状況</h1>
      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待ち人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waitingPeople}</div>
            <p className="text-xs text-muted-foreground mt-1">人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最新の呼び出し番号
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {latestCalledNumber !== null ? `No.${latestCalledNumber}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">番号</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              推定待ち時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waitingMinutes}</div>
            <p className="text-xs text-muted-foreground mt-1">分</p>
          </CardContent>
        </Card>
        <p>※5分ごと、または画面に戻ったときに更新します。</p>
      </div>
    </div>
  );
}
