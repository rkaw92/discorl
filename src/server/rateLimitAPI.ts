import { FastifyPluginAsync } from "fastify";
import { TicketPoolConfigLoader } from "./interfaces/TicketPoolConfigLoader";
import { RateLimitManager } from "./RateLimitManager";
import { timingSafeEqual } from "crypto";

const rateLimitAPI: FastifyPluginAsync<{
    configLoader: TicketPoolConfigLoader,
    // TODO: Allow auth token config per pool.
    authToken: string,
}> = async function(app, { configLoader, authToken }) {
    const manager = new RateLimitManager(configLoader);
    const authTokenBuffer = Buffer.from(authToken, 'hex');

    app.addHook('preHandler', async function(req, reply) {
        const inputToken = req.headers['authorization'];
        if (!inputToken) {
            return reply.status(401).send({ err: 'Authorization token required' });
        }
        const inputBuffer = Buffer.from(inputToken, 'hex');
        const comparisonBuffer = Buffer.alloc(authTokenBuffer.byteLength);
        inputBuffer.copy(comparisonBuffer, 0, 0, comparisonBuffer.byteLength);
        const isEqual = timingSafeEqual(authTokenBuffer, comparisonBuffer);
        if (!isEqual) {
            return reply.status(401).send({ err: 'Authorization token is invalid' });
        }
    });

    app.get<{
        Params: { poolId: string, clientId: string }
    }>('/pool/:poolId/client/:clientId', async function(req, reply) {
        return manager.request(req.params.poolId, req.params.clientId);
    });

    await manager.init();
}

export { rateLimitAPI };
