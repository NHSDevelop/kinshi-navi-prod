/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getDb } from "@/lib/db/drizzle";
import { organizations } from "@/lib/db/schema";
import z from "zod";
import { eq } from "drizzle-orm";
import { slugSchema } from "@/lib/schemas/store";
import { error } from "node:console";

export type ZodErrors = {
  slug?: string[];
  name?: string[];
} | null;

export type OrganizationState = {
  slug?: string;
  name?: string;
  zodErrors?: ZodErrors;
  message?: string | null;
  success?: boolean;
};

export type UpdateOrganizationZodErrors = {
  name?: string[];
  description?: string[];
} | null;

export type UpdateOrganizationConfigState = {
  name?: string;
  description?: string;
  zodErrors?: UpdateOrganizationZodErrors;
  message?: string | null;
  error?: string | null;
  success?: boolean;
};

const createOrganizationSchema = z.object({
  slug: slugSchema,
  name: z
    .string()
    .min(1, "必須項目です")
    .max(20, "名前は20文字以内である必要があります"),
});

export async function createOrganization(
  prevState: unknown,
  formData: FormData,
): Promise<OrganizationState> {
  try {
    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;

    const validationResult = createOrganizationSchema.safeParse({
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
    const db = await getDb();
    const organizationRows = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, validatedSlug));
    if (organizationRows.length > 0) {
      return {
        zodErrors: null,
        message: "その識別名はすでに使用されています。",
        success: false,
      };
    }

    await db.insert(organizations).values({
      slug: validatedSlug,
      name: validatedName,
    });

    return {
      zodErrors: null,
      message: "組織を作成しました。",
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

const organizationConfigSchema = z.object({
  name: z.string().min(1, "必須項目です"),
  description: z.string().nullable(),
});

export async function updateOrganizationConfig(
  prevState: unknown,
  formData: FormData,
): Promise<UpdateOrganizationConfigState> {
  const validationResult = organizationConfigSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description")
      ? (formData.get("description") as string)
      : null,
  });
  if (!validationResult.success) {
    console.log(validationResult.error);
    return {
      name: (formData.get("name") as string) || "",
      description: (formData.get("description") as string) || "",
      zodErrors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: null,
      error: "入力形式が正しくありません",
    };
  }
  const { name, description } = validationResult.data;

  const organizationId = formData.get("organizationId") as string;
  const db = await getDb();
  try {
    await db
      .update(organizations)
      .set({
        name: name,
        description: description,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));
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
