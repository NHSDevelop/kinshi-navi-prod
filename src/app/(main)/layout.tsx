import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";

import { MobileQuickMenu } from "@/components/navigation/mobile-quick-menu";
import { quickActions } from "@/components/navigation/quick-actions";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-100">
        <Link href={`/`} className="text-lg md:text-xl  font-bold">
          Kinshi Navi
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/anonymous-user"
            className="hidden bg-gray-50 border border-gray-950 rounded-full w-8 h-8 items-center justify-center md:flex"
            aria-label="ユーザーページへ"
          >
            <AiOutlineUser />
          </Link>
          <MobileQuickMenu actions={quickActions} />
        </div>
      </header>
      <main className="px-4 md:px-16 lg:px-40 xl:px-60 flex-1 py-4 lg:py-8">
        {children}
      </main>
    </>
  );
}
