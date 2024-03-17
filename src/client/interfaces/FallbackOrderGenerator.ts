import { RateLimitOrder } from "../../RateLimitOrder";

export interface FallbackOrderGenerator {
    (prev: RateLimitOrder | null): RateLimitOrder | null;
}
