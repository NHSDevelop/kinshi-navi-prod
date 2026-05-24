import PublicPdfDocumentList from "@/features/pdf/public-list";

export const dynamic = "force-dynamic";

export default async function PdfDocumentsIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <section className="rounded-[1.75rem] border border-main-200 bg-main-50/70 p-5 md:p-7">
        <h1 className="text-2xl font-bold text-main-950 md:text-3xl">
          PDF一覧
        </h1>
        <p className="mt-3 text-sm leading-6 text-main-900/80 md:text-base">
          公開中のPDFドキュメントを一覧表示します。タイトルを選ぶと閲覧ページを開けます。
        </p>
      </section>
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <PublicPdfDocumentList />
      </section>
    </div>
  );
}
