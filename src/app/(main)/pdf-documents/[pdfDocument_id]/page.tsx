import { eq } from "drizzle-orm";

import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { PdfDocumentViewer } from "@/components/pdf/pdf-document-viewer";
import { getDb } from "@/lib/db/drizzle";
import { pdfDocuments } from "@/lib/db/schema";
import { Suspense } from "react";
import { LoadingPrompt } from "@/components/prompt/loading-prompt";

export const dynamic = "force-dynamic";

export default async function PdfDocumentPage(props: {
  params: Promise<{ pdfDocument_id: string }>;
}) {
  const { pdfDocument_id } = await props.params;
  const db = await getDb();
  const pdfDocumentRows = await db
    .select({
      id: pdfDocuments.id,
      title: pdfDocuments.title,
      description: pdfDocuments.description,
      fileUrl: pdfDocuments.fileUrl,
      fileName: pdfDocuments.fileName,
      isPublished: pdfDocuments.isPublished,
    })
    .from(pdfDocuments)
    .where(eq(pdfDocuments.id, pdfDocument_id))
    .limit(1);

  if (pdfDocumentRows.length === 0 || !pdfDocumentRows[0].isPublished) {
    return <NotFoundPrompt context="PDFドキュメント" />;
  }

  const pdfDocument = pdfDocumentRows[0];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<LoadingPrompt context="pdf" />}>
        <PdfDocumentViewer
          title={pdfDocument.title}
          description={pdfDocument.description}
          fileUrl={pdfDocument.fileUrl}
          fileName={pdfDocument.fileName}
        />
      </Suspense>
    </div>
  );
}
