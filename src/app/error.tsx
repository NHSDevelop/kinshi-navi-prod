"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorPrompt } from "@/components/prompt/error-prompt";

export default function ErrorPage() {
  return (
    <div>
      <header className="border-b-2 w-full flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-100">
        <Link href={"/"} className="text-2xl font-bold">
          Kinshi Navi
        </Link>
      </header>
      <div className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        <h1 className="text-red-400">エラーページ</h1>
        <ErrorPrompt error="サーバーエラーが発生しました" />
        <Button type="button" variant="card" asChild>
          <Link href="/">トップページにもどる</Link>
        </Button>
      </div>
    </div>
  );
}
