import CreateEvent from "@/features/event/create";

export default async function CreateEventPage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">イベントを作成</h1>
      <CreateEvent />
    </div>
  );
}
