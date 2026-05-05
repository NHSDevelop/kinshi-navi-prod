import CreateStoreVote from "@/features/store/vote/create";

export default function FoodVotePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          模擬店の投票
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          食べてよかった模擬店に投票できます。人気ランキングの集計に利用されます。
        </p>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <CreateStoreVote storeType="FOOD" />
      </section>
    </div>
  );
}
