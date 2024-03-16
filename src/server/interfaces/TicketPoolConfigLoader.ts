import { TicketPoolConfig } from "../TicketPoolConfig";

export interface TicketPoolConfigLoader {
    loadAll(): Promise<TicketPoolConfig[]>;
}
