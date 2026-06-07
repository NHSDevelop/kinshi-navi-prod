import CreatePdfDocumentForm from "@/features/pdf/create";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePdfManagerUser } from "@/lib/auth-guard";

export default async function PdfDocumentsUploadPage() {
  await requirePdfManagerUser();

  return (
    <DashboardPageShell
      title="PDFのアップロード"
      description="公開PDFのアップロードを行います。"
    >
      <Card className="border-main-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>PDFをアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePdfDocumentForm />
        </CardContent>
      </Card>
    </DashboardPageShell>
  );
}
