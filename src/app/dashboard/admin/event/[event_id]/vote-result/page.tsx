import StoreVoteResult from "@/features/store/vote/result";

export default async function IssueStoreAdminInvitePage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">投票結果</h1>
      <StoreVoteResult />
    </div>
  );
}
