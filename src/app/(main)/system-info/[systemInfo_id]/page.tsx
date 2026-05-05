import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 3600;

export default async function SystemInfoPage(props: {
  params: Promise<{ systemInfo_id: string }>;
}) {
  const { systemInfo_id } = await props.params;
  const db = await getDb();
  const systemInfoRows = await db
    .select({
      id: systemInfos.id,
      title: systemInfos.title,
      meta: systemInfos.meta,
      createdAt: systemInfos.createdAt,
    })
    .from(systemInfos)
    .where(eq(systemInfos.id, systemInfo_id))
    .limit(1);
  return (
    <div className="mx-auto w-full max-w-4xl">
      {systemInfoRows.length > 0 ? (
        <section className="rounded-[1.75rem] border border-main-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-main-900/70 uppercase">
                News
              </p>
              <h1 className="mt-2 text-xl font-bold text-main-950 md:text-2xl">
                {systemInfoRows[0].title}
              </h1>
            </div>
            <div className="rounded-full border border-main-200 bg-main-50 px-3 py-1 text-sm text-main-900">
              {systemInfoRows[0].createdAt.toLocaleDateString()}
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-main-100 bg-main-50/40 p-4 md:p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800 md:text-base">
              {systemInfoRows[0].meta}
            </p>
          </div>
        </section>
      ) : (
        <NotFoundPrompt context="該当するお知らせ" />
      )}
    </div>
  );
}
