export interface Interval {
    clear(): void;
}

export interface IntervalProvider {
    setInterval(callback: () => unknown, ms: number): Interval;
}

export class SystemInterval implements Interval {
    private backing: ReturnType<typeof setInterval>;
    constructor(callback: () => unknown, ms: number) {
        this.backing = setInterval(callback, ms);
    }
    clear() {
        clearInterval(this.backing);
    }
}

export class SystemTimers implements IntervalProvider {
    setInterval(callback: () => unknown, ms: number): Interval {
        return new SystemInterval(callback, ms);
    }
}
