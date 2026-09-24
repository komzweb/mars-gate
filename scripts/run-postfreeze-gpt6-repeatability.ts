import { parseArgs } from 'node:util';
import { runPostfreezeGpt6Repeatability } from '../src/postfreeze-gpt6-repeatability.ts';
const {values}=parseArgs({options:{offline:{type:'boolean',default:false},limitCases:{type:'string'}}});
const limitCases=values.limitCases===undefined?undefined:Number(values.limitCases);
if(limitCases!==undefined&&(!values.offline||!Number.isInteger(limitCases)||limitCases<1||limitCases>20))throw new Error('--limitCases requires offline and an integer 1–20');
const result=await runPostfreezeGpt6Repeatability({offline:values.offline,limitCases,onRecord:r=>console.log(`${r.caseId} #${r.repeatIndex} ${r.status} ${r.decision?.action??r.error} ${Math.round(r.latencyMs)}ms`)});
console.log(JSON.stringify({directory:result.directory,summary:{attempted:result.summary.attempted,successful:result.summary.successful,failed:result.summary.failed,finalCorrect:result.summary.finalCorrect,exactRepeatabilityCases:result.summary.exactRepeatabilityCases,meanModalAgreement:result.summary.meanModalAgreement,baseCorrectRepeatAnyWrongCases:result.summary.baseCorrectRepeatAnyWrongCases,performance:result.summary.performance}},null,2));
if(!result.manifest.complete||result.summary.failed)process.exitCode=1;
