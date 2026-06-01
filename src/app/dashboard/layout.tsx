import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";
import { QuickActionsSidebar } from "@/components/navigation/quick-actions-sidebar";
import type { QuickAction } from "@/components/navigation/quick-actions";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード ",
};

const dashboardQuickActions: QuickAction[] = [
  {
    href: "/dashboard",
    title: "ダッシュボードトップ",
    description: "ダッシュボードトップに戻る",
    iconName: "dashboard",
  },
  {
    href: "/dashboard/user",
    title: "ユーザーページ",
    description: "アカウントと設定を確認",
    iconName: "user",
  },
  {
    href: "/",
    title: "トップページ",
    description: "トップページに戻る",
    iconName: "house",
  },
];

export default async function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <QuickActionsSidebar actions={dashboardQuickActions} />
      <SidebarInset>
        <header className="border-b-2 w-full flex h-20 items-center px-4 sm:px-6 lg:px-8 justify-between bg-main-100">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden size-9 hover:bg-main-50" />
            <Link href={"/dashboard"} className="text-lg md:text-xl font-bold">
              Dashboard | Kinshi Navi
            </Link>
          </div>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
