import CreatePdfDocumentForm from "@/features/pdf/create";
import { requireSuperAdminUser } from "@/lib/auth-guard";

export default async function UploadPdfPage() {
  await requireSuperAdminUser();

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">pdfをアップロード</h1>
      <CreatePdfDocumentForm />
    </div>
  );
}
