import { Separator } from "@/components/ui/separator";
import FoodRegister from "@/features/store/food/register/register";

export default async function RegisterPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">レジページ</h1>
      <Separator />
      <FoodRegister storeId={store_id} />
    </div>
  );
}
