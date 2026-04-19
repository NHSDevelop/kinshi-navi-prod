import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/features/auth/anonymous/action";
import DeleteAuthUser from "@/features/auth/delete";
import { redirect } from "next/navigation";

export default async function UserSettingsPage() {
  const user = await getCurrentUser();
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
