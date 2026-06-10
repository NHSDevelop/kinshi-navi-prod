import PublicPdfDocumentList from "@/features/pdf/public-list";
import { PageBunner } from "@/components/navigation/page-bunner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF一覧 ",
};

export const dynamic = "force-dynamic";

export default async function PdfDocumentsIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
      <PageBunner
        title="PDF一覧"
      />
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-4 shadow-sm md:p-6">
        <PublicPdfDocumentList />
      </section>
    </div>
  );
}
