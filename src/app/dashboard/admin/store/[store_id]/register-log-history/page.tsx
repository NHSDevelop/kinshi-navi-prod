import { DashboardPageShell } from "@/components/dashboard/page-shell";
import CombinedHistoryList from "@/features/store/food/history/combined-list";
import { Button } from "@/components/ui/button";
import { requireStoreAdminUser } from "@/lib/auth-guard";
import Link from "next/link";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

export default async function AdminRegisterLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { store_id } = await props.params;
  const searchParams = await props.searchParams;
  const from = searchParams?.from ?? "";
  const to = searchParams?.to ?? "";
  await requireStoreAdminUser(store_id);

  const buildExportUrl = (type: "accounting" | "inventory") => {
    const params = new URLSearchParams({ type });
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    return `/api/stores/${store_id}/exports?${params.toString()}`;
  };

  return (
    <DashboardPageShell
      title="会計・在庫履歴"
      description="会計と在庫の履歴をまとめて表示します。"
    >
      <div className="space-y-4">
        <form className="flex flex-wrap items-end gap-2" method="get">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">開始日</span>
            <input
              className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm"
              name="from"
              type="date"
              defaultValue={from}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">終了日</span>
            <input
              className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm"
              name="to"
              type="date"
              defaultValue={to}
            />
          </div>
          <Button type="submit" variant="card">
            期間を適用
          </Button>
          {(from || to) && (
            <Button asChild variant="ghost">
              <Link
                href={`/dashboard/admin/store/${store_id}/register-log-history`}
              >
                期間をリセット
              </Link>
            </Button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="card">
            <a href={buildExportUrl("accounting")}>会計CSVをダウンロード</a>
          </Button>
          <Button asChild variant="card">
            <a href={buildExportUrl("inventory")}>在庫CSVをダウンロード</a>
          </Button>
        </div>
        <Suspense fallback={<LoadingPrompt context="履歴" />}>
          <CombinedHistoryList storeId={store_id} />
        </Suspense>
      </div>
    </DashboardPageShell>
  );
}
