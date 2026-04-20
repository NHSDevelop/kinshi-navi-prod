import CreateStoreVote from "@/features/store/vote/create";
import { Separator } from "@/components/ui/separator";

export default function FoodVotePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">模擬店の投票</h1>
      <Separator />
      <CreateStoreVote storeType="FOOD" />
    </div>
  );
}
