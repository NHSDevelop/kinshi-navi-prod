/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDb } from "@/lib/db/drizzle";
import { events } from "@/lib/db/schema";
import z from "zod";
import { eq } from "drizzle-orm";
import { slugSchema } from "@/lib/schemas/store";

export type ZodErrors = {
  slug?: string[];
  name?: string[];
} | null;

export type EventState = {
  slug?: string;
  name?: string;
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
  slug: slugSchema,
  name: z.string().min(1, "必須項目です"),
});

export async function createEvent(
  prevState: unknown,
  formData: FormData,
): Promise<EventState> {
  try {
    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;

    const validationResult = CreateEventSchema.safeParse({
      slug,
      name,
    });

    if (!validationResult.success) {
      return {
        slug,
        name,
        zodErrors: validationResult.error.flatten().fieldErrors,
        message: "入力形式が正しくありません。",
        success: false,
      };
    }

    const { slug: validatedSlug, name: validatedName } = validationResult.data;
    const organizationId = formData.get("organizationId") as string;
    const db = await getDb();
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.slug, validatedSlug));
    if (eventRows.length > 0) {
      return {
        zodErrors: null,
        message: "その識別名はすでに使用されています。",
        success: false,
      };
    }

    await db.insert(events).values({
      slug: validatedSlug,
      name: validatedName,
      organizationId: organizationId,
    });

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
  isActive: z.boolean(),
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
  const isActiveRaw = formData.get("isActive");
  const validationResult = eventConfigSchema.safeParse({
    name: formData.get("name"),
    isActive: isActiveRaw === "true" || isActiveRaw === "on",
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
    console.log(validationResult.error);
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
  const {
    name,
    isActive,
    startedAtDate,
    startedAtTime,
    finishedAtDate,
    finishedAtTime,
    description,
  } = validationResult.data;

  const eventId = formData.get("eventId") as string;
  const db = await getDb();
  try {
    await db
      .update(events)
      .set({
        name: name,
        isActive: isActive,
        startedAtDate: startedAtDate,
        startedAtTime: startedAtTime,
        finishedAtDate: finishedAtDate,
        finishedAtTime: finishedAtTime,
        description: description,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));

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

export async function getEventBySlug(eventSlug: string) {
  const db = await getDb();
  try {
    const eventRows = await db
      .select()
      .from(events)
      .where(eq(events.slug, eventSlug))
      .limit(1);
    return eventRows[0] ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getEventIdByEventSlug(
  eventSlug: string,
): Promise<string> {
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    throw new Error("イベントが見つかりません");
  }

  return event.id;
}
