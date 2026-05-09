import StoreVoteResult from "@/features/store/vote/result";
import { requireEventAdminUser } from "@/lib/auth-guard";

export default async function IssueStoreAdminInvitePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">投票結果</h1>
      <StoreVoteResult />
    </div>
  );
}
