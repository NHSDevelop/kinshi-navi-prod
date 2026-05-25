import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getDb } from "@/lib/db/drizzle";
import { systemInfos } from "@/lib/db/schema";
import Link from "next/link";

export async function SystemInfoManageList() {
  const db = await getDb();
  const systemInfoRows = await db
    .select({
      id: systemInfos.id,
      createdAt: systemInfos.createdAt,
      title: systemInfos.title,
    })
    .from(systemInfos);

  return systemInfoRows.length > 0 ? (
    <Table>
      <TableBody>
        {systemInfoRows.map((systemInfo) => (
          <TableRow key={systemInfo.id}>
            <TableCell>{systemInfo.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>{systemInfo.title}</TableCell>
            <TableCell className="text-right">
              <div className="flex flex-wrap justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/dashboard/super-admin/edit-system-info/${systemInfo.id}`}
                  >
                    編集
                  </Link>
                </Button>
                <Button asChild size="sm" variant="danger">
                  <Link
                    href={`/dashboard/super-admin/delete-system-info/${systemInfo.id}`}
                  >
                    削除
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <NotFoundPrompt context="お知らせ" />
  );
}
