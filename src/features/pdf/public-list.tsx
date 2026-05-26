import Link from "next/link";

import { desc, eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { pdfDocuments } from "@/lib/db/schema";

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(value: Date) {
  return value.toLocaleString("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function PublicPdfDocumentList() {
  const db = await getDb();
  const pdfDocumentRows = await db
    .select({
      id: pdfDocuments.id,
      title: pdfDocuments.title,
      description: pdfDocuments.description,
      fileName: pdfDocuments.fileName,
      fileSize: pdfDocuments.fileSize,
      updatedAt: pdfDocuments.updatedAt,
    })
    .from(pdfDocuments)
    .where(eq(pdfDocuments.isPublished, true))
    .orderBy(desc(pdfDocuments.updatedAt));

  if (pdfDocumentRows.length === 0) {
    return <NotFoundPrompt context="公開中のPDFドキュメント" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pdfDocumentRows.map((pdfDocument) => (
        <Card key={pdfDocument.id} className="border-main-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-main-950">
              {pdfDocument.title}
            </CardTitle>
            {pdfDocument.description ? (
              <CardDescription className="leading-6 text-main-900/70">
                {pdfDocument.description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-main-900/80">
            <p>{pdfDocument.fileName}</p>
            <p>更新日時: {formatDate(pdfDocument.updatedAt)}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            <Button asChild variant="card" className="w-full">
              <Link href={`/pdf-documents/${pdfDocument.id}`}>表示する</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
