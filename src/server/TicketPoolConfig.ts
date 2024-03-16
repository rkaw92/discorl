import { z } from "zod";

export const TicketPoolConfigSchema = z.object({
    poolId: z.string(),
    tickets: z.number(),
    expectedClients: z.number().optional(),
    periodMs: z.number(),
    refreshCycle: z.number().optional(),
});

export type TicketPoolConfig = z.infer<typeof TicketPoolConfigSchema>;
