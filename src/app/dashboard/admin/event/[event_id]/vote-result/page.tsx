import StoreVoteResult from "@/features/store/vote/result";
import { getMainEvent } from "@/features/event/action";
import { notFound } from "next/navigation";

export default async function IssueStoreAdminInvitePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  const mainEvent = await getMainEvent();

  if (!mainEvent || mainEvent.id !== event_id) {
    notFound();
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">投票結果</h1>
      <StoreVoteResult />
    </div>
  );
}
