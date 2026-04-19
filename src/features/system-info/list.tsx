import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDbAsync } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";

export async function SystemInfoList() {
  const db = await getDbAsync();
  const systemInfoRows = await db.select().from(systemInfos);
  return (
    <>
      {systemInfoRows.length > 0 ? (
        <Table>
          <TableBody>
            {systemInfoRows.map((systemInfo) => (
              <TableRow key={systemInfo.id}>
                <TableCell>
                  <Link href={`/system-info/${systemInfo.id}`}>
                    {systemInfo.createdAt.toLocaleDateString()}
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
