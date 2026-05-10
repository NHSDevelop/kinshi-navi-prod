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
    <div className="flex flex-row items-center gap-4 md:gap-8">
      <div className="shrink-0 self-center mr-4">
        {store.imageUrl ? (
          <Image
            src={store.imageUrl}
            alt={`${store.name}の画像`}
            width={160}
            height={220}
            className="rounded-md border border-slate-200 object-contain"
          />
        ) : (
          <Image
            src="/images/default-image.png"
            alt={`デフォルト画像`}
            width={160}
            height={220}
            className="rounded-md border border-slate-200 object-contain"
            loading="eager"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
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
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-4 text-sm md:text-base">
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
