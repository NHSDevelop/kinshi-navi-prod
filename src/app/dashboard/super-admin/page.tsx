import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { Separator } from "@/components/ui/separator";
import OrganizationSelectLink from "@/features/organization/components/select-link";
import { getDbAsync } from "@/lib/db/drizzle";
import { AiFillPlusCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default async function SuperAdminHomePage() {
  const db = await getDbAsync();
  const organizationRows = await db.query.organizations.findMany();
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="font-bold text-xl">システムの管理</h1>
      <Separator />
      <div className="flex items-center justify-between">
        <h2 className="text-lg">組織の管理</h2>
        <Button asChild variant="card">
          <div className="flex gap-2">
            <AiFillPlusCircle />
            <Link href="/dashboard/super-admin/create-organization">
              組織を作成
            </Link>
          </div>
        </Button>
      </div>
      {organizationRows.length > 0 ? (
        <OrganizationSelectLink
          organizations={organizationRows}
          href="/dashboard/admin/organization"
          context="組織ページ"
        />
      ) : (
        <NotFoundPrompt context="組織" />
      )}
      <Separator />
      <p className="text-lg">組織内の管理者を招待</p>
      {organizationRows.length > 0 ? (
        <OrganizationSelectLink
          organizations={organizationRows}
          href="/dashboard/super-admin/issue-invite"
          context="組織管理者の招待リンクを作成"
        />
      ) : (
        <NotFoundPrompt context="組織" />
      )}
      <Separator />
      <Button variant="card" asChild>
        <Link href="/dashboard/super-admin/create-system-info">
          お知らせを作成
        </Link>
      </Button>
    </div>
  );
}
