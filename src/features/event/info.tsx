import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDbAsync } from "@/lib/db/drizzle";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface EventInfoProps {
  eventId: string;
}

export default async function EventInfo({ eventId }: EventInfoProps) {
  const db = await getDbAsync();
  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  const event = eventRows[0];

  if (!eventRows[0]) {
    return <NotFoundPrompt context="イベント" />;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "未設定";
    return format(date, "yyyy/MM/dd", { locale: ja });
  };

  const dateRange =
    event.startedAtDate && event.finishedAtDate
      ? `${formatDate(event.startedAtDate)} 〜 ${formatDate(event.finishedAtDate)}`
      : "未設定";

  const timeRange =
    event.startedAtTime && event.finishedAtTime
      ? `${event.startedAtTime} 〜 ${event.finishedAtTime}`
      : "未設定";

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 items-center">
          <CardTitle>{event.name}</CardTitle>
          {event.isActive ? (
            <Badge variant="success" className="text-sm">
              開催中
            </Badge>
          ) : (
            <Badge variant="danger" className="text-sm">
              停止中
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <div className="flex flex-col items-start gap-4">
          <p>名前：</p>
          <p>開催日：</p>
          <p>開催時間：</p>
          <p>詳細：</p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <p>{event.name}</p>
          <p>{dateRange}</p>
          <p>{timeRange}</p>
          <p>{event.description ?? "なし"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
