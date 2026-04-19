import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/features/auth/anonymous/action";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getDb } from "@/lib/db/drizzle";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function TicketIssuePage(props: {
  params: Promise<{ event_slug: string }>;
}) {
  const { event_slug } = await props.params;
  const db = await getDb();
  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.slug, event_slug))
    .limit(1);
  const event = eventRows[0];
  if (!event) {
    return <p>イベントが存在しません。</p>;
  }
  const user = await getCurrentUser();

  if (!user) {
    return <CreateAnonymousUser />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">チケットを発行する</h1>
      <Separator />
      {user && user.isAnonymous ? (
        <IssueTicket userId={user.id} eventId={event.id} isPaper={false} />
      ) : (
        <p className="text-sm md:text-base">
          管理者やスタッフはこのページでチケットを取得することはできません。
        </p>
      )}
    </div>
  );
}
