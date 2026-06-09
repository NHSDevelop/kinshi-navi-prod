"use server";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/drizzle";
import { admins, events, stores, staffs } from "@/lib/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import { getSessionFromRequestHeaders } from "@/lib/auth-session";
import { eq } from "drizzle-orm";

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() });
    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
}

const connectStoreOrEventSchema = z.object({
  authCode: z.string().min(1, "必須項目です"),
})

export async function connectStoreOrEvent(prevState:unknown, formData: FormData) {
  const validationResult = connectStoreOrEventSchema.safeParse({
    authCode: formData.get("authCode") as string
  })
  if(!validationResult.success) {
    return {
      success: false,
      message: "入力形式が間違っています"
    }
  }
  const {authCode} = validationResult.data;

  try {
    const session = await getSessionFromRequestHeaders();
    if(!session?.user) {
      return {
        success: false,
        message: "ログインしてください",
      }
    }
    const db = await getDb();
    if(authCode === getRuntimeEnv("SUPER_ADMIN_CODE")) {
      await db.insert(admins).values({
        userId: session.user.id,
        role: "SUPER_ADMIN",
      })
      return {
        success: true,
        message: "システム管理者として登録が完了しました"
      }
    } else {
      const eventRows = await db.select().from(events).where(eq(events.adminCode, authCode));
      if(eventRows[0]) {
        await db.insert(admins).values({
          userId: session.user.id,
          role: "EVENT_ADMIN",
          eventId: eventRows[0].id,
        })
        return {
          success: true,
          message: `${eventRows[0].name}のイベント管理者として登録が完了しました`,
        }
      } else {
        const adminStoreRows = await db.select().from(stores).where(eq(stores.adminCode, authCode));
        if(adminStoreRows[0]) {
          await db.insert(admins).values({
            userId: session.user.id,
            role: "STORE_ADMIN",
            storeId: adminStoreRows[0].id,
          })
          return {
            success: true,
            message: `${adminStoreRows[0].name}の店舗管理者として登録が完了しました`
          }
        } else {
          const staffStoreRows = await db.select().from(stores).where(eq(stores.staffCode, authCode));
          if(staffStoreRows[0]) {
            await db.insert(staffs).values({
              userId: session.user.id,
              storeId: staffStoreRows[0].id
            }) 
            return {
              success: true,
              message: `${staffStoreRows[0].name}のスタッフとして登録が完了しました`,
            }
          }
        }
      }
    }
    return {
      success: false,
      message: "認証コードが間違っているか、紐付け先のイベント・店舗が存在しません"
    }
  } catch(error) {
    console.log("ServerError:", error)
    return {
      success: false,
      message: "サーバーエラーが発生しました"
    }
  }
}