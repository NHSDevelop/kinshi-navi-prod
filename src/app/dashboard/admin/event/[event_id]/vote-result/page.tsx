import StoreVoteResult from "@/features/store/vote/result";
import { requireEventAdminUser } from "@/lib/auth-guard";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function VoteResultAdminPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <DashboardPageShell title="店舗の投票結果">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg">クラス企画の投票結果</h2>
        <StoreVoteResult storeType="ATTRACTION" canSeenAllUser={false} />
        <Separator />
        <h2 className="text-lg">クラス販売の投票結果</h2>
        <StoreVoteResult storeType="FOOD" canSeenAllUser={false} />
        <Separator />
      </div>
    </DashboardPageShell>
  );
}
