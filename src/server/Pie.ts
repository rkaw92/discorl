export class Pie {
    protected normalSliceSize: bigint;
    protected remainder: bigint;
    protected takenSlices = 0n;
    constructor(protected total: bigint, protected slices: bigint) {
        this.normalSliceSize = total / slices;
        this.remainder = total - (this.normalSliceSize * this.slices);
    }

    take(): bigint {
        if (this.takenSlices === this.slices) {
            return 0n;
        }
        let allotment = this.normalSliceSize;
        if (this.remainder > 0n) {
            allotment += 1n;
            this.remainder -= 1n;
        }
        this.takenSlices += 1n;
        return allotment;
    }
}
