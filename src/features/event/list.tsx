import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { getDb } from "@/lib/db/drizzle";

export default async function EventList() {
  const db = await getDb();
  const eventRows = await db.query.events.findMany({
    with: {
      organization: true,
    },
  });

  return (
    <div className="space-y-4 lg:space-y-8">
      {eventRows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>イベント名</TableHead>
              <TableHead>開催組織</TableHead>
              <TableHead>イベントページ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventRows.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-semibold md:text-lg">
                  {event.name}
                </TableCell>
                <TableCell>
                  <Badge className="text-sm">
                    {event.organization?.name || "未設定"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button asChild variant="card">
                    <Link href={`/event/${event.slug}`}>イベントページ</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="イベント" />
      )}
    </div>
  );
}
