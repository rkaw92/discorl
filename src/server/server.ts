import fastify from 'fastify';
import { rateLimitAPI } from './rateLimitAPI';
import { StaticConfigLoader } from './StaticConfigLoader';
import { env } from '../env';

const app = fastify({
    //logger: true
});

const staticConfigs = new StaticConfigLoader([
    {
        poolId: 'default',
        tickets: Number(env('RATELIMIT_TICKETS')),
        periodMs: 1000,
        expectedClients: 1,
    }
]);

app.register(rateLimitAPI, {
    configLoader: staticConfigs,
    authToken: env('RATELIMIT_TOKEN'),
    prefix: '/ratelimit'
});

app.listen({
    host: '0.0.0.0',
    port: 4552
});
