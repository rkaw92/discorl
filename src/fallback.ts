import { RateLimitOrder } from "./RateLimitOrder";
import { FallbackOrderGenerator } from "./client/interfaces/FallbackOrderGenerator";

export function keepPrevious(): FallbackOrderGenerator {
    return (prev: RateLimitOrder | null) => prev;
}

export function decayTo(finalForm: RateLimitOrder, multiplier = 0.5): FallbackOrderGenerator {
    return (prev: RateLimitOrder | null) => {
        if (!prev) {
            return finalForm;
        }
        const newTickets =  Math.ceil(prev.tickets * multiplier) - 1;
        if (newTickets > finalForm.tickets) {
            return {
                ...prev,
                tickets: newTickets
            };
        } else {
            return finalForm;
        }
    };
}
