import { parseArgs } from 'node:util';
import { runFrozenSensitivity } from '../src/frozen-sensitivity.ts';

const {values}=parseArgs({options:{offline:{type:'boolean',default:false},out:{type:'string'}}});
console.log(values.offline?'OFFLINE FIXTURE — no API calls':'LIVE FROZEN SENSITIVITY v1 — 9 variants × 2 providers');
const result=await runFrozenSensitivity({offline:values.offline,outputRoot:values.out,onRecord:r=>console.log(`${r.caseId} ${r.provider} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.table(result.summary.providers.map((p:any)=>({provider:p.provider,variantGold:`${p.variantGoldAccuracy.correct}/9`,correctChange:`${p.correctRequiredActionChanges.count}/9`,exactTransition:`${p.exactGoldTransitions.count}/9`,errors:p.performance.errors,retries:p.performance.retries,costUsd:p.performance.knownEstimatedCostUsd})));
console.log(`Saved: ${result.directory}`);
if(!result.summary.complete||result.summary.providers.some((p:any)=>p.performance.errors))process.exitCode=1;
