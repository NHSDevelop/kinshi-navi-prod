import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/features/auth/anonymous/action";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { getMainEvent } from "@/features/event/action";
import IssueTicket from "@/features/store/attraction/ticket/issue";
import { notFound } from "next/navigation";

export default async function TicketIssuePage() {
  const event = await getMainEvent();
  if (!event) {
    notFound();
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
