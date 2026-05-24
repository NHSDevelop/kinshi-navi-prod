import { eq } from "drizzle-orm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { requirePdfManagerUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { pdfDocuments } from "@/lib/db/schema";
import UpdatePdfDocumentForm from "@/features/pdf/update-form";

export const dynamic = "force-dynamic";

export default async function EditPdfDocumentPage(props: {
  params: Promise<{ pdfDocument_id: string }>;
}) {
  await requirePdfManagerUser();
  const { pdfDocument_id } = await props.params;
  const db = await getDb();
  const pdfDocumentRows = await db
    .select()
    .from(pdfDocuments)
    .where(eq(pdfDocuments.id, pdfDocument_id))
    .limit(1);

  return (
    <DashboardPageShell
      title="PDFを編集"
      description="公開PDFのタイトル、公開設定、ファイルを更新します。"
    >
      {pdfDocumentRows.length > 0 ? (
        <Card className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDF編集フォーム</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdatePdfDocumentForm pdfDocument={pdfDocumentRows[0]} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-main-200/80 shadow-sm">
          <CardContent className="pt-6">
            <NotFoundPrompt context="PDFドキュメント" />
          </CardContent>
        </Card>
      )}
    </DashboardPageShell>
  );
}
