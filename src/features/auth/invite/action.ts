"use server";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/drizzle";
import {
  admins,
  invites,
  roleValues,
  inviteTargetRoleValues,
  staffs,
  stores,
  events,
} from "@/lib/db/schema";
import {
  buildInviteUrl,
  generateInviteToken,
  hashInviteToken,
} from "@/features/auth/invite/lib";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import { redirect } from "next/navigation";

const createInviteSchema = z.object({
  issuerScope: z.enum(roleValues, {
    error: "有効なユーザーロールを選択してください",
  }),
  targetScope: z.enum(inviteTargetRoleValues, {
    error: "有効なユーザーロールを選択してください",
  }),
  eventId: z.string().optional(),
  storeId: z.string().optional(),
  maxUses: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "1回以上である必要があります")
    .max(10, "10回以下である必要があります")
    .default(1),
});

export async function createInvite(prevState: unknown, formData: FormData) {
  try {
    const validationResult = createInviteSchema.safeParse({
      issuerScope: formData.get("issuerScope") as string,
      targetScope: formData.get("targetScope") as string,
      eventId: (formData.get("eventId") as string) || undefined,
      storeId: (formData.get("storeId") as string) || undefined,
      maxUses: formData.get("maxUses") as string,
    });

    if (validationResult.error) {
      console.log(validationResult.error);
      return {
        success: false,
        message: null,
        error: "入力形式が正しくありません。",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return {
        success: false,
        message: null,
        error: "サインインが必要です。",
      };
    }

    const db = await getDb();
    const issuerRows = await db
      .select({
        id: admins.id,
        role: admins.role,
        eventId: admins.eventId,
        storeId: admins.storeId,
      })
      .from(admins)
      .where(eq(admins.userId, session.user.id))
      .limit(1);

    if (issuerRows.length === 0) {
      return {
        success: false,
        message: null,
        error: "管理者権限が必要です。",
      };
    }

    // TODO 権限チェック
    const issuerAdmin = issuerRows[0];
    const { issuerScope, targetScope, eventId, storeId } =
      validationResult.data;

    const rawToken = generateInviteToken();
    const tokenHash = await hashInviteToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(invites).values({
      tokenHash,
      issuerAdminId: issuerAdmin.id,
      issuerScope,
      targetScope,
      eventId,
      storeId,
      expiresAt,
    });

    const path = "/accept-invite";

    const inviteUrl = buildInviteUrl(rawToken, path);

    return {
      success: true,
      message: "招待リンクを発行しました。",
      error: null,
      inviteUrl,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました。",
    };
  }
}

export async function acceptInvite(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/signin?token=${token}`);
  }
  try {
    const db = await getDb();

    const now = new Date();
    const inviteTokenHash = await hashInviteToken(token);
    const inviteRows = await db
      .select()
      .from(invites)
      .where(eq(invites.tokenHash, inviteTokenHash))
      .limit(1);

    const invite = inviteRows[0];
    if (!invite) {
      return {
        zodErrors: null,
        success: false,
        message: "招待リンクが無効です。",
      };
    }

    if (invite.revokedAt) {
      return {
        zodErrors: null,
        success: false,
        message: "この招待リンクは無効化されています。",
      };
    }

    if (invite.expiresAt.getTime() <= now.getTime()) {
      return {
        zodErrors: null,
        success: false,
        message: "招待リンクの有効期限が切れています。",
      };
    }

    if (invite.usedCount >= invite.maxUses) {
      return {
        zodErrors: null,
        success: false,
        message: "この招待リンクは既に使用済みです。",
      };
    }

    if (invite.targetScope === "STAFF") {
      if (!invite.storeId) {
        return {
          success: false,
          message: "招待リンクに店舗情報が紐づいていません",
        };
      }
      const storeRows = await db
        .select()
        .from(stores)
        .where(eq(stores.id, invite.storeId))
        .limit(1);
      if (storeRows.length === 0) {
        return {
          zodErrors: null,
          success: false,
          message: "招待リンクに紐づく店舗が見つかりません",
        };
      }
      const staffRows = await db
        .select()
        .from(staffs)
        .where(eq(staffs.userId, session.user.id));
      if (staffRows.length > 0) {
        return {
          success: false,
          message:
            "すでにスタッフとして登録されています。別の店舗のスタッフとして新たに登録することはできません。",
        };
      }
      await db.insert(staffs).values({
        userId: session.user.id,
        storeId: invite.storeId,
      });
      return { success: true };
    } else {
      const adminRows = await db
        .select()
        .from(admins)
        .where(eq(admins.userId, session.user.id))
        .limit(1);
      if (adminRows.length > 0) {
        return {
          success: false,
          message:
            "すでに管理者として登録されています。別の種類の管理者として新たに登録することはできません。",
        };
      }

      if (invite.targetScope === "EVENT_ADMIN") {
        if (!invite.eventId) {
          return {
            success: false,
            message: "招待リンクにイベント情報が紐づいていません",
          };
        }
        const eventsRows = await db
          .select()
          .from(events)
          .where(eq(events.id, invite.eventId))
          .limit(1);
        if (eventsRows.length === 0) {
          return {
            success: false,
            message: "招待リンクに紐づくイベントが見つかりません",
          };
        }
        await db.insert(admins).values({
          userId: session.user.id,
          role: "EVENT_ADMIN",
          eventId: invite.eventId,
        });
        return { success: true };
      } else if (invite.targetScope === "STORE_ADMIN") {
        if (!invite.storeId) {
          return {
            success: false,
            message: "招待リンクに店舗情報が紐づいていません",
          };
        }
        const storeRows = await db
          .select()
          .from(stores)
          .where(eq(stores.id, invite.storeId))
          .limit(1);
        if (storeRows.length === 0) {
          return {
            success: false,
            message: "招待リンクに紐づく店舗が見つかりません",
          };
        }
        await db.insert(admins).values({
          userId: session.user.id,
          role: "STORE_ADMIN",
          storeId: invite.storeId,
        });
        return { success: true };
      }
    }
    return {
      success: false,
      message: "招待リンクの役割が不正です。",
    };
  } catch (error) {
    console.error("[postSignIn] error:", error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}
