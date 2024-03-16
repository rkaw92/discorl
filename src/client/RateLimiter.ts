import { RateLimitRequester } from "./interfaces/RateLimitRequester";
import { RateLimitOrder } from "../RateLimitOrder";
import { hexId } from "../id";
import { Interval, IntervalProvider, SystemTimers } from "../time";
import { FetchRequester } from "./FetchRequester";

export class RateLimiter {
    protected remaining = 0;
    protected order: RateLimitOrder | null = null;
    protected tickTimer: Interval | null = null;
    protected currentTickMs: number = NaN;
    protected reloadTimer: Interval | null = null;

    constructor(
        protected poolId: string,
        protected clientId: string = hexId(),
        protected loader: RateLimitRequester = new FetchRequester(),
        protected intervalProvider: IntervalProvider = new SystemTimers()
    ) {}

    async init(): Promise<void> {
        return this.reload();
    }

    async reload(): Promise<void> {
        this.order = await this.loader.request(this.poolId, this.clientId);
        this.reloadTimer?.clear();
        this.reloadTimer = this.intervalProvider.setInterval(
            () => this.reload().catch((err) => {
                // TODO: Notify about reload error
            }),
            this.order.refreshIn
        );
        this.startTicker();
        // TODO: Implement time-based safety shutoff or gradual decay in case we can't contact the rate limiter server.
    }
    
    // TODO: Add change emitter, so that the limiter can be used in alternative mode.

    consume(usage = 1): boolean {
        if (this.remaining > usage) {
            this.remaining -= usage;
            return true;
        } else {
            return false;
        }
    }

    protected replenish() {
        if (this.order) {
            this.remaining = this.order.tickets;
        }
    }

    protected tick() {
        this.replenish();
        this.updateTicker();
    }

    protected startTicker() {
        if (!this.order) {
            return;
        }
        if (!this.tickTimer) {
            this.tickTimer = this.intervalProvider.setInterval(() => {
                this.tick();
            }, this.order.periodMs);
        }
    }

    protected updateTicker() {
        if (!this.order) {
            this.tickTimer?.clear();
            return;
        }
        this.startTicker();
        if (this.tickTimer && this.currentTickMs !== this.order.periodMs) {
            this.tickTimer.clear();
            this.tickTimer = this.intervalProvider.setInterval(() => {
                this.tick();
            }, this.order.periodMs);
        }
        this.currentTickMs = this.order.periodMs;
    }
}
