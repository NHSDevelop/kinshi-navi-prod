import { Separator } from "@/components/ui/separator";
import CreateSystemInfo from "@/features/system-info/create";

export default async function SuperAdminCreateSystemInfoPage() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">お知らせを作成</h1>
      <Separator />
      <CreateSystemInfo />
    </div>
  );
}
