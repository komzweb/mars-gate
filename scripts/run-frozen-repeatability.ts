import { parseArgs } from 'node:util';
import { runFrozenRepeatability } from '../src/frozen-repeatability.ts';

const {values}=parseArgs({options:{offline:{type:'boolean',default:false},out:{type:'string'}}});
console.log(values.offline?'OFFLINE FIXTURE — no API calls':'LIVE FROZEN REPEATABILITY v1 — 20 cases × 5 repeats × 2 providers');
const result=await runFrozenRepeatability({offline:values.offline,outputRoot:values.out,onRecord:r=>console.log(`${r.caseId} repeat ${r.repeatIndex} ${r.provider} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.table(result.summary.providers.map((p:any)=>({provider:p.provider,attempted:p.attempted,successful:p.successful,all5Cases:p.exactRepeatabilityCases,meanModal:p.meanModalAgreement,finalAccuracy:p.finalActionAccuracy,p50Ms:p.performance.latencyP50Ms,p95Ms:p.performance.latencyP95Ms,costUsd:p.performance.totalEstimatedCostUsd,errors:p.performance.apiErrors,retries:p.performance.retries})));
console.log(`Saved: ${result.directory}`);
if(!result.summary.complete||result.summary.providers.some((p:any)=>p.performance.apiErrors))process.exitCode=1;
