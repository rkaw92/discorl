import { Pie } from "./Pie";

export class Term {
    protected allotmentsSoFar = new Map<string, bigint>();
    protected clientCount = 0n;
    constructor(protected pie: Pie) {}
    
    request(clientId: string) {
        let allotment = this.allotmentsSoFar.get(clientId);
        if (typeof allotment !== 'undefined') {
            return allotment;
        }
        allotment = this.pie.take();
        this.clientCount += 1n;
        this.allotmentsSoFar.set(clientId, allotment);
        return allotment;
    }

    getClientCount() {
        return this.clientCount;
    }
}
