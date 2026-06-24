import { LoadingPrompt } from "@/components/prompt/loading-prompt";
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
import { aliasedTable, and, eq, max, asc, count } from "drizzle-orm";
import { Suspense } from "react";

interface AttractionWaitngStatusProps {
  eventId: string;
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_STORE_NAME_LENGTH = 10;

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
      maxGroups: attractions.maxGroups,
      playTime: attractions.playTime,
      storeName: stores.name,
      waitingGroups: count(issuedTickets.id),
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
      attractions.maxGroups,
      attractions.playTime,
      stores.name,
    )
    .orderBy(asc(stores.name));

  return (
    <>
      =
      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>企画名</TableHead>
              <TableHead>最新の呼び出し番号</TableHead>
              <TableHead>待ち組数（組）</TableHead>
              <TableHead>待ち時間（分）</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((attraction) => {
              const waitingGroups = attraction.waitingGroups;
              const maxGroups = attraction.maxGroups || 1;
              const cycleCount = Math.ceil(waitingGroups / maxGroups);
              const waitMinutes = cycleCount * (attraction.playTime || 1);

              const truncatedStoreName =
                attraction.storeName.length > MAX_STORE_NAME_LENGTH
                  ? `${attraction.storeName.slice(0, MAX_STORE_NAME_LENGTH)}...`
                  : attraction.storeName;

              return (
                <Suspense
                  fallback={<LoadingPrompt context="待機状況" />}
                  key={attraction.attractionId}
                >
                  <TableRow>
                    <TableCell title={attraction.storeName}>
                      {truncatedStoreName}
                    </TableCell>
                    <TableCell>
                      {attraction.maxCalledIndex !== null
                        ? attraction.maxCalledIndex
                        : "-"}
                    </TableCell>
                    <TableCell>{waitingGroups}</TableCell>
                    <TableCell>{waitMinutes}</TableCell>
                  </TableRow>
                </Suspense>
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
