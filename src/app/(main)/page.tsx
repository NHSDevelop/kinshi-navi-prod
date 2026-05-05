import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  quickActionIconMap,
  quickActions,
} from "@/components/navigation/quick-actions";

export default async function EventTopPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 lg:gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-main-200/80 bg-linear-to-br from-main-100 via-main-50 to-white p-6 shadow-sm md:p-8 lg:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-main-300/70 to-transparent" />
        <div className="relative flex flex-col gap-5">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-main-950 md:text-3xl lg:text-4xl">
              Kinshi Navi
              <br />
              ー長野高校金鵄祭システムー
            </h1>
            <p className="text-sm leading-6 text-main-900/75 md:text-base">
              第78回金鵄祭へようこそ。
              <br />
              Kinshi
              Naviでは、整理券の取得、在庫やイベントの確認、人気投票などが行えます。
            </p>
          </div>
        </div>
      </section>

      <section className="hidden md:block">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = quickActionIconMap[action.iconName];

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex h-full min-h-36 flex-col justify-between rounded-[1.5rem] border border-main-200 bg-white/85 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-main-300 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-main-100 text-main-900 ring-1 ring-main-200/80">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-main-950 md:text-lg">
                        {action.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-main-400 transition-transform group-hover:translate-x-0.5 group-hover:text-main-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
