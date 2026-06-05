import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { STORE_TYPE_MAP } from "@/lib/type";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";

interface StoreInfoProps {
  storeId: string;
  isShowCanVoted: boolean;
}

export default async function StoreInfo({
  storeId,
  isShowCanVoted,
}: StoreInfoProps) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  const store = rows[0];
  if (!store) {
    return <p>店舗が存在しません。</p>;
  }
  const storeType =
    STORE_TYPE_MAP[store.storeType as keyof typeof STORE_TYPE_MAP]?.label ??
    store.storeType;

  const formatDate = (date: Date | null) => {
    if (!date) return "未設定";
    return format(date, "yyyy/MM/dd", { locale: ja });
  };

  const dateRange =
    store.startedAtDate && store.finishedAtDate
      ? `${formatDate(store.startedAtDate)} 〜 ${formatDate(store.finishedAtDate)}`
      : "未設定";

  const timeRange =
    store.startedAtTime && store.finishedAtTime
      ? `${store.startedAtTime} 〜 ${store.finishedAtTime}`
      : "未設定";

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
      <div className="block lg:hidden">
        <h3 className="text-lg font-semibold text-main-950">{store.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{storeType}</Badge>
          {store.isActive ? (
            <Badge variant="success" className="text-sm">
              開催中
            </Badge>
          ) : (
            <Badge variant="danger" className="text-sm">
              停止中
            </Badge>
          )}
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 justify-items-center sm:grid-cols-2 sm:justify-items-stretch xl:w-[min(100%,32rem)] xl:flex-none">
        <div className="w-full max-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:max-w-none">
          {store.imageUrl ? (
            <Image
              src={store.imageUrl}
              alt={`${store.name}のポスター画像`}
              width={160}
              height={220}
              className="h-auto w-full rounded-lg object-contain"
              sizes="(max-width: 1024px) 100vw, 160px"
            />
          ) : (
            <Image
              src="/images/default-image.webp"
              alt="デフォルト画像"
              width={160}
              height={220}
              className="h-auto w-full rounded-lg object-contain"
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 160px"
            />
          )}
        </div>
        <div className="w-full max-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:max-w-none">
          {store.apparanceImageUrl ? (
            <Image
              src={store.apparanceImageUrl}
              alt={`${store.name}の外観画像`}
              width={320}
              height={220}
              className="h-auto w-full rounded-lg object-contain"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          ) : (
            <Image
              src="/images/default-apparance-image.webp"
              alt="デフォルト画像"
              width={320}
              height={220}
              className="h-auto w-full rounded-lg object-contain"
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 xl:pt-1">
        <div className="hidden xl:block">
          <h3 className="text-lg font-semibold text-main-950">{store.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{storeType}</Badge>
            {store.isActive ? (
              <Badge variant="success" className="text-sm">
                開催中
              </Badge>
            ) : (
              <Badge variant="danger" className="text-sm">
                停止中
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-4 text-sm xl:text-base">
          <p className="font-medium text-slate-700">開催日：</p>
          <p className="min-w-0 wrap-break-word">{dateRange}</p>
          <p className="font-medium text-slate-700">開催時間：</p>
          <p className="min-w-0 wrap-break-word">{timeRange}</p>
          <p className="font-medium text-slate-700">詳細：</p>
          <p className="min-w-0 wrap-break-word">
            {store.description ?? "なし"}
          </p>
          {isShowCanVoted && (
            <>
              <p className="font-medium text-slate-700">投票可能か：</p>
              <p className="min-w-0 wrap-break-word">
                {store.canVoted ? "はい" : "いいえ"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
