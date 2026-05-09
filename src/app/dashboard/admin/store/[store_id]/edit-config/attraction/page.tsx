import UpdateAttractionConfig from "@/features/store/attraction/update";

export default async function EditAttractionConfigPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">企画の設定を編集</h1>
      <UpdateAttractionConfig storeId={store_id} />
    </div>
  );
}
