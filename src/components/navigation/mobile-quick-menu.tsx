"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  quickActionIconMap,
  type QuickAction,
} from "@/components/navigation/quick-actions";

interface MobileQuickMenuProps {
  actions: QuickAction[];
}

export function MobileQuickMenu({ actions }: MobileQuickMenuProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="md:hidden"
          variant="default"
          size="icon"
          aria-label="メニューを開く"
        >
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-0 right-0 left-auto h-dvh w-[min(22rem,calc(100vw-1rem))] translate-x-0 translate-y-0 rounded-l-[1.75rem] rounded-r-none border-main-200 bg-white p-0 shadow-2xl sm:max-w-none md:hidden flex flex-col">
        <DialogHeader className="text-left  px-5 py-4 shrink-0">
          <DialogTitle className="text-lg font-bold text-main-950">
            メニュー
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 overflow-y-auto px-5 py-3 pr-1 flex-1">
          {actions.map((action) => {
            const Icon = quickActionIconMap[action.iconName];

            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-2xl border border-main-200 bg-main-50/70 p-3 transition hover:bg-main-100"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-main-100 text-main-900 ring-1 ring-main-200/80">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-main-950">
                    {action.title}
                  </span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
