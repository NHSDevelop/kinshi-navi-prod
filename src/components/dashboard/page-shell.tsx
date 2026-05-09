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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10 lg:gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-main-200/80 bg-linear-to-br from-main-100 via-main-50 to-white p-6 shadow-sm md:p-8 lg:p-10">
        <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-main-200/25 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-main-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-main-300/70 to-transparent" />
        <div className="relative flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-main-700">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-main-950 md:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-main-900/75 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </section>
      {children}
    </div>
  );
}
