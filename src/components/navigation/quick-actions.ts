import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Store,
  Ticket,
  UserRound,
  UtensilsCrossed,
  Vote,
  House,
} from "lucide-react";

export type QuickAction = {
  href: string;
  title: string;
  description: string;
  iconName:
    | "user"
    | "ticket"
    | "store"
    | "clock"
    | "utensils"
    | "vote"
    | "house";
};

export const quickActions: QuickAction[] = [
  {
    href: "/anonymous-user",
    title: "ユーザーページ",
    description: "取得したチケットや通知設定を確認",
    iconName: "user",
  },
  {
    href: "/issue-ticket",
    title: "チケットを発行",
    description: "受付用のチケットを発行",
    iconName: "ticket",
  },
  {
    href: "/store-list",
    title: "店舗一覧",
    description: "企画や模擬店をまとめて確認",
    iconName: "store",
  },
  {
    href: "/attraction/waiting-status",
    title: "企画の待機状況",
    description: "待ち時間や呼び出し状況を確認",
    iconName: "clock",
  },
  {
    href: "/food/stock-status",
    title: "模擬店の在庫状況",
    description: "在庫の残りを一覧でチェック",
    iconName: "utensils",
  },
  {
    href: "/vote/attraction",
    title: "企画の人気投票",
    description: "クラス企画の人気投票を行う",
    iconName: "vote",
  },
  {
    href: "/vote/food",
    title: "模擬店の人気投票",
    description: "模擬店の人気投票を行う",
    iconName: "vote",
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
};
