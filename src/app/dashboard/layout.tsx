import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";

export default async function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-100">
        <Link href={"/dashboard"} className="text-lg md:text-xl  font-bold">
          Dashboard | Kinshi Navi
        </Link>
        <Link
          href={"/dashboard/user"}
          className="bg-gray-50 border border-gray-950 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <AiOutlineUser />
        </Link>
      </header>
      <main className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        {children}
      </main>
    </>
  );
}
