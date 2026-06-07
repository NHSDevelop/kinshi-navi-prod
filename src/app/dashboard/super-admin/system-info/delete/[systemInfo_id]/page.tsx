import DeleteSystemInfo from "@/features/system-info/delete";
import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdminUser } from "@/lib/auth-guard";
import { formatYMD } from "@/lib/formatDate";

export default async function DeleteSystemInfoPage(props: {
  params: Promise<{ systemInfo_id: string }>;
}) {
  await requireSuperAdminUser();

  const { systemInfo_id } = await props.params;
  const db = await getDb();
  const systemInfoRows = await db
    .select({
      id: systemInfos.id,
      title: systemInfos.title,
      meta: systemInfos.meta,
      createdAt: systemInfos.createdAt,
    })
    .from(systemInfos)
    .where(eq(systemInfos.id, systemInfo_id))
    .limit(1);

  return (
    <DashboardPageShell
      title="お知らせを削除"
      description="削除前に内容を確認してください。"
    >
      {systemInfoRows.length > 0 ? (
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>{systemInfoRows[0].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-main-100 bg-main-50/40 p-4">
              <p className="text-sm text-main-900/70">
                {formatYMD(systemInfoRows[0].createdAt)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {systemInfoRows[0].meta}
              </p>
            </div>
            <p className="text-sm text-red-700">
              削除したお知らせは復元できません。
            </p>
            <DeleteSystemInfo systemInfoId={systemInfoRows[0].id} />
          </CardContent>
        </Card>
      ) : (
        <NotFoundPrompt context="お知らせ" />
      )}
    </DashboardPageShell>
  );
}
