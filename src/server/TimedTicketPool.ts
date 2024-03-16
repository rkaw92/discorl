import { TicketPool } from "./TicketPool";
import { Interval, IntervalProvider, SystemTimers } from "../time";
import { RateLimitOrder } from "../RateLimitOrder";

export class TimedTicketPool {
    protected timer: Interval | null = null;
    protected refreshIntervalMs: number;
    protected rescheduleAtNextRefresh = false;

    constructor(
        protected pool: TicketPool,
        protected periodMs: number = 1000,
        protected refreshCycle: number = 15,
        protected intervalProvider: IntervalProvider = new SystemTimers()
    ) {
        this.refreshIntervalMs = periodMs * refreshCycle;
    }

    request(clientId: string): RateLimitOrder {
        const tickets = this.pool.request(clientId);
        const refreshIn = tickets > 0n ? Math.ceil(this.refreshIntervalMs / 2) : this.periodMs;
        return {
            tickets: Number(tickets),
            periodMs: this.periodMs,
            refreshIn
        };
    }

    update(totalTickets: bigint | number, periodMs: number = this.periodMs, refreshCycle: number = this.refreshCycle) {
        this.pool.update(totalTickets);
        this.periodMs = periodMs;
        this.refreshCycle = refreshCycle;
        this.refreshIntervalMs = periodMs * refreshCycle;
        this.rescheduleAtNextRefresh = true;
    }

    refresh() {
        this.pool.refresh();
        if (this.rescheduleAtNextRefresh) {
            this.stop();
            this.start();
            this.rescheduleAtNextRefresh = false;
        }
    }

    start() {
        if (!this.timer) {
            this.timer = this.intervalProvider.setInterval(() => this.refresh(), this.refreshIntervalMs);
        }
    }

    stop() {
        if (this.timer) {
            this.timer.clear();
            this.timer = null;
        }
    }
}
