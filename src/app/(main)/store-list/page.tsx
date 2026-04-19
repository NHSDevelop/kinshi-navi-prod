import { Separator } from "@/components/ui/separator";
import StoreList from "@/features/store/list";

export default async function StoreListPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg md:text-xl font-bold">店舗一覧</h1>
      <Separator />
      <StoreList />
    </div>
  );
}
