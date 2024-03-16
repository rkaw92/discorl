import { randomBytes } from "node:crypto";

export function hexId(bytes = 6) {
    return randomBytes(bytes).toString('hex');
}
