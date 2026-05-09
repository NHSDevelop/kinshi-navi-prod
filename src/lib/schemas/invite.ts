import z from "zod";
import { roleValues, inviteTargetRoleValues } from "@/lib/db/schema";

export const createInviteSchema = z.object({
  issuerScope: z.enum(roleValues),
  targetScope: z.enum(inviteTargetRoleValues),
  eventId: z.string().optional(),
  storeId: z.string().optional(),
  expiresInHours: z.coerce
    .number()
    .int()
    .min(1, "有効期限は1時間以上である必要があります")
    .max(168, "有効期限は168時間以内である必要があります")
    .default(72),
  maxUses: z.coerce
    .number()
    .int()
    .min(1, "最大使用数は1以上である必要があります")
    .max(10, "最大使用数は10以下である必要があります")
    .default(1),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
