import { TicketPool } from "./TicketPool";
import { Interval, IntervalProvider, TimeProvider, systemTime } from "../time";
import { RateLimitOrder } from "../RateLimitOrder";

export class TimedTicketPool {
    protected timer: Interval | null = null;
    protected refreshIntervalMs: number;
    protected rescheduleAtNextRefresh = false;
    protected lastRefreshAt: number;
    protected intervalDriftMs = 0;

    constructor(
        protected pool: TicketPool,
        protected periodMs: number = 1000,
        protected refreshCycle: number = 10,
        protected intervalProvider: IntervalProvider = systemTime,
        protected timeProvider: TimeProvider = systemTime,
    ) {
        this.refreshIntervalMs = periodMs * refreshCycle;
        this.lastRefreshAt = this.timeProvider.now();
    }

    request(clientId: string): RateLimitOrder {
        const tickets = this.pool.request(clientId);
        const refreshIn = this.msUntilAfterNextRefresh();
        return {
            tickets: Number(tickets),
            periodMs: this.periodMs,
            refreshIn
        };
    }

    msUntilAfterNextRefresh(): number {
        const msSinceLastRefresh = this.timeProvider.now() - this.lastRefreshAt;
        // Keep a stable config for clients, let them query us regularly:
        if (msSinceLastRefresh < this.refreshIntervalMs / 10) {
            return this.refreshIntervalMs;
        }
        const shouldHaveRefreshedBy = this.lastRefreshAt + this.refreshIntervalMs + this.intervalDriftMs + 1;
        const msUntil = shouldHaveRefreshedBy - this.timeProvider.now();
        return Math.max(msUntil, this.periodMs);
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
        const now = this.timeProvider.now();
        const shouldBeExactlyAt = (this.lastRefreshAt + this.refreshIntervalMs);
        this.intervalDriftMs = now - shouldBeExactlyAt;
        this.lastRefreshAt = now;
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
