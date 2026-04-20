import { Separator } from "@/components/ui/separator";
import EventList from "@/features/event/list";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "イベント一覧 | Gakusai Hub",
};

export default function EventListPage() {
  return (
    <div className="space-y-4 md:space-y-8">
      <h1 className="text-xl font-bold">イベント一覧</h1>
      <Separator />
      <EventList />
    </div>
  );
}
