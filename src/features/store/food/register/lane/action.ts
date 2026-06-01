"use server";

import { getDb } from "@/lib/db/drizzle";
import { registerLanes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import z from "zod";
import { revalidatePath } from "next/cache";

function invalidateRegisterLanePages(eventId: string) {
  revalidatePath(`/dashboard/admin/event/${eventId}`);
}

const createRegisterLaneSchema = z.object({
  eventId: z.string().min(1, "必須項目です"),
  laneCount: z.coerce
    .number()
    .int("整数である必要があります")
    .min(1, "1以上を入力してください")
    .max(50, "一度に作成できるのは50レーンまでです"),
});

export type CreateRegisterLaneZodErrors = {
  eventId?: string[];
  laneCount?: string[];
} | null;

export type CreateRegisterLaneState = {
  eventId: string;
  laneCount: string;
  zodErrors: CreateRegisterLaneZodErrors;
  message: string | null;
  success: boolean;
};

export type RegisterLaneOperationState = {
  message: string | null;
  success: boolean;
};

export async function createRegisterLane(
  prevState: CreateRegisterLaneState,
  formData: FormData,
): Promise<CreateRegisterLaneState> {
  const validationResult = createRegisterLaneSchema.safeParse({
    eventId: formData.get("eventId"),
    laneCount: formData.get("laneCount"),
  });

  if (!validationResult.success) {
    return {
      eventId: (formData.get("eventId") as string) || prevState.eventId,
      laneCount: (formData.get("laneCount") as string) || prevState.laneCount,
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { eventId, laneCount } = validationResult.data;

  try {
    const db = await getDb();

    const maxLaneRows = await db
      .select({
        maxLaneNumber: sql<number>`coalesce(max(${registerLanes.laneNumber}), 0)`,
      })
      .from(registerLanes)
      .where(eq(registerLanes.eventId, eventId));

    const currentMax = maxLaneRows[0]?.maxLaneNumber ?? 0;

    const values = Array.from({ length: laneCount }, (_, index) => ({
      eventId,
      foodId: null,
      laneNumber: currentMax + index + 1,
      name: null,
    }));

    await db.insert(registerLanes).values(values);

    invalidateRegisterLanePages(eventId);

    return {
      eventId,
      laneCount: "",
      zodErrors: null,
      message: `${laneCount}件のレジレーンを作成しました。`,
      success: true,
    };
  } catch (error) {
    console.error(error);

    const errorMessage = "サーバーエラーが発生しました";

    return {
      eventId: (formData.get("eventId") as string) || prevState.eventId,
      laneCount: (formData.get("laneCount") as string) || prevState.laneCount,
      zodErrors: null,
      message: errorMessage,
      success: false,
    };
  }
}

export async function toggleRegisterLaneActive(
  prevState: RegisterLaneOperationState | null,
  formData: FormData,
): Promise<RegisterLaneOperationState> {
  const laneId = formData.get("laneId") as string;

  if (!laneId) {
    return {
      message: "レーンIDが不正です",
      success: false,
    };
  }

  try {
    const db = await getDb();
    const laneRows = await db
      .select()
      .from(registerLanes)
      .where(eq(registerLanes.id, laneId))
      .limit(1);
    const lane = laneRows[0];

    if (!lane) {
      return {
        message: "該当するレーンが存在しません",
        success: false,
      };
    }

    await db
      .update(registerLanes)
      .set({ isActive: !lane.isActive })
      .where(eq(registerLanes.id, laneId));

    invalidateRegisterLanePages(lane.eventId);

    return {
      message: "レーン状態を更新しました。",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}

export async function deleteRegisterLane(
  prevState: RegisterLaneOperationState | null,
  formData: FormData,
): Promise<RegisterLaneOperationState> {
  const laneId = formData.get("laneId") as string;

  if (!laneId) {
    return {
      message: "レーンIDが不正です",
      success: false,
    };
  }

  try {
    const db = await getDb();
    const laneRows = await db
      .select({ id: registerLanes.id, eventId: registerLanes.eventId })
      .from(registerLanes)
      .where(eq(registerLanes.id, laneId))
      .limit(1);

    if (!laneRows[0]) {
      return {
        message: "該当するレーンが存在しません",
        success: false,
      };
    }

    await db.delete(registerLanes).where(eq(registerLanes.id, laneId));

    invalidateRegisterLanePages(laneRows[0].eventId);

    return {
      message: "レーンを削除しました。",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "このレーンは使用中のため削除できません",
      success: false,
    };
  }
}
