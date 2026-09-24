import { parseArgs } from 'node:util';
import { runPostfreezeGpt6Sensitivity } from '../src/postfreeze-gpt6-sensitivity.ts';
const {values}=parseArgs({options:{offline:{type:'boolean',default:false},limit:{type:'string'}}});
const limit=values.limit===undefined?undefined:Number(values.limit);
if(limit!==undefined&&(!values.offline||!Number.isInteger(limit)||limit<1||limit>9))throw new Error('--limit requires offline and an integer 1–9');
const result=await runPostfreezeGpt6Sensitivity({offline:values.offline,limit,onRecord:r=>console.log(`${r.caseId} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.log(JSON.stringify({directory:result.directory,summary:result.summary,commonFailures:result.common},null,2));
if(!result.manifest.complete||result.summary.performance.failed)process.exitCode=1;
