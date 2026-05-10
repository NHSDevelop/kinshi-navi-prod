"use server";

import {
  canManageEvent,
  canManageStore,
  getAuthenticatedUser,
} from "@/lib/auth-guard";
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
import { eq, and } from "drizzle-orm";
import z from "zod";
import { slugSchema } from "@/lib/schemas/store";
import { unstable_cache, revalidatePath } from "next/cache";

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

// ISR 対象ページを無効化する関数
function invalidateStorePages(storeId?: string, storeSlug?: string) {
  if (storeId) {
    revalidatePath(`/dashboard/staff/store/${storeId}`);
    revalidatePath(`/dashboard/admin/store/${storeId}`);
    revalidatePath(`/dashboard/staff/store/${storeId}/item-list`);
    revalidatePath(`/dashboard/staff/store/${storeId}/call-ticket`);
    revalidatePath(`/dashboard/admin/store/${storeId}/create-item`);
    revalidatePath(`/dashboard/admin/store/${storeId}/edit-config/store`);
  }
  if (storeSlug) {
    revalidatePath(`/store/${storeSlug}`);
  }
  revalidatePath("/attraction/waiting-status");
  revalidatePath("/food/stock-status");
}

export type UpdateStoreConfigZodErrors = {
  name?: string[];
  imageUrl?: string[];
  startedAtDate?: string[];
  startedAtTime?: string[];
  finishedAtDate?: string[];
  finishedAtTime?: string[];
  description?: string[];
  canVoted?: string[];
} | null;

export type UpdateStoreConfigState = {
  name?: string;
  imageUrl?: string;
  startedAtDate?: string;
  startedAtTime?: string;
  finishedAtDate?: string;
  finishedAtTime?: string;
  description?: string;
  canVoted?: boolean;
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
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      zodErrors: null,
      message: "ログインが必要です",
      success: false,
    };
  }

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
  if (!(await canManageEvent(user.id, eventId))) {
    return {
      zodErrors: null,
      message: "権限がありません。",
      success: false,
    };
  }

  const db = await getDb();

  const storeRows = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.slug, slug));
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
      .returning({
        id: stores.id,
        storeType: stores.storeType,
        slug: stores.slug,
      });

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

    invalidateStorePages(createdStore.id, createdStore.slug);
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
  imageUrl: z.string().url("画像URLの形式が正しくありません").nullable(),
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
  canVoted: z
    .enum(["true", "false"])
    .transform((val: "true" | "false") => val === "true"),
});

export async function updateStoreConfig(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateStoreConfigState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      zodErrors: null,
      success: false,
      message: null,
      error: "ログインが必要です",
    };
  }

  const isActiveRaw = formData.get("isActive");
  const validationResult = storeConfigSchema.safeParse({
    name: formData.get("name"),
    imageUrl: formData.get("imageUrl")
      ? (formData.get("imageUrl") as string)
      : null,
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
    canVoted: formData.get("canVoted") as string,
  });
  if (!validationResult.success) {
    return {
      name: (formData.get("name") as string) || "",
      imageUrl: (formData.get("imageUrl") as string) || "",
      startedAtDate: (formData.get("startedAtDate") as string) || "",
      startedAtTime: (formData.get("startedAtTime") as string) || "",
      finishedAtDate: (formData.get("finishedAtDate") as string) || "",
      finishedAtTime: (formData.get("finishedAtTime") as string) || "",
      description: (formData.get("description") as string) || "",
      canVoted: (formData.get("canVoted") as string) === "true",
      zodErrors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: null,
      error: "入力形式が正しくありません",
    };
  }
  const {
    name,
    imageUrl,
    isActive,
    startedAtDate,
    startedAtTime,
    finishedAtDate,
    finishedAtTime,
    description,
    canVoted,
  } = validationResult.data;

  const storeId = formData.get("storeId") as string;
  if (!(await canManageStore(user.id, storeId))) {
    return {
      zodErrors: null,
      success: false,
      message: null,
      error: "権限がありません",
    };
  }

  const db = await getDb();
  try {
    await db
      .update(stores)
      .set({
        name: name,
        imageUrl: imageUrl,
        isActive: isActive,
        startedAtDate: startedAtDate,
        startedAtTime: startedAtTime,
        finishedAtDate: finishedAtDate,
        finishedAtTime: finishedAtTime,
        description: description,
        canVoted: canVoted,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));
    invalidateStorePages(storeId);
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

// キャッシュ対象のコア処理
const getCachedStoresInMainEvent = unstable_cache(
  async (eventId: string, storeType: StoreType | "all" | null) => {
    const db = await getDb();

    // DB WHERE で storeType フィルタリング
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: Array<any> = [eq(stores.eventId, eventId)];
    if (storeType && storeType !== "all") {
      whereConditions.push(eq(stores.storeType, storeType));
    }

    const storeRows = await db
      .select()
      .from(stores)
      .where(and(...whereConditions));
    storeRows.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return storeRows;
  },
  ["stores-in-main-event"],
  {
    revalidate: 60,
    tags: ["stores-in-main-event"],
  },
);

export async function getStoresInMainEvent(
  _prevState: FormState<Store[]>,
  formData: FormData,
): Promise<FormState<Store[]>> {
  const storeType = formData.get("storeType") as StoreType | "all";

  try {
    const mainEventId = process.env.MAIN_EVENT_ID as string;

    // キャッシュ版を呼び出し
    const storeRows = await getCachedStoresInMainEvent(
      mainEventId,
      storeType || "all",
    );
    return {
      success: true,
      message: null,
      error: null,
      data: storeRows,
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
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      error: "ログインが必要です",
    };
  }

  const storeId = formData.get("storeId") as string;
  if (!(await canManageStore(user.id, storeId))) {
    return {
      success: false,
      error: "権限がありません。",
    };
  }

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
    invalidateStorePages();
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
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "ログインが必要です",
      };
    }

    const db = await getDb();
    const storeId = formData.get("storeId") as string;
    if (!(await canManageStore(user.id, storeId))) {
      return {
        success: false,
        message: "権限がありません。",
      };
    }

    const storeRows = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);
    const store = storeRows[0];
    if (!store) {
      return {
        success: false,
        message: "該当する店舗が存在しません",
      };
    }
    await db
      .update(stores)
      .set({ isActive: !store.isActive })
      .where(eq(stores.id, storeId));
    invalidateStorePages(storeId, store.slug);
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
