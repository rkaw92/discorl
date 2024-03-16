import { Pie } from "./Pie";
import { Term } from "./Term";

export class TicketPool {
    protected currentTerm: Term;
    protected totalTicketsEachTerm: bigint;
    protected fallbackExpectedClients: bigint;
    constructor(total: bigint | number, expectedClients: bigint | number) {
        this.totalTicketsEachTerm = BigInt(total);
        this.fallbackExpectedClients = BigInt(expectedClients);
        this.currentTerm = new Term(
            new Pie(this.totalTicketsEachTerm, BigInt(expectedClients))
        );
    }

    request(clientId: string) {
        return this.currentTerm.request(clientId);
    }

    update(totalTickets: bigint | number) {
        this.totalTicketsEachTerm = BigInt(totalTickets);
    }

    refresh() {
        const lastTerm = this.currentTerm;
        this.currentTerm = new Term(
            new Pie(this.totalTicketsEachTerm, lastTerm.getClientCount() || this.fallbackExpectedClients)
        );
    }
}
