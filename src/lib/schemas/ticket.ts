import z from "zod";

export const createTicketSchema = z.object({
  numberOfPeople: z.coerce.number().min(1, "人数は1以上である必要があります"),
});

export const callFirstTicketSchema = z.object({
  count: z.coerce.number().int().positive("枚数は1以上である必要があります"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CallFirstTicketInput = z.infer<typeof callFirstTicketSchema>;
