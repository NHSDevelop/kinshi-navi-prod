import { getDb } from "@/lib/db/drizzle";
import { stores, StoreType, storeVotes } from "@/lib/db/schema";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { and, eq } from "drizzle-orm";
import { getMainEvent } from "@/features/event/action";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  storeType: StoreType;
  canSeenAllUser: boolean;
};

export default async function StoreVoteResult({
  storeType,
  canSeenAllUser,
}: Props) {
  const db = await getDb();
  const mainEvent = await getMainEvent();

  if (!mainEvent) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  const voteRows = await db
    .select({
      id: stores.id,
      name: stores.name,
    })
    .from(storeVotes)
    .innerJoin(stores, eq(stores.id, storeVotes.storeId))
    .where(
      and(
        eq(storeVotes.eventId, mainEvent.id),
        eq(stores.eventId, mainEvent.id),
        eq(stores.storeType, storeType),
      ),
    );

  const voteResults = Array.from(
    voteRows.reduce((acc, row) => {
      const storeId = row.id;
      const current = acc.get(storeId);

      if (current) {
        current.voteCount += 1;
      } else {
        acc.set(storeId, {
          storeId,
          storeName: row.name,
          voteCount: 1,
        });
      }

      return acc;
    }, new Map<string, { storeId: string; storeName: string; voteCount: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.voteCount - a.voteCount);

  if (canSeenAllUser && !mainEvent.isVoteShowing) {
    return (
      <Card>
        <CardContent>
          <p>現在投票の結果を見ることはできません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {voteResults.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>店舗名</TableHead>
              <TableHead>投票数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voteResults.map((result) => (
              <TableRow key={result.storeId}>
                <TableCell>{result.storeName}</TableCell>
                <TableCell>{result.voteCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="投票" />
      )}
    </>
  );
}
