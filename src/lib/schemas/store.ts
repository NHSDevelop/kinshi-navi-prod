import z from "zod";

export const slugSchema = z
  .string()
  .min(8, "識別名は8文字以上です")
  .max(16, "識別名は16文字以内です")
  .regex(/^[a-z0-9-]+$/, "識別名は小文字の英数字とハイフンのみ使用できます");

export const storeCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "店舗名は必須です"),
  storeType: z.string().min(1, "店舗の種類は必須です"),
});

export const storeUpdateConfigSchema = z.object({
  name: z.string().min(1, "店舗名は必須です"),
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
});

export type StoreCreateInput = z.infer<typeof storeCreateSchema>;
export type StoreUpdateConfigInput = z.infer<typeof storeUpdateConfigSchema>;
