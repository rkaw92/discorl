import { TicketPoolConfig } from "./TicketPoolConfig";
import { TicketPoolConfigLoader } from "./interfaces/TicketPoolConfigLoader";

export class StaticConfigLoader implements TicketPoolConfigLoader {
    constructor(protected configs: TicketPoolConfig[]) {}

    async loadAll(): Promise<TicketPoolConfig[]> {
        return this.configs.slice();
    }
}
