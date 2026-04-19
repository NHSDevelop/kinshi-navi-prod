"use client";

import { Store } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StoreInfoCardProps {
  store: Store;
}

export function StoreInfoCard({ store }: StoreInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 items-center">
          <CardTitle>{store.name}</CardTitle>
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
      <CardContent className="flex gap-2">
        <div className="flex flex-col items-start gap-4">
          <p>名前：</p>
          <p>開始日時：</p>
          <p>終了日時：</p>
          <p>詳細：</p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <p>{store.name}</p>
          <p>
            {store.startedAtDate?.toLocaleString() ?? "未設定"}{" "}
            {store.startedAtTime ?? ""}
          </p>
          <p>
            {store.finishedAtDate?.toLocaleString() ?? "未設定"}{" "}
            {store.finishedAtTime ?? ""}
          </p>
          <p>{store.description ?? "なし"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
