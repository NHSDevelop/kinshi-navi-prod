import StoreInfo from "@/features/store/info";
import AttractionInfo from "@/features/store/attraction/info";
import { getDb } from "@/lib/db/drizzle";
import { stores, attractions, foods } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import FoodInfo from "@/features/store/food/info";
import ItemList from "@/features/store/food/item/list";

export const dynamic = "force-dynamic";

export default async function StorePage(props: {
  params: Promise<{ store_slug: string }>;
}) {
  const db = await getDb();
  const { store_slug } = await props.params;
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, store_slug))
    .limit(1);

  if (!storeRows[0]) {
    return <NotFoundPrompt context="店舗" />;
  }
  let attraction = null;
  let food = null;

  if (storeRows[0].storeType === "ATTRACTION") {
    const attractionRows = await db
      .select()
      .from(attractions)
      .where(eq(attractions.storeId, storeRows[0].id))
      .limit(1);
    if (!attractionRows[0]) {
      return <NotFoundPrompt context="店舗に紐づいた企画情報" />;
    }
    attraction = attractionRows[0];
  }

  if (storeRows[0].storeType === "FOOD") {
    const foodRows = await db
      .select()
      .from(foods)
      .where(eq(foods.storeId, storeRows[0].id))
      .limit(1);
    if (!foodRows[0]) {
      return <NotFoundPrompt context="店舗に紐づいた模擬店情報" />;
    }
    food = foodRows[0];
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          {storeRows[0].name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          店舗の基本情報と詳細を確認できます。
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <StoreInfo storeId={storeRows[0].id} isShowCanVoted={false} />
      </section>

      {storeRows[0].storeType === "ATTRACTION" && attraction && (
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <AttractionInfo attractionId={attraction.id} />
        </section>
      )}
      {storeRows[0].storeType === "FOOD" && food && (
        <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-6 md:gap-8">
            <FoodInfo foodId={food.id} />
            <div>
              <h2 className="text-lg font-bold text-main-950 md:text-xl">
                商品一覧
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                取り扱い商品の一覧です。在庫状況は在庫ページから確認できます。
              </p>
            </div>
            <ItemList foodId={food.id} />
          </div>
        </section>
      )}
    </div>
  );
}
