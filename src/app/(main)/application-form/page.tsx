import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用申し込み | Gakusai Hub",
};

export default function ApplicationFormPage() {
  return (
    <div className="space-y-4 md:space-y-8">
      <h1 className="text-xl font-bold">利用申し込み</h1>
      <Separator />
      <div className="flex">
        <Link href="/terms" className="text-sky-500 hover:underline">
          利用規約
        </Link>
        と
        <Link href="/help/admin" className="text-sky-500 hover:underline">
          管理者向けガイド
        </Link>
        をお読みいただき、よろしければ下のボタンからお申込みを行ってください。
      </div>
      <Button asChild variant="card">
        <Link href="https://forms.gle/rqTp2F1AjmY3dvxWA">
          利用申し込みフォームへ
        </Link>
      </Button>
    </div>
  );
}
