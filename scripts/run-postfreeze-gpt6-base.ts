import { parseArgs } from 'node:util';
import { runPostfreezeGpt6Base } from '../src/postfreeze-gpt6-base.ts';
const {values}=parseArgs({options:{offline:{type:'boolean',default:false},limit:{type:'string'}}});
const limit=values.limit===undefined?undefined:Number(values.limit);
if(limit!==undefined&&(!values.offline||!Number.isInteger(limit)||limit<1))throw new Error('--limit is allowed only for offline tests');
const r=await runPostfreezeGpt6Base({offline:values.offline,limit,onRecord:x=>console.log(`${x.caseId} ${x.status} ${x.decision?.action??x.error} ${Math.round(x.latencyMs)}ms`)});
console.log(JSON.stringify({directory:r.directory,summary:r.summary,differences:r.diffs},null,2));
if(!r.manifest.complete)process.exitCode=1;
