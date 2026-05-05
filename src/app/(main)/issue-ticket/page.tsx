import { Separator } from "@/components/ui/separator";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function TicketIssuePage() {
  const mainEventId = process.env.MAIN_EVENT_ID as string;

  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return <CreateAnonymousUser />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">チケットを発行する</h1>
      <Separator />
      {user.isAnonymous ? (
        <IssueTicket userId={user.id} eventId={mainEventId} isPaper={false} />
      ) : (
        <p className="text-sm md:text-base">
          管理者やスタッフはこのページでチケットを取得することはできません。
        </p>
      )}
    </div>
  );
}
