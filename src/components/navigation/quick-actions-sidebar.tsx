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
      className="border-r border-main-200 bg-main-50/20"
    >
      <SidebarHeader className="flex h-16 justify-center border-b border-main-200 px-4 py-4">
        Menu
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1.5">
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
                      className="h-auto rounded-xl border border-transparent bg-transparent p-2.5 text-main-800 transition-all hover:bg-main-100 hover:text-main-950 data-[active=true]:border-main-200 data-[active=true]:bg-main-100 data-[active=true]:text-main-950 data-[active=true]:font-medium"
                    >
                      <Link
                        href={action.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-main-100 text-main-800 transition-colors group-hover:bg-main-200 data-[active=true]:bg-main-400 data-[active=true]:text-main-950">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {action.title}
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
