import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { baseMetrics, repeatMetrics, consistencyMetrics, sensitivityMetrics, performance } from '../src/final-analysis-audit.ts';
import type { RunRecord } from '../src/types.ts';

const root='results/benchmark-v1';
const dirs={
 base:'2026-09-23T02-04-26-591Z-frozen-benchmark-v1-live',
 repeat:'2026-09-23T02-35-43-756Z-frozen-repeatability-v1-live-c192f906',
 consistency:'2026-09-23T03-14-34-775Z-frozen-consistency-v1-live-dfc8769b',
 sensitivity:'2026-09-23T03-24-25-696Z-frozen-sensitivity-v1-live-633b0297',
 gpt6Base:'2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live',
 gpt6Repeat:'2026-09-23T03-50-55-205Z-postfreeze-gpt6-repeatability-live-b14a31dc',
 gpt6Consistency:'2026-09-23T04-11-23-084Z-postfreeze-gpt6-consistency-live-c003b8cb',
 gpt6Sensitivity:'2026-09-23T04-32-50-871Z-postfreeze-gpt6-sensitivity-live-bc20da56',
};
const json=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const records=async(k:keyof typeof dirs)=>(await readFile(join(root,dirs[k],'records.jsonl'),'utf8')).trim().split('\n').map(s=>JSON.parse(s) as RunRecord);
const frozen=async(p:string)=>json(join('benchmark/v1',p));

test('all 8 raw sources have exact request counts and derived audit passed',async()=>{
 const expected={base:240,repeat:200,consistency:96,sensitivity:18,gpt6Base:120,gpt6Repeat:100,gpt6Consistency:48,gpt6Sensitivity:9};
 for(const [k,n] of Object.entries(expected))assert.equal((await records(k as keyof typeof dirs)).length,n,k);
 const audit=await json(join(root,'final-analysis','audit-summary.json'));
 assert.equal(audit.rawRequestCount,831);assert.equal(audit.mismatches,0);assert.equal(audit.status,'PASS');
 assert.equal(audit.gpt6ConfigHash,'39d0a941f372fa5d0cc40c1798a7779f24e3e4d75449e357e1e19a7732ebfd90');
});

test('Base denominators and scores are recomputed from records',async()=>{
 const original=await records('base'),gpt6=await records('gpt6Base');
 for(const [rows,expectedFinal,expectedAtomic] of [
  [original.filter(r=>r.provider==='jev'),119,910],
  [original.filter(r=>r.provider==='llm'),109,855],
  [gpt6,120,888],
 ] as [RunRecord[],number,number][]){
  const x=baseMetrics(rows);assert.equal(x.attempted,120);assert.equal(x.finalCorrect,expectedFinal);
  assert.equal(x.atomic.total,960);assert.equal(x.atomic.correct,expectedAtomic);
  assert.deepEqual(Object.values(x.recall).map(v=>v.total),[30,30,30,30]);
 }
});

test('Jev HTTP 520 remains a missing semantic response and a cost lower bound',async()=>{
 const manifest=await frozen('manifest.json'),subset=manifest.repeatability.caseIds;
 const rows=(await records('repeat')).filter(r=>r.provider==='jev');
 const x=repeatMetrics(rows,subset);const missing=rows.filter(r=>r.status==='error');
 assert.equal(rows.length,100);assert.equal(x.successful,99);assert.equal(x.finalCorrect,99);
 assert.equal(x.all5Cases,19);assert.equal(missing.length,1);
 assert.equal(missing[0].caseId,'HB-073');assert.equal(missing[0].attempts[0].status,520);
 assert.equal(missing[0].usage,null);assert.equal(x.performance.costComplete,false);
 assert.deepEqual(x.performance.costUnknownAttempts,[{caseId:'HB-073',repeatIndex:1,statuses:[520]}]);
 assert.ok(x.performance.knownEstimatedCostUsd>0);
 // An unknown failed-request cost must never be silently treated as zero total cost.
 assert.equal(performance(rows).costComplete,false);
});

test('consistency family and transformation denominators remain frozen',async()=>{
 const [base,cons,variants,manifest]=await Promise.all([records('gpt6Base'),records('gpt6Consistency'),frozen('consistency-variants.json'),frozen('manifest.json')]);
 const x=consistencyMetrics(cons,base,manifest.consistency.baseCaseIds,variants);
 assert.equal(x.variants,48);assert.equal(x.allFamilyCorrect,12);assert.equal(x.atomicAgreement,358);
 assert.equal(x.families.length,12);
 for(const t of ['paraphrase','information-order','irrelevant-information','species-swap']){
  assert.equal(x.transformations[t].variants,12);assert.equal(x.transformations[t].atomicAgreement<=96,true);
 }
});

test('sensitivity expected-change denominator and category counts are raw-derived',async()=>{
 const [base,rows,variants,bg,vg]=await Promise.all([records('gpt6Base'),records('gpt6Sensitivity'),frozen('sensitivity-variants.json'),frozen('gold-proposed.json'),frozen('sensitivity-gold-proposed.json')]);
 const x=sensitivityMetrics(rows,base,variants,bg,vg);
 assert.equal(x.variants,9);assert.equal(x.expectedAtomic,20);
 assert.equal(x.correctExpectedAtomic,12);assert.equal(x.missedExpectedAtomic,6);
 assert.equal(x.wrongDirectionAtomic,2);assert.equal(x.unexpectedAtomic,2);
 assert.deepEqual(['decisive-evidence-addition','decisive-evidence-deletion','evidence-polarity-reversal'].map(t=>x.transformations[t].variants),[2,4,3]);
 assert.equal(Object.values(x.transformations).reduce((n,v)=>n+v.expectedAtomic,0),20);
});
