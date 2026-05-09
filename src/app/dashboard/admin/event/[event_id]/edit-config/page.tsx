import UpdateEventConfig from "@/features/event/update";
import { requireEventAdminUser } from "@/lib/auth-guard";

export default async function EditEventConfigPage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントの設定を編集</h1>
      <UpdateEventConfig eventId={event_id} />
    </div>
  );
}
