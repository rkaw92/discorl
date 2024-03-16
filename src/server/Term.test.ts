import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { Term } from './Term';
import { Pie } from './Pie';

describe('Term', function () {
    it('should slice the resource pie for clients', function () {
        const t = new Term(new Pie(100n, 4n));
        const allotments: bigint[] = [];
        for (let i = 0; i < 4; i += 1) {
            allotments.push(t.request(`client-${i}`));
        }
        assert.deepEqual(allotments, [ 25n, 25n, 25n, 25n ]);
    });
    it('should be idempotent', function () {
        const t = new Term(new Pie(100n, 2n));
        const responsesToA: bigint[] = [];
        const responsesToB: bigint[] = [];
        // A is having a timing problem:
        responsesToA.push(t.request('a'));
        responsesToA.push(t.request('a'));
        responsesToA.push(t.request('a'));
        responsesToB.push(t.request('b'));
        // In reality, only 50 tickets were allotted for "a"...
        assert.deepEqual(responsesToA, [ 50n, 50n, 50n ]);
        // ...so that "b" also got its share.
        assert.deepEqual(responsesToB, [ 50n ]);
    });
});
