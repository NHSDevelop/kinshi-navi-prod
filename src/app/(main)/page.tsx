import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function EventTopPage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="text-lg md:text-xl font-bold">トップページ</h1>
      <Separator />
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max gap-2 pb-4">
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/issue-ticket`}>チケットを発行</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/store-list`}>店舗一覧</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/attraction/waiting-status`}>企画の待機状況</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/food/stock-status`}>模擬店の在庫状況</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/vote/attraction`}>企画の人気投票（仮）</Link>
          </Button>
          <Button asChild variant="card" className="shrink-0">
            <Link href={`/vote/food`}>模擬店の人気投票（仮）</Link>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
