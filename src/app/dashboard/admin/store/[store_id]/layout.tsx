export default async function AdminStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store_id: string }>;
}) {
  return <>{children}</>;
}
