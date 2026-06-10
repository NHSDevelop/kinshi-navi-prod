import type { ReactNode } from "react";

interface DashboardPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DashboardPageShell({
  title,
  description,
  children,
}: DashboardPageShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
      <section className="relative overflow-hidden rounded-2xl border border-main-200 bg-linear-to-br from-main-100/40 via-main-50/30 to-white p-5 shadow-xs md:p-6">
        <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-main-200/20 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-titan-white-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-main-300/40 to-transparent" />
        <div className="relative flex flex-col gap-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-titan-white-950">
            Dashboard
          </p>
          <h1 className="text-xl font-bold tracking-tight text-titan-white-950 md:text-2xl lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-xs leading-relaxed text-titan-white-900/80">
              {description}
            </p>
          ) : null}
        </div>
      </section>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}