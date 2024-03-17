import { EOL } from "node:os";
import { RateLimiter } from "./RateLimiter";
import { decayTo, keepPrevious } from "../fallback";


const limiters: RateLimiter[] = [];

let addCounter = 0;
function add() {
    const myId = addCounter++;
    const rl = new RateLimiter(undefined, undefined, undefined, decayTo({
        tickets: 1,
        refreshIn: 5000,
        periodMs: 1000
    }));
    limiters.push(rl);
    rl.init();
    rl.on('config', (config) => {
        console.log('rl#%d config %j', myId, config);
    })
}

add();

setInterval(function runDemoRequests() {
    for (const [ i, limiter ] of limiters.entries()) {
        while (true) {
            const canRun = limiter.consume();
            if (!canRun) {
                break;
            }
            process.stdout.write(`${i}`);
        }
    }
    process.stdout.write(EOL);
}, 1000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 5000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 10000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 12000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 16000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 20000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 25000);

setTimeout(function addLimiter() {
    console.log('adding client');
    add();
}, 30000);
