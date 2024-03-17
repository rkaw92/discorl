import { Interval, IntervalProvider, systemTime } from "../time";
import { TicketPool } from "./TicketPool";
import { TimedTicketPool } from "./TimedTicketPool";
import { TicketPoolConfigLoader } from "./interfaces/TicketPoolConfigLoader";
import { RateLimitOrder } from "../RateLimitOrder";

export class RateLimitManager {
    protected configReloadIntervalMs = 30000;
    protected defaultExpectedClients = 100;
    protected pools = new Map<string, TimedTicketPool>();
    protected reloadTimer: Interval | null = null;

    constructor(
        protected loader: TicketPoolConfigLoader,
        protected intervalProvider: IntervalProvider = systemTime,
    ) {}

    async init(): Promise<void> {
        return this.reload();
    }

    async reload(): Promise<void> {
        const newConfigs = await this.loader.loadAll();
        const notInNewConfigs = new Set(this.pools.keys());
        for (const newConfig of newConfigs) {
            const existingPool = this.pools.get(newConfig.poolId);
            if (existingPool) {
                notInNewConfigs.delete(newConfig.poolId);
                existingPool.update(newConfig.tickets, newConfig.periodMs, newConfig.refreshCycle);
            } else {
                const newPool = new TimedTicketPool(
                    new TicketPool(newConfig.tickets, newConfig.expectedClients ?? this.defaultExpectedClients),
                    newConfig.periodMs,
                    newConfig.refreshCycle,
                    this.intervalProvider
                );
                newPool.start();
                this.pools.set(newConfig.poolId, newPool);
            }
        }
        for (const deletedPoolId in notInNewConfigs) {
            const deletedPool = this.pools.get(deletedPoolId)!;
            deletedPool.stop();
            this.pools.delete(deletedPoolId);
        }

        this.reloadTimer?.clear();
        this.reloadTimer = this.intervalProvider.setInterval(() => {
            this.reload().catch((err) => {
                // TODO: Notify about reload error
            });
        }, this.configReloadIntervalMs);
    }

    request(poolId: string, clientId: string): RateLimitOrder {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error(`Rate limit ticket pool not found: ${poolId}`);
        }
        return pool.request(clientId);
    }
}
