import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Separator } from "@/components/ui/separator";
import { getDbAsync } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function SystemInfoPage(props: {
  params: Promise<{ systemInfo_id: string }>;
}) {
  const { systemInfo_id } = await props.params;
  const db = await getDbAsync();
  const systemInfoRows = await db
    .select()
    .from(systemInfos)
    .where(eq(systemInfos.id, systemInfo_id))
    .limit(1);
  return (
    <div>
      {systemInfoRows.length > 0 ? (
        <>
          <div className="flex gap-4 justify-between items-baseline mb-4">
            <h1 className="font-bold text-xl">
              {systemInfoRows[0].title} | お知らせ
            </h1>
            <div className="flex items-center gap-3">
              <p>{systemInfoRows[0].createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-4 lg:space-y-8 mt-4 mb:mt-8">
            <p>{systemInfoRows[0].meta}</p>
          </div>
        </>
      ) : (
        <NotFoundPrompt context="該当するお知らせ" />
      )}
    </div>
  );
}
