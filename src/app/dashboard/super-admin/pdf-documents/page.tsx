import { PdfDocumentList } from "@/features/pdf/list";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePdfManagerUser } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PdfDocumentsDashboardPage() {
  await requirePdfManagerUser();

  return (
    <DashboardPageShell
      title="PDFドキュメント管理"
      description="更新、削除を行います。閲覧ページは未ログインユーザーでもアクセスできます。"
    >
      <div className="space-y-4">
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDFの管理</CardTitle>
          </CardHeader>
          <CardContent>
            <PdfDocumentList />
          </CardContent>
        </Card>
        <Button asChild variant="card">
          <Link href="/dashboard/super-admin/pdf-documents/upload" className="flex items-center gap-2 w-full h-full">
            PDFのアップロード
          </Link>
        </Button>
      </div>
    </DashboardPageShell>
  );
}
