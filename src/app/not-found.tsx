import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div>
      <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-400">
        <Link href={"/"} className="text-2xl font-bold">
          Gakusai Hub
        </Link>
      </header>
      <div className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        <h2 className="text-red-400">
          404 | お探しのページは見つかりませんでした。
        </h2>
        <Button type="button" variant="danger" asChild>
          <Link href={"/"}>トップページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
