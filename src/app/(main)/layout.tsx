import Link from "next/link";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-400">
        <Link href={"/"} className="text-lg md:text-xl  font-bold">
          Gakusai Hub
        </Link>
        <Link href={"/event-list"} className="md:text-lg">
          開催中のイベント
        </Link>
      </header>
      <main className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        {children}
      </main>
    </>
  );
}
