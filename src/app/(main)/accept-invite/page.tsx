import { acceptInvite } from "@/features/auth/invite/action";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ token?: string }>;
}
export default async function AcceptInvitePage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token ?? "";
  const result = await acceptInvite(token);

  return (
    <div className="mx-auto mt-8 w-full max-w-xl">
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-bold text-main-950 md:text-2xl">
          招待の確認
        </h1>
        {result?.success ? (
          <div className="flex flex-col gap-2">
            <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
              {result?.message ?? "処理が完了しました"}
            </p>
            <Button variant="card" asChild>
              <Link href="/dashboard">管理画面へ</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Spinner className="h-8 w-8" />
            <span className="text-sm text-muted-foreground">招待の処理中…</span>
          </div>
        )}
      </section>
    </div>
  );
}
