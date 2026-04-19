"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/drizzle";

import {
  admins,
  staffs,
  invites,
  stores,
  events,
  organizations,
} from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { hashInviteToken } from "./invite/lib";

//TODO パスワード変更とユーザー情報の編集を実装する

export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() });
    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
}
