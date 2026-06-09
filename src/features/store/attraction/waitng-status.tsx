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
import { aliasedTable, and, eq, max } from "drizzle-orm";

interface AttractionWaitngStatusProps {
  eventId: string;
}

export default async function AttractionWaitngStatus({
  eventId,
}: AttractionWaitngStatusProps) {
  const issuedTickets = aliasedTable(tickets, "issuedTickets");
  const calledTickets = aliasedTable(tickets, "calledTickets");

  const db = await getDb();
  const rows = await db
    .select({
      attractionId: attractions.id,
      peopleCapacity: attractions.peopleCapacity,
      playTime: attractions.playTime,
      storeName: stores.name,
      waitingPeople: issuedTickets.numberOfPeople,
      maxCalledIndex: max(calledTickets.index),
    })
    .from(attractions)
    .innerJoin(stores, eq(stores.id, attractions.storeId))
    .leftJoin(
      issuedTickets,
      and(
        eq(issuedTickets.attractionId, attractions.id),
        eq(issuedTickets.status, "ISSUED"),
      ),
    )
    .leftJoin(
      calledTickets,
      and(
        eq(calledTickets.attractionId, attractions.id),
        eq(calledTickets.status, "CALLED"),
      ),
    )
    .where(eq(stores.eventId, eventId))
    .groupBy(
      attractions.id,
      attractions.peopleCapacity,
      attractions.playTime,
      stores.name,
      issuedTickets.id,
      issuedTickets.numberOfPeople,
    );

  const attractionMap = new Map<
    string,
    {
      storeName: string;
      peopleCapacity: number | null;
      playTime: number | null;
      waitingPeople: number;
      maxCalledIndex: number | null;
    }
  >();

  for (const row of rows) {
    const current = attractionMap.get(row.attractionId);
    const waiting = row.waitingPeople ?? 0;
    const calledIndex = row.maxCalledIndex;

    if (!current) {
      attractionMap.set(row.attractionId, {
        storeName: row.storeName,
        peopleCapacity: row.peopleCapacity,
        playTime: row.playTime,
        waitingPeople: waiting,
        maxCalledIndex: calledIndex,
      });
      continue;
    }

    current.waitingPeople += waiting;
    if (
      calledIndex !== null &&
      (current.maxCalledIndex === null || calledIndex > current.maxCalledIndex)
    ) {
      current.maxCalledIndex = calledIndex;
    }
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
              <TableHead>最新の呼び出し番号</TableHead>
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
                  <TableCell>
                    {attraction.maxCalledIndex !== null
                      ? attraction.maxCalledIndex
                      : "-"}
                  </TableCell>
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
