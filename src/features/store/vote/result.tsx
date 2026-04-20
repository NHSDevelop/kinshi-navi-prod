import { getDb } from "@/lib/db/drizzle";
import { stores, storeVotes } from "@/lib/db/schema";
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

export default async function StoreVoteResult() {
  const db = await getDb();
  const mainEvent = await getMainEvent();

  if (!mainEvent) {
    return <NotFoundPrompt context="メインイベント" />;
  }

  const voteRows = await db
    .select()
    .from(storeVotes)
    .innerJoin(stores, eq(stores.id, storeVotes.storeId))
    .where(
      and(
        eq(storeVotes.eventId, mainEvent.id),
        eq(stores.eventId, mainEvent.id),
      ),
    );

  const voteResults = Array.from(
    voteRows.reduce((acc, row) => {
      const storeId = row.stores.id;
      const current = acc.get(storeId);

      if (current) {
        current.voteCount += 1;
      } else {
        acc.set(storeId, {
          storeId,
          storeName: row.stores.name,
          voteCount: 1,
        });
      }

      return acc;
    }, new Map<string, { storeId: string; storeName: string; voteCount: number }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.voteCount - a.voteCount);

  return (
    <>
      {voteResults.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>企画名</TableHead>
              <TableHead>投票数（票）</TableHead>
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
