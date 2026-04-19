import z from "zod";

export const createStockLogSchema = z.object({
  itemId: z.string().min(1, "商品は必須です"),
  difference: z.coerce.number().int("数値を入力してください"),
  meta: z.string().optional(),
});

export const createItemSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  stock: z.coerce.number().min(0, "在庫は0以上である必要があります"),
  price: z.coerce.number().min(0, "価格は0以上である必要があります"),
});

export type CreateStockLogInput = z.infer<typeof createStockLogSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
