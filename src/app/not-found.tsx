import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div>
      <div className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8 space-y-8">
        <h1 className="text-red-400 text-2xl">
          Error 404 | お探しのページは見つかりませんでした。
        </h1>
        <Button type="button" variant="danger" asChild>
          <Link href={"/"}>トップページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
