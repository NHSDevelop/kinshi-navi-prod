import CreateEvent from "@/features/event/create";

export default async function CreateEventPage(props: {
  params: Promise<{ organization_id: string }>;
}) {
  const { organization_id } = await props.params;
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントを作成</h1>
      <CreateEvent organizationId={organization_id} />
    </div>
  );
}
