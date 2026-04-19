import z from "zod";
import { slugSchema } from "./store";

export const organizationCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "組織名は必須です").max(20, "組織名は20文字以内です"),
});

export const organizationUpdateConfigSchema = z.object({
  name: z.string().min(1, "組織名は必須です"),
  description: z.string().nullable(),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateConfigInput = z.infer<
  typeof organizationUpdateConfigSchema
>;
