import { RateLimitOrder, RateLimitOrderSchema } from "../RateLimitOrder";
import { env } from "../env";
import { RateLimitRequester } from "./interfaces/RateLimitRequester";

export class FetchRequester implements RateLimitRequester {
    constructor(protected baseUrl: URL = new URL(env('RATELIMIT_URL', 'http://ratelimit')), protected authToken: string = env('RATELIMIT_TOKEN')) {}

    async request(poolId: string, clientId: string): Promise<RateLimitOrder> {
        const requestUrl = new URL(`/ratelimit/pool/${poolId}/client/${clientId}`, this.baseUrl);
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: this.authToken,
            }
        });
        if (response.status !== 200) {
            throw new Error(`Failed to load rate limit order: HTTP status ${response.status}`);
        }
        const body = await response.json();
        const order = RateLimitOrderSchema.parse(body);
        return order;
    }
}
