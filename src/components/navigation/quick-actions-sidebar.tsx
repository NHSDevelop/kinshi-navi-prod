"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  quickActionIconMap,
  type QuickAction,
} from "@/components/navigation/quick-actions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface QuickActionsSidebarProps {
  actions: QuickAction[];
}

export function QuickActionsSidebar({ actions }: QuickActionsSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar
      side="left"
      collapsible="offcanvas"
      className="border-r border-main-200"
    >
      <SidebarHeader className="flex justify-center  border-b border-main-200 px-4 py-4 h-20">
        <Link href="/" className="text-base font-bold text-main-950">
          Menu
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-main-700">
            クイックアクセス
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {actions.map((action) => {
                const Icon = quickActionIconMap[action.iconName];
                const isActive =
                  pathname === action.href ||
                  pathname.startsWith(`${action.href}/`);

                return (
                  <SidebarMenuItem key={action.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-auto rounded-2xl border border-main-200 bg-main-50/70 p-3 text-main-950 hover:bg-main-100 data-[active=true]:border-main-300 data-[active=true]:bg-main-100"
                    >
                      <Link
                        href={action.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-main-100 text-main-900 ring-1 ring-main-200/80">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-main-950">
                            {action.title}
                          </span>
                          <span className="block text-xs text-main-700">
                            {action.description}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
