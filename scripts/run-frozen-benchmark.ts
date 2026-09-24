import { parseArgs } from 'node:util';
import { runFrozenBenchmark } from '../src/frozen-benchmark.ts';

const {values}=parseArgs({options:{offline:{type:'boolean',default:false},out:{type:'string'},limit:{type:'string'}}});
const limit=values.limit===undefined?undefined:Number(values.limit);
if(limit!==undefined&&(!values.offline||!Number.isInteger(limit)||limit<1))throw new Error('--limit is allowed only for positive offline fixture tests');
console.log(values.offline?'OFFLINE FIXTURE — no API calls':'LIVE FROZEN BENCHMARK v1 — 120 bases × 2 providers');
const result=await runFrozenBenchmark({offline:values.offline,outputRoot:values.out,limit,onRecord:r=>console.log(`${r.caseId} ${r.provider} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.table(result.summary.providers.map((p:any)=>({provider:p.provider,attempted:p.attempted,successful:p.successful,failed:p.failed,final_accuracy:p.finalActionAccuracy,atomic_accuracy:p.overallAtomicAccuracy.accuracy,p50_ms:p.performance.latencyP50Ms,p95_ms:p.performance.latencyP95Ms,cost_USD:p.performance.totalEstimatedCostUsd,retries:p.performance.retries})));
console.log(result.summary.directComparison);
console.log(`Saved: ${result.directory}`);
if(!result.summary.complete||result.summary.providers.some((p:any)=>p.failed))process.exitCode=1;
