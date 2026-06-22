"use server";

import { canSuperAdmin, getAuthenticatedUser } from "@/lib/auth-guard";
import { getDb } from "@/lib/db/drizzle";
import { admins, Event, events, stores } from "@/lib/db/schema";
import z from "zod";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { revalidatePath } from "next/cache";

const MAIN_EVENT_CACHE_TAG = "main-event";

export type ZodErrors = {
  name?: string[];
  startedAtDate?: string[];
  startedAtTime?: string[];
  finishedAtDate?: string[];
  finishedAtTime?: string[];
  description?: string[];
} | null;

export type EventState = {
  name?: string;
  startedAtDate?: string;
  startedAtTime?: string;
  finishedAtDate?: string;
  finishedAtTime?: string;
  description?: string;
  zodErrors?: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export type UpdateEventConfigZodErrors = {
  name?: string[];
  startedAtDate?: string[];
  startedAtTime?: string[];
  finishedAtDate?: string[];
  finishedAtTime?: string[];
  description?: string[];
} | null;

export type UpdateEventConfigState = {
  name?: string;
  startedAtDate?: string;
  startedAtTime?: string;
  finishedAtDate?: string;
  finishedAtTime?: string;
  description?: string;
  zodErrors?: UpdateEventConfigZodErrors;
  message?: string | null;
  error?: string | null;
  success?: boolean;
};

const CreateEventSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  startedAtDate: z.date().nullable(),
  startedAtTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:mm形式で入力してください")
    .nullable(),
  finishedAtDate: z.date().nullable(),
  finishedAtTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:mm形式で入力してください")
    .nullable(),
  description: z.string().nullable(),
});

function revalidateEventCache(eventId: string) {
  revalidatePath(`/dashboard/admin/event/${eventId}`);
  revalidatePath("/");
  revalidatePath("/dashboard/super-admin");
}
export async function createEvent(
  prevState: unknown,
  formData: FormData,
): Promise<EventState> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        zodErrors: null,
        message: "ログインが必要です。",
        success: false,
      };
    }

    if (!(await canSuperAdmin(user.id))) {
      return {
        zodErrors: null,
        message: "権限がありません。",
        success: false,
      };
    }

    const validationResult = CreateEventSchema.safeParse({
      name: formData.get("name"),
      startedAtDate: formData.get("startedAtDate")
        ? new Date(formData.get("startedAtDate") as string)
        : null,
      startedAtTime: formData.get("startedAtTime")
        ? (formData.get("startedAtTime") as string)
        : null,
      finishedAtDate: formData.get("finishedAtDate")
        ? new Date(formData.get("finishedAtDate") as string)
        : null,
      finishedAtTime: formData.get("finishedAtTime")
        ? (formData.get("finishedAtTime") as string)
        : null,
      description: formData.get("description")
        ? (formData.get("description") as string)
        : null,
    });

    if (!validationResult.success) {
      return {
        name: (formData.get("name") as string) || "",
        startedAtDate: (formData.get("startedAtDate") as string) || "",
        startedAtTime: (formData.get("startedAtTime") as string) || "",
        finishedAtDate: (formData.get("finishedAtDate") as string) || "",
        finishedAtTime: (formData.get("finishedAtTime") as string) || "",
        description: (formData.get("description") as string) || "",
        zodErrors: validationResult.error.flatten().fieldErrors,
        message: "入力形式が正しくありません。",
        success: false,
      };
    }

    const {
      name: validatedName,
      startedAtDate,
      startedAtTime,
      finishedAtDate,
      finishedAtTime,
      description,
    } = validationResult.data;
    const db = await getDb();

    const createdEventRows = await db
      .insert(events)
      .values({
        name: validatedName,
        startedAtDate: startedAtDate,
        startedAtTime: startedAtTime,
        finishedAtDate: finishedAtDate,
        finishedAtTime: finishedAtTime,
        description: description,
      })
      .returning({ id: events.id });
    const createdEvent = createdEventRows[0];

    revalidateTag(MAIN_EVENT_CACHE_TAG, "max");

    if (createdEvent?.id) {
      revalidateEventCache(createdEvent.id);
    }

    return {
      zodErrors: null,
      message: "イベントを作成しました。",
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました。",
      success: false,
    };
  }
}

const eventConfigSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  startedAtDate: z.date().nullable(),
  startedAtTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:mm形式で入力してください")
    .nullable(),
  finishedAtDate: z.date().nullable(),
  finishedAtTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "HH:mm形式で入力してください")
    .nullable(),
  description: z.string().nullable(),
});

export async function updateEventConfig(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateEventConfigState> {
  const validationResult = eventConfigSchema.safeParse({
    name: formData.get("name"),
    startedAtDate: formData.get("startedAtDate")
      ? new Date(formData.get("startedAtDate") as string)
      : null,
    startedAtTime: formData.get("startedAtTime")
      ? (formData.get("startedAtTime") as string)
      : null,
    finishedAtDate: formData.get("finishedAtDate")
      ? new Date(formData.get("finishedAtDate") as string)
      : null,
    finishedAtTime: formData.get("finishedAtTime")
      ? (formData.get("finishedAtTime") as string)
      : null,
    description: formData.get("description")
      ? (formData.get("description") as string)
      : null,
  });
  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      startedAtDate: (formData.get("startedAtDate") as string) || "",
      startedAtTime: (formData.get("startedAtTime") as string) || "",
      finishedAtDate: (formData.get("finishedAtDate") as string) || "",
      finishedAtTime: (formData.get("finishedAtTime") as string) || "",
      description: (formData.get("description") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: null,
      error: "入力形式が正しくありません",
    };
  }
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      zodErrors: null,
      success: false,
      message: "ログインが必要です。",
      error: "権限がありません",
    };
  }
  const {
    name,
    startedAtDate,
    startedAtTime,
    finishedAtDate,
    finishedAtTime,
    description,
  } = validationResult.data;

  const eventId = formData.get("eventId") as string;
  if (!(await canSuperAdmin(user.id))) {
    return {
      zodErrors: null,
      success: false,
      message: "権限がありません。",
      error: "権限がありません",
    };
  }

  const db = await getDb();
  try {
    await db
      .update(events)
      .set({
        name: name,
        startedAtDate: startedAtDate,
        startedAtTime: startedAtTime,
        finishedAtDate: finishedAtDate,
        finishedAtTime: finishedAtTime,
        description: description,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

    revalidateTag(MAIN_EVENT_CACHE_TAG, "max");

    revalidateEventCache(eventId);

    return {
      zodErrors: null,
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      success: false,
      message: null,
      error: "サーバーエラーが発生しました",
    };
  }
}

export async function toActiveEvent(prevState: unknown, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "ログインが必要です。",
      };
    }

    if (!(await canSuperAdmin(user.id))) {
      return {
        success: false,
        message: "権限がありません。",
      };
    }

    const db = await getDb();
    const eventId = formData.get("eventId") as string;
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    const event = eventRows[0];
    if (!event) {
      return {
        success: false,
        message: "該当するイベントが存在しません",
      };
    }
    await db
      .update(events)
      .set({ isActive: !event.isActive })
      .where(eq(events.id, eventId));

    revalidateTag(MAIN_EVENT_CACHE_TAG, "max");
    revalidateEventCache(eventId);
    return {
      success: true,
      message: "操作が完了しました。",
      isActive: !event.isActive,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

export async function toMainEvent(prevState: unknown, formData: FormData) {
  try {
    const db = await getDb();
    const eventId = formData.get("eventId") as string;
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    const event = eventRows[0];
    if (!event) {
      return {
        success: false,
        message: "該当するイベントが存在しません",
      };
    }
    await db.update(events).set({ isMain: true }).where(eq(events.id, eventId));

    revalidateTag(MAIN_EVENT_CACHE_TAG, "max");
    revalidateEventCache(eventId);
    return {
      success: true,
      message: "操作が完了しました。",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

async function fetchMainEvent(): Promise<Event | null> {
  const db = await getDb();
  const eventRows = await db
    .select()
    .from(events)
    .where(eq(events.isMain, true))
    .limit(1);
  return eventRows[0] ?? null;
}

export const getMainEvent = unstable_cache(
  fetchMainEvent,
  [MAIN_EVENT_CACHE_TAG],
  {
    revalidate: 60,
    tags: [MAIN_EVENT_CACHE_TAG],
  },
);

export async function deleteEvent(prevState: unknown, formData: FormData) {
  try {
    const eventId = formData.get("eventId") as string;
    const db = await getDb();

    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    const event = eventRows[0];
    if (!event) {
      return {
        success: false,
        error: "該当するイベントが存在しません。",
      };
    }

    if (event.isMain) {
      return {
        success: false,
        error: "メインイベントは削除できません。",
      };
    }

    const storeRows = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.eventId, eventId))
      .limit(1);
    if (storeRows.length > 0) {
      return {
        success: false,
        error: "店舗が存在するためイベントを削除できません。",
      };
    }

    const adminRows = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.eventId, eventId))
      .limit(1);
    if (adminRows.length > 0) {
      return {
        success: false,
        error: "管理者が存在するためイベントを削除できません。",
      };
    }

    await db.delete(events).where(eq(events.id, eventId));

    revalidateTag(MAIN_EVENT_CACHE_TAG, "max");
    revalidateEventCache(eventId);
    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "サーバーエラーが発生しました",
    };
  }
}
