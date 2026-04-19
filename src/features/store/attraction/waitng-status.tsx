import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/lib/db/drizzle";
import { attractions, stores, tickets } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

interface AttracionWaitngStatusProps {
  eventId: string;
}

export default async function AttracionWaitngStatus({
  eventId,
}: AttracionWaitngStatusProps) {
  const db = await getDb();
  const rows = await db
    .select({
      attractionId: attractions.id,
      peopleCapacity: attractions.peopleCapacity,
      playTime: attractions.playTime,
      storeName: stores.name,
      waitingPeople: tickets.numberOfPeople,
    })
    .from(attractions)
    .innerJoin(stores, eq(stores.id, attractions.storeId))
    .leftJoin(
      tickets,
      and(
        eq(tickets.attractionId, attractions.id),
        eq(tickets.status, "ISSUED"),
      ),
    )
    .where(eq(stores.eventId, eventId));

  const attractionMap = new Map<
    string,
    {
      storeName: string;
      peopleCapacity: number | null;
      playTime: number | null;
      waitingPeople: number;
    }
  >();

  for (const row of rows) {
    const current = attractionMap.get(row.attractionId);
    const waiting = row.waitingPeople ?? 0;
    if (!current) {
      attractionMap.set(row.attractionId, {
        storeName: row.storeName,
        peopleCapacity: row.peopleCapacity,
        playTime: row.playTime,
        waitingPeople: waiting,
      });
      continue;
    }

    current.waitingPeople += waiting;
  }

  const waitingStatusList = Array.from(attractionMap.entries()).map(
    ([id, value]) => ({ id, ...value }),
  );
  return (
    <>
      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>企画名</TableHead>
              <TableHead>待ち人数（人）</TableHead>
              <TableHead>待ち時間（分）</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitingStatusList.map((attraction) => {
              const waitingPeople = attraction.waitingPeople;
              const groupCount = Math.ceil(
                waitingPeople / (attraction.peopleCapacity || 1),
              );
              const waitMinutes = groupCount * (attraction.playTime || 1);
              return (
                <TableRow key={attraction.id}>
                  <TableCell>{attraction.storeName}</TableCell>
                  <TableCell>{waitingPeople}</TableCell>
                  <TableCell>{waitMinutes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="企画" />
      )}
    </>
  );
}
