import z from "zod";
import { slugSchema } from "./store";

export const eventCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "イベント名は必須です"),
});

export const eventUpdateConfigSchema = z.object({
  name: z.string().min(1, "イベント名は必須です"),
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

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateConfigInput = z.infer<typeof eventUpdateConfigSchema>;
