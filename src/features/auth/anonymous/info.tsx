import { NotFoundPrompt } from "@/components/prompt/not-found-prompt";
import { getDb } from "@/lib/db/drizzle";
import { admins, events, staffs, stores, users } from "@/lib/db/schema";
import { ADMIN_ROLE_MAP } from "@/lib/type";
import { eq } from "drizzle-orm";
import UnlinkBindingButton from "@/features/auth/unlink-binding";

interface UserInfoProps {
  userId: string;
}

export default async function UserInfo({ userId }: UserInfoProps) {
  const db = await getDb();

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];

  if (!user) {
    return <NotFoundPrompt context="ユーザー" />;
  }

  const [adminRows, staffRows] = await Promise.all([
    db
      .select({
        id: admins.id,
        role: admins.role,
        eventName: events.name,
        storeName: stores.name,
      })
      .from(admins)
      .leftJoin(events, eq(events.id, admins.eventId))
      .leftJoin(stores, eq(stores.id, admins.storeId))
      .where(eq(admins.userId, userId)),
    db
      .select({
        id: staffs.id,
        storeName: stores.name,
        eventName: events.name,
      })
      .from(staffs)
      .innerJoin(stores, eq(stores.id, staffs.storeId))
      .innerJoin(events, eq(events.id, stores.eventId))
      .where(eq(staffs.userId, userId)),
  ]);

  const bindings = [
    ...adminRows.map((admin) => ({
      id: admin.id,
      kind: admin.role,
      label:
        ADMIN_ROLE_MAP[admin.role as keyof typeof ADMIN_ROLE_MAP]?.label ??
        admin.role,
      eventName: admin.eventName ?? null,
      storeName: admin.storeName ?? null,
      canUnlink: admin.role !== "SUPER_ADMIN",
    })),
    ...staffRows.map((staff) => ({
      id: staff.id,
      kind: "STAFF" as const,
      label: "店舗スタッフ",
      eventName: staff.eventName ?? null,
      storeName: staff.storeName ?? null,
      canUnlink: true,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-main-950 md:text-xl">
        ユーザー情報
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <p>ユーザー名：{user.name}</p>
          <p>メールアドレス：{user.email}</p>
          {user.isAnonymous && <p>ユーザーの種類：匿名ユーザー</p>}
        </div>
        <div className="space-y-3">
          <p className="font-medium text-main-950">権限区分と紐づけ</p>
          {bindings.length > 0 ? (
            <div className="grid gap-3">
              {bindings.map((binding) => (
                <div
                  key={binding.id}
                  className="rounded-xl border border-main-200/80 bg-main-50/70 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold text-main-950">
                        {binding.label}
                      </p>
                      {binding.eventName ? (
                        <p className="text-sm text-main-900/80">
                          イベント：{binding.eventName}
                        </p>
                      ) : null}
                      {binding.storeName ? (
                        <p className="text-sm text-main-900/80">
                          店舗：{binding.storeName}
                        </p>
                      ) : null}
                    </div>
                    {binding.canUnlink ? (
                      (() => {
                        const unlinkableKind =
                          binding.kind === "EVENT_ADMIN" ||
                          binding.kind === "STORE_ADMIN" ||
                          binding.kind === "STAFF"
                            ? binding.kind
                            : null;

                        if (!unlinkableKind) {
                          return null;
                        }

                        return (
                          <UnlinkBindingButton
                            bindingType={unlinkableKind}
                            targetLabel={
                              binding.storeName ?? binding.eventName ?? "対象"
                            }
                          />
                        );
                      })()
                    ) : (
                      <p className="text-sm text-main-900/60">
                        この権限は解除できません。
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              現在、イベント・店舗への紐づけはありません。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
