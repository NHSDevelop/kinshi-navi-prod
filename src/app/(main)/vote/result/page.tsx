import StoreVoteResult from "@/features/store/vote/result";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

export const dynamic = "force-dynamic";

export default async function VoteResultPage() {
  return (
    <DashboardPageShell title="店舗の投票結果">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg">クラス企画の投票結果</h2>
        <Suspense fallback={<LoadingPrompt context="投票結果" />}>
          <StoreVoteResult storeType="ATTRACTION" canSeenAllUser={true} />
        </Suspense>
        <Separator />
        <h2 className="text-lg">クラス販売の投票結果</h2>
        <Suspense fallback={<LoadingPrompt context="投票結果" />}>
          <StoreVoteResult storeType="FOOD" canSeenAllUser={true} />
        </Suspense>
        <Separator />
      </div>
    </DashboardPageShell>
  );
}
