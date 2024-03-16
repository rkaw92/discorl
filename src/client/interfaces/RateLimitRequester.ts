import { RateLimitOrder } from "../../RateLimitOrder";

export interface RateLimitRequester {
    request(poolId: string, clientId: string): Promise<RateLimitOrder>;
}
