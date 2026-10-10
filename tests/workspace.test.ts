import test from 'node:test';import assert from 'node:assert/strict';
import {parseHoldings,workspaceSchema} from '../src/lib/workspace';
test('imports a CSV header and fractional positions',()=>{assert.deepEqual(parseHoldings('ticker,shares,cost\nVST,10.5,180\nLMT,5,400'),[['VST',10.5,180],['LMT',5,400]])});
test('rejects unknown symbols, duplicate positions and invalid amounts',()=>{for(const text of ['XXX,2,3','VST,-2,3','VST,2,0','VST,NaN,3','VST,2,3\nVST,3,4'])assert.throws(()=>parseHoldings(text));});
test('accepts a partial watchlist and rejects ownership injection',()=>{assert.equal(workspaceSchema.safeParse({watched:{VST:1}}).success,true);assert.equal(workspaceSchema.safeParse({user_id:'someone-else',watched:{VST:1}}).success,false)});
