import UpdateSystemInfo from "@/features/system-info/update";

export default async function EditSystemInfoPage(props: {
  params: Promise<{ systemInfo_id: string }>;
}) {
  const { systemInfo_id } = await props.params;

  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">お知らせの編集</h1>
      <UpdateSystemInfo systemInfoId={systemInfo_id} />
    </div>
  );
}
