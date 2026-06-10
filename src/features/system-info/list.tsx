import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { formatYMD } from "@/lib/formatDate";
import { desc } from "drizzle-orm";

export async function SystemInfoList() {
  const db = await getDb();
  const systemInfoRows = await db
    .select({
      id: systemInfos.id,
      createdAt: systemInfos.createdAt,
      title: systemInfos.title,
    })
    .from(systemInfos)
    .orderBy(desc(systemInfos.createdAt));
    
  return (
    <>
      {systemInfoRows.length > 0 ? (
        <Table>
          <TableBody>
            {systemInfoRows.map((systemInfo) => (
              <TableRow key={systemInfo.id}>
                <TableCell>
                  <Link href={`/system-info/${systemInfo.id}`}>
                    {formatYMD(systemInfo.createdAt)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/system-info/${systemInfo.id}`}
                    className="underline"
                  >
                    {systemInfo.title}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <NotFoundPrompt context="お知らせ" />
      )}
    </>
  );
}
