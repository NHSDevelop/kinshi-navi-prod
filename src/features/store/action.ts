"use server";

import { getDb } from "@/lib/db/drizzle";
import {
  attractions,
  foods,
  Store,
  items,
  registerLogs,
  stores,
  stockLogs,
  tickets,
  type StoreType,
} from "@/lib/db/schema";
import { FormState } from "@/lib/type";
import { eq } from "drizzle-orm";
import z from "zod";
import { slugSchema } from "@/lib/schemas/store";
import { getMainEvent } from "../event/action";

export type ZodErrors = {
  slug?: string[];
  name?: string[];
} | null;

export type StoreState = {
  slug?: string;
  name?: string;
  storeType?: string;
  zodErrors: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export type UpdateStoreConfigZodErrors = {
  name?: string[];
  startedAtDate?: string[];
  startedAtTime?: string[];
  finishedAtDate?: string[];
  finishedAtTime?: string[];
  description?: string[];
} | null;

export type UpdateStoreConfigState = {
  name?: string;
  startedAtDate?: string;
  startedAtTime?: string;
  finishedAtDate?: string;
  finishedAtTime?: string;
  description?: string;
  zodErrors?: UpdateStoreConfigZodErrors;
  message?: string | null;
  error?: string | null;
  success?: boolean;
};

const RegisterSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "必須項目です"),
});

export async function createStore(
  prevState: unknown,
  formData: FormData,
): Promise<StoreState> {
  const validationResult = RegisterSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
  });

  if (!validationResult.success) {
    return {
      slug: (formData.get("slug") as string) || "",
      name: (formData.get("name") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      message: "入力形式が正しくありません",
      success: false,
    };
  }

  const { slug, name } = validationResult.data;
  const storeType = formData.get("storeType") as StoreType;
  const eventId = formData.get("eventId") as string;
  const db = await getDb();

  const storeRows = await db.select().from(stores).where(eq(stores.slug, slug));
  if (storeRows.length > 0) {
    return {
      zodErrors: null,
      message: "その識別名はすでに使用されています。",
      success: false,
    };
  }

  try {
    const createdStoreRows = await db
      .insert(stores)
      .values({
        slug: slug,
        name: name,
        storeType: storeType,
        eventId: eventId,
      })
      .returning({ id: stores.id, storeType: stores.storeType });

    const createdStore = createdStoreRows[0];
    if (!createdStore) {
      throw new Error("店舗の作成に失敗しました");
    }

    switch (createdStore.storeType) {
      case "ATTRACTION":
        await db.insert(attractions).values({
          storeId: createdStore.id,
        });
        break;
      case "FOOD":
        await db.insert(foods).values({
          storeId: createdStore.id,
        });
        break;
    }

    return {
      zodErrors: null,
      message: "操作が完了しました。",
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      zodErrors: null,
      message: "サーバーエラーが発生しました",
      success: false,
    };
  }
}

const storeConfigSchema = z.object({
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

export async function updateStoreConfig(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateStoreConfigState> {
  const isActiveRaw = formData.get("isActive");
  const validationResult = storeConfigSchema.safeParse({
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

  const storeId = formData.get("storeId") as string;
  const db = await getDb();
  try {
    await db
      .update(stores)
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
      .where(eq(stores.id, storeId));
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

export async function getStoresByFormByEventSlug(
  _prevState: FormState<Store[]>,
  formData: FormData,
): Promise<FormState<Store[]>> {
  const storeType = formData.get("storeType") as StoreType | "all";

  try {
    const event = await getMainEvent();
    if (!event) {
      return {
        success: false,
        message: null,
        error: "サーバーエラーが発生しました",
      };
    }
    const db = await getDb();

    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.eventId, event.id));
    const filteredStoreRows =
      !storeType || storeType === "all"
        ? storeRows
        : storeRows.filter((store) => store.storeType === storeType);
    storeRows.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return {
      success: true,
      message: null,
      error: null,
      data: filteredStoreRows,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: null,
      error: "サーバーエラーが発生しました",
    };
  }
}

export async function getStoreIdByStoreSlug(
  storeSlug: string,
): Promise<string | null> {
  try {
    const db = await getDb();
    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, storeSlug))
      .limit(1);
    const store = storeRows[0];
    return store ? store.id : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function deleteStore(prevState: unknown, formData: FormData) {
  const storeId = formData.get("storeId") as string;
  try {
    const db = await getDb();

    const attractionRows = await db
      .select({ id: attractions.id })
      .from(attractions)
      .where(eq(attractions.storeId, storeId))
      .limit(1);
    if (attractionRows.length > 0) {
      const ticketRows = await db
        .select({ id: tickets.id })
        .from(tickets)
        .innerJoin(attractions, eq(tickets.attractionId, attractions.id))
        .where(eq(attractions.storeId, storeId))
        .limit(1);
      if (ticketRows.length > 0) {
        return {
          success: false,
          error: "チケットが存在するため店舗を削除できません。",
        };
      }
    }

    const foodRows = await db
      .select({ id: foods.id })
      .from(foods)
      .where(eq(foods.storeId, storeId))
      .limit(1);
    if (foodRows.length > 0) {
      const itemRows = await db
        .select({ id: items.id })
        .from(items)
        .innerJoin(foods, eq(items.foodId, foods.id))
        .where(eq(foods.storeId, storeId))
        .limit(1);
      if (itemRows.length > 0) {
        const stockLogRows = await db
          .select({ id: stockLogs.id })
          .from(stockLogs)
          .innerJoin(items, eq(stockLogs.itemId, items.id))
          .innerJoin(foods, eq(items.foodId, foods.id))
          .where(eq(foods.storeId, storeId))
          .limit(1);
        if (stockLogRows.length > 0) {
          return {
            success: false,
            error: "在庫ログが存在するため店舗を削除できません。",
          };
        }
      }

      const registerLogRows = await db
        .select({ id: registerLogs.id })
        .from(registerLogs)
        .innerJoin(foods, eq(registerLogs.foodId, foods.id))
        .where(eq(foods.storeId, storeId))
        .limit(1);
      if (registerLogRows.length > 0) {
        return {
          success: false,
          error: "会計ログが存在するため店舗を削除できません。",
        };
      }
    }

    await db.delete(stores).where(eq(stores.id, storeId));
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

export async function toActiveStore(prevState: unknown, formData: FormData) {
  try {
    const db = await getDb();
    const storeId = formData.get("storeId") as string;
    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);
    const store = storeRows[0];
    if (!store) {
      return {
        success: false,
        message: "該当するイベントが存在しません",
      };
    }
    await db.update(stores).set({ isActive: !store.isActive });
    return {
      success: true,
      message: "操作が完了しました。",
      isActive: !store.isActive,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}
