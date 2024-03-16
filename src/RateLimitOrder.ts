import { z } from "zod";

export const RateLimitOrderSchema = z.object({
    tickets: z.number(),
    periodMs: z.number(),
    refreshIn: z.number()
});

export type RateLimitOrder = z.infer<typeof RateLimitOrderSchema>;
