import z from "zod";

export const attractionUpdateConfigSchema = z.object({
  playTime: z.coerce.number().min(0, "所要時間は0以上である必要があります"),
  peopleCapacity: z.coerce
    .number()
    .min(1, "収容人数は1以上である必要があります"),
});

export type AttractionUpdateConfigInput = z.infer<
  typeof attractionUpdateConfigSchema
>;
