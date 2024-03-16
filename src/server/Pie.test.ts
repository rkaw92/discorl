import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { Pie } from './Pie';

describe('Pie', function () {
    it('should distribute contents evenly for straightforward cases', function () {
        const p = new Pie(100n, 4n);
        const slices: bigint[] = [];
        for (let i = 0; i < 4; i += 1) {
            slices.push(p.take());
        }
        assert.deepEqual(slices, [ 25n, 25n, 25n, 25n ]);
    });
    it('should extend initial slices to fully utilize resources', function () {
        const p = new Pie(20n, 3n);
        const slices: bigint[] = [];
        for (let i = 0; i < 3; i += 1) {
            slices.push(p.take());
        }
        assert.deepEqual(slices, [ 7n, 7n, 6n ]);
    });
});
