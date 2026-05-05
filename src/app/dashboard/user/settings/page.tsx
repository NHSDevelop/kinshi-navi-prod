import { Separator } from "@/components/ui/separator";
import DeleteAuthUser from "@/features/auth/delete";
import { redirect } from "next/navigation";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

export default async function UserSettingsPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    redirect("/signin");
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">ユーザー設定</h1>
      <Separator />
      {user.isAnonymous === false && <DeleteAuthUser />}
    </div>
  );
}
