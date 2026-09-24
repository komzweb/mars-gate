import { parseArgs } from 'node:util';
import { runPostfreezeGpt6Consistency } from '../src/postfreeze-gpt6-consistency.ts';
const {values}=parseArgs({options:{offline:{type:'boolean',default:false},limit:{type:'string'}}});
const limit=values.limit===undefined?undefined:Number(values.limit);
if(limit!==undefined&&(!values.offline||!Number.isInteger(limit)||limit<1||limit>48))throw new Error('--limit requires offline and an integer 1–48');
const result=await runPostfreezeGpt6Consistency({offline:values.offline,limit,onRecord:r=>console.log(`${r.caseId} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.log(JSON.stringify({directory:result.directory,summary:result.summary},null,2));
if(!result.manifest.complete||result.summary.performance.failure)process.exitCode=1;
