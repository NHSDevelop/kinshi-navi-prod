import CreateStore from "@/features/store/create";
import { requireEventAdminUser } from "@/lib/auth-guard";

export default async function CreateStorePage(props: {
  params: Promise<{ event_id: string }>;
}) {
  const { event_id } = await props.params;
  await requireEventAdminUser(event_id);
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">店舗を作成</h1>
      <CreateStore eventId={event_id} />
    </div>
  );
}
