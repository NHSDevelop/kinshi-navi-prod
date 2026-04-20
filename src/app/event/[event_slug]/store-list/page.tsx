import { Separator } from "@/components/ui/separator";
import StoreList from "@/features/store/list";

export const revalidate = 60;

export default async function StoreListPage(props: {
  params: Promise<{ event_slug: string }>;
}) {
  const { event_slug } = await props.params;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">店舗一覧</h1>
      <Separator />
      <StoreList eventSlug={event_slug} />
    </div>
  );
}
