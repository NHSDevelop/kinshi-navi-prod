import CreatePdfDocumentForm from "@/features/pdf/create";
import { PdfDocumentList } from "@/features/pdf/list";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePdfManagerUser } from "@/lib/auth-guard";

export default async function PdfDocumentsDashboardPage() {
  await requirePdfManagerUser();

  return (
    <DashboardPageShell
      title="PDFドキュメント管理"
      description="公開PDFのアップロード、更新、削除を行います。閲覧ページは未ログインユーザーでもアクセスできます。"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDFをアップロード</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePdfDocumentForm />
          </CardContent>
        </Card>

        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDF管理テーブル</CardTitle>
          </CardHeader>
          <CardContent>
            <PdfDocumentList />
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
