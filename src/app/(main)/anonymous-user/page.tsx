import CreateAnonymousUser from "@/features/auth/anonymous/create";
import { PushNotificationManager } from "@/features/push/manager";
import UserTicketList from "@/features/store/attraction/ticket/user-list";
import DeleteAnonymousUser from "@/features/auth/anonymous/delete";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { InstallPrompt } from "@/features/push/install";
import { HelpPrompt } from "@/components/prompt/help";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";

export default async function AnonymousUserPage() {
  const session = await getSessionFromRequestHeaders();
  const user = session?.user;

  if (!user) {
    return <CreateAnonymousUser />;
  }
  if (user.isAnonymous === false) {
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
      <div className="flex justify-between  items-center">
        <h2 className="text-lg md:text-xl font-bold">取得したチケット</h2>
        <HelpPrompt title="チケットについて">
          <ul className="w-auto list-disc space-y-4">
            <li className="text-sm">
              チケットが「呼び出し中」になったら、企画の開催場所までお越しください。
            </li>
            <li className="text-sm">
              企画に参加する際は、画面右上のユーザーアイコンから、「ゲストユーザーページ」にあるチケットのQRコードを受付にて係員に表示してください。
            </li>
            <li className="text-sm">
              チケットが呼び出されたかどうかは、このページ以外にも「イベントページ」→「企画の待機状況」からご覧になることができます。
            </li>
            <li className="text-sm">
              呼び出されていてもチケットが「発券済み」の場合は、お手数ですが画面の再読み込みをお願いします。
            </li>
            <li className="text-sm">
              プッシュ通知を購読していると、チケットが呼び出されたときに通知を受け取ることができます。
            </li>
          </ul>
        </HelpPrompt>
      </div>
      <UserTicketList userId={user.id} />
      <Separator />
      {user.isAnonymous && <DeleteAnonymousUser />}
    </div>
  );
}
