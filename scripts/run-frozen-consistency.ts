import { parseArgs } from 'node:util';
import { runFrozenConsistency } from '../src/frozen-consistency.ts';

const {values}=parseArgs({options:{offline:{type:'boolean',default:false},out:{type:'string'}}});
console.log(values.offline?'OFFLINE FIXTURE — no API calls':'LIVE FROZEN CONSISTENCY v1 — 48 variants × 2 providers');
const result=await runFrozenConsistency({offline:values.offline,outputRoot:values.out,onRecord:r=>console.log(`${r.caseId} ${r.provider} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.table(result.summary.providers.map((p:any)=>({provider:p.provider,actionAgreement:`${p.actionAgreement.count}/48`,variantCorrect:`${p.groundTruthAccuracy.correct}/48`,atomicAgreement:`${p.atomicAgreement.count}/384`,allFamilyCorrect:`${p.allFamilyCorrect.count}/12`,errors:p.performance.errors,retries:p.performance.retries,costUsd:p.performance.knownEstimatedCostUsd})));
console.log(`Saved: ${result.directory}`);
if(!result.summary.complete||result.summary.providers.some((p:any)=>p.performance.errors))process.exitCode=1;
