import { redirect } from "next/navigation";

export default async function StockLogHistoryPage(props: {
  params: Promise<{ store_id: string }>;
}) {
  const { store_id } = await props.params;
  redirect(`/dashboard/staff/store/${store_id}/register-log-history`);
}
