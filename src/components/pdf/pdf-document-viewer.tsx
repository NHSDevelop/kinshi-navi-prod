import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type PdfDocumentViewerProps = {
  title: string;
  fileUrl: string;
  fileName: string;
  description?: string | null;
};

export function PdfDocumentViewer({
  title,
  fileUrl,
  fileName,
  description,
}: PdfDocumentViewerProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-main-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-main-100 px-6 py-5 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-main-700">
            PDF
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-main-950 md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-main-900/75 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Button asChild variant="ghost" className="w-full md:w-auto">
            <Link href="/pdf-documents">一覧へ戻る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link href={fileUrl} target="_blank" rel="noreferrer">
              別タブで開く
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-slate-100/80">
        <iframe
          title={title}
          src={fileUrl}
          className="h-[78vh] w-full border-0 bg-white"
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-main-100 px-6 py-4 text-sm text-main-900/80 md:flex-row md:items-center md:justify-between md:px-8">
        <p>ファイル名: {fileName}</p>
        <Button asChild size="sm" variant="ghost" className="w-fit px-0">
          <Link href={fileUrl} download className="flex items-center gap-2 w-full h-full">
            <Download />
            ダウンロード
          </Link>
        </Button>
      </div>
    </section>
  );
}
