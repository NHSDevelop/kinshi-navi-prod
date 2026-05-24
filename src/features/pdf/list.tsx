import Link from "next/link";

import { desc } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/lib/db/drizzle";
import { pdfDocuments } from "@/lib/db/schema";
import { deletePdfDocument } from "./action";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export async function PdfDocumentList() {
  const db = await getDb();
  const pdfDocumentRows = await db
    .select({
      id: pdfDocuments.id,
      title: pdfDocuments.title,
      fileName: pdfDocuments.fileName,
      fileSize: pdfDocuments.fileSize,
      isPublished: pdfDocuments.isPublished,
      updatedAt: pdfDocuments.updatedAt,
      createdAt: pdfDocuments.createdAt,
    })
    .from(pdfDocuments)
    .orderBy(desc(pdfDocuments.updatedAt));

  return pdfDocumentRows.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>タイトル</TableHead>
          <TableHead>ファイル</TableHead>
          <TableHead>状態</TableHead>
          <TableHead>更新日時</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pdfDocumentRows.map((pdfDocument) => (
          <TableRow key={pdfDocument.id}>
            <TableCell className="font-medium">
              <Link
                href={`/pdf-documents/${pdfDocument.id}`}
                className="underline"
              >
                {pdfDocument.title}
              </Link>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span>{pdfDocument.fileName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatSize(pdfDocument.fileSize)}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span
                className={
                  pdfDocument.isPublished
                    ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                }
              >
                {pdfDocument.isPublished ? "公開中" : "非公開"}
              </span>
            </TableCell>
            <TableCell>
              {formatDate(pdfDocument.updatedAt ?? pdfDocument.createdAt)}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/pdf-documents/${pdfDocument.id}`}>表示</Link>
                </Button>
                <Button asChild size="sm" variant="default">
                  <Link
                    href={`/dashboard/pdf-documents/${pdfDocument.id}/edit`}
                  >
                    編集
                  </Link>
                </Button>
                {/* server-side form is rendered here so Next.js server action can be attached
                    The dialog's submit button will reference this form via its `form` attribute */}
                <form
                  id={`delete-pdf-${pdfDocument.id}`}
                  action={deletePdfDocument}
                  className="hidden"
                >
                  <input
                    type="hidden"
                    name="pdfDocumentId"
                    value={pdfDocument.id}
                  />
                </form>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="danger">削除</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        pdfを削除します。よろしいですか？
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        削除したファイルを復元することはできません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        form={`delete-pdf-${pdfDocument.id}`}
                        type="submit"
                        variant="danger"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <NotFoundPrompt context="PDFドキュメント" />
  );
}
