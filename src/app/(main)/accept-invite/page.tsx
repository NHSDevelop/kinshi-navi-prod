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
    <div>
      <p>{result?.message ?? "処理が完了しました"}</p>
    </div>
  );
}
