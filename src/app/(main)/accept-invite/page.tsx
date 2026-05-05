import { acceptInvite } from "@/features/auth/invite/action";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ token?: string }>;
}
export default async function AcceptInvitePage(props: Props) {
  const searchParams = await props.searchParams;
  const token = searchParams.token ?? "";
  const result = await acceptInvite(token);

  if (result?.success) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl">
      <section className="rounded-[1.5rem] border border-main-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-bold text-main-950 md:text-2xl">
          招待の確認
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
          {result?.message ?? "処理が完了しました"}
        </p>
      </section>
    </div>
  );
}
