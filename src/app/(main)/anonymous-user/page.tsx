import { getCurrentUser } from "@/features/auth/anonymous/action";
import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { PushNotificationManager } from "@/features/push/manager";
import UserTicketList from "@/features/store/attraction/ticket/user-list";
import DeleteAnonymousUser from "@/features/auth/anonymous/delete";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { InstallPrompt } from "@/features/push/install";

export default async function AnonymousUserPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <CreateAnonymousUser />;
  }
  if (user && user.isAnonymous === false) {
    redirect("/dashboard/user");
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl  font-bold">ゲストユーザーページ</h1>
      <Separator />
      <h2 className="text-lg md:text-xl font-bold">ユーザー設定</h2>
      <InstallPrompt />
      <PushNotificationManager userId={user.id} />
      <Separator />
      <h2 className="text-lg md:text-xl font-bold">取得したチケット</h2>
      <UserTicketList userId={user.id} />
      <Separator />
      {user.isAnonymous && <DeleteAnonymousUser />}
    </div>
  );
}
