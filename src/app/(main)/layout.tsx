import Link from "next/link";

import { QuickActionsSidebar } from "@/components/navigation/quick-actions-sidebar";
import { quickActions } from "@/components/navigation/quick-actions";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <QuickActionsSidebar actions={quickActions} />
      <SidebarInset>
        <header className="border-b-2 w-full flex h-16 items-center px-4 sm:px-6 lg:px-8  bg-main-100">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden size-9   hover:bg-main-50" />
            <Link href="/" className="text-lg md:text-xl font-bold">
              Kinshi Navi
            </Link>
          </div>
        </header>
        <main className="px-4 md:px-10 lg:px-16 xl:px-20 flex-1 py-4 lg:py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
