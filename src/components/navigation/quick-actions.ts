import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Store,
  Ticket,
  UserRound,
  UtensilsCrossed,
  Vote,
  House,
  Info,
  Medal,
  LayoutDashboard,
} from "lucide-react";

export type QuickAction = {
  href: string;
  title: string;
  iconName:
    | "user"
    | "ticket"
    | "store"
    | "clock"
    | "utensils"
    | "vote"
    | "info"
    | "house"
    | "medal"
    | "dashboard";
};

export const quickActions: QuickAction[] = [
  {
    href: "/anonymous-user",
    title: "ゲストユーザーページ",
    iconName: "user",
  },
  {
    href: "/issue-ticket",
    title: "整理券を発行",
    iconName: "ticket",
  },
  {
    href: "/store-list",
    title: "店舗一覧",
    iconName: "store",
  },
  {
    href: "/attraction/waiting-status",
    title: "企画の待機状況",
    iconName: "clock",
  },
  {
    href: "/food/stock-status",
    title: "模擬店の在庫状況",
    iconName: "utensils",
  },
  {
    href: "/vote/attraction",
    title: "企画の人気投票",
    iconName: "vote",
  },
  {
    href: "/vote/food",
    title: "模擬店の人気投票",
    iconName: "vote",
  },
  {
    href: "/vote/event",
    title: "イベントの人気投票",
    iconName: "vote",
  },
  {
    href: "/vote/result",
    title: "人気投票の結果",
    iconName: "medal",
  },
  {
    href: "/pdf-documents",
    title: "その他の情報",
    iconName: "info",
  },
];

export const quickActionIconMap: Record<QuickAction["iconName"], LucideIcon> = {
  user: UserRound,
  ticket: Ticket,
  store: Store,
  clock: Clock3,
  utensils: UtensilsCrossed,
  vote: Vote,
  house: House,
  info: Info,
  medal: Medal,
  dashboard: LayoutDashboard,
};
