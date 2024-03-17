import { RateLimitRequester } from "./interfaces/RateLimitRequester";
import { RateLimitOrder } from "../RateLimitOrder";
import { hexId } from "../id";
import { Interval, IntervalProvider, systemTime } from "../time";
import { FetchRequester } from "./FetchRequester";
import { EventEmitter } from "node:events";
import { FallbackOrderGenerator } from "./interfaces/FallbackOrderGenerator";
import { keepPrevious } from "../fallback";

export class RateLimiter extends EventEmitter {
    protected remaining = 0;
    protected order: RateLimitOrder | null = null;
    protected tickTimer: Interval | null = null;
    protected currentTickMs: number = NaN;
    protected reloadTimer: Interval | null = null;
    protected fallbackReloadMs = 2000;

    constructor(
        protected poolId: string = 'default',
        protected clientId: string = hexId(),
        protected loader: RateLimitRequester = new FetchRequester(),
        protected fallback: FallbackOrderGenerator = keepPrevious(),
        protected intervalProvider: IntervalProvider = systemTime,
    ) {
        super();
        this.order = fallback(this.order);
        this.on('newListener', (event, listener) => {
            if (event === 'config') {
                listener(this.order);
            }
        });
    }

    async init(): Promise<void> {
        return this.reload();
    }

    halt(): void {
        this.order = null;
    }

    async reload(): Promise<void> {
        const oldConfig = this.order;
        this.reloadTimer?.clear();
        try {
            this.order = await this.loader.request(this.poolId, this.clientId);
        } catch (err) {
            this.order = this.fallback(this.order);
        }
        this.detectConfigChanges(oldConfig);
        this.reloadTimer = this.intervalProvider.setInterval(
            () => this.reload().catch((err) => {
                this.emit('error', err);
            }),
            this.order?.refreshIn ?? this.fallbackReloadMs
        );
        this.startTicker();
    }

    detectConfigChanges(oldConfig: RateLimitOrder | null) {
        const newConfig = this.order;
        if (
            (!oldConfig && newConfig) ||
            (oldConfig && !newConfig) ||
            (
                oldConfig &&
                newConfig && (
                    oldConfig.periodMs !== newConfig.periodMs ||
                    oldConfig.refreshIn !== newConfig.refreshIn ||
                    oldConfig.tickets !== newConfig.tickets
                )
            )
        ) {
            this.emit('config', newConfig);
        }
    }

    consume(usage = 1): boolean {
        if (this.remaining >= usage) {
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
            this.currentTickMs = this.order.periodMs;
        }
    }

    protected updateTicker() {
        if (!this.order) {
            this.tickTimer?.clear();
            this.tickTimer = null;
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
