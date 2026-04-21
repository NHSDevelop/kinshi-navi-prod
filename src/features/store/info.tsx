import { getDb } from "@/lib/db/drizzle";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STORE_TYPE_MAP } from "@/lib/type";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";

interface StoreInfoProps {
  storeId: string;
}

export default async function StoreInfo({ storeId }: StoreInfoProps) {
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <CardTitle>{store.name}</CardTitle>
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
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:gap-8 md:flex-row md:items-start">
          {store.imageUrl && (
            <Image
              src={store.imageUrl}
              alt={`${store.name}の画像`}
              width={600}
              height={800}
              unoptimized
              className="h-auto w-full max-w-xs rounded-md border md:max-w-sm"
            />
          )}
          <div className="flex gap-2 md:flex-1">
            <div className="flex flex-col items-start gap-4">
              <p>名前：</p>
              <p>開催日：</p>
              <p>開催時間：</p>
              <p>詳細：</p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <p>{store.name}</p>
              <p>{dateRange}</p>
              <p>{timeRange}</p>
              <p>{store.description ?? "なし"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
