import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const {values}=parseArgs({options:{run:{type:'string'}}});
if(!values.run)throw new Error('Pass --run <saved repeatability run directory>');
const directory=values.run;
const [summaryText,casesText,recordsText]=await Promise.all(['summary.json','case-report.json','records.jsonl'].map(name=>readFile(join(directory,name),'utf8')));
const summary=JSON.parse(summaryText);const cases=JSON.parse(casesText);
if(summary.suite!=='frozen-repeatability-only'||summary.requestRecords!==200||cases.length!==20)throw new Error('Expected completed frozen repeatability records');
const stats=(v:number[])=>({count:v.length,min:v.length?Math.min(...v):null,max:v.length?Math.max(...v):null,mean:v.length?v.reduce((a,b)=>a+b,0)/v.length:null});
const derived={schemaVersion:1,sourceRecordsSha256:createHash('sha256').update(recordsText).digest('hex'),sourceSummarySha256:createHash('sha256').update(summaryText).digest('hex'),sourceCaseReportSha256:createHash('sha256').update(casesText).digest('hex'),freezeHash:summary.executionFreezeHash,providerMetrics:['jev','llm'].map(provider=>{
  const providerCases=cases.map((c:any)=>({caseId:c.caseId,goldAction:c.goldAction,...c.providers.find((p:any)=>p.provider===provider)}));
  const judgmentIds=Object.keys(providerCases[0].atomic);
  const atomic=Object.fromEntries(judgmentIds.map(id=>{
    const c=providerCases.map((p:any)=>p.atomic[id]);
    const probabilityKeys=Object.keys(c[0].probabilityVariation);
    return[id,{all5AgreementCases:c.filter((x:any)=>x.all5Agreement).length,meanModalAgreementAllFive:c.reduce((n:number,x:any)=>n+Math.max(0,...Object.values(x.decisionCounts as Record<string,number>))/5,0)/20,probabilityRangeByKey:Object.fromEntries(probabilityKeys.map(key=>[key,stats(c.map((x:any)=>x.probabilityVariation[key].range).filter(Number.isFinite))])),...(provider==='jev'&&id==='answer_completeness'||provider==='jev'&&id==='anomaly_severity'?{jevConfidenceRange:stats(c.map((x:any)=>x.jevConfidenceVariation?.range).filter(Number.isFinite))}:{})}];
  }));
  return{provider,baseComparison:{baseWrongCases:providerCases.filter((p:any)=>p.base.correct===false).map((p:any)=>({caseId:p.caseId,baseAction:p.base.action,goldAction:p.goldAction,repeatCorrect:p.groundTruthMatches,repeatActions:p.runs.map((r:any)=>r.action??'ERROR')})),baseCorrectButRepeatNotAllCorrect:providerCases.filter((p:any)=>p.base.correct===true&&p.groundTruthMatches<5).map((p:any)=>({caseId:p.caseId,baseAction:p.base.action,goldAction:p.goldAction,repeatCorrect:p.groundTruthMatches,repeatActions:p.runs.map((r:any)=>r.action??'ERROR')}))},atomic};
})};
await writeFile(join(directory,'derived-analysis.json'),JSON.stringify(derived,null,2));
const lines=['# Repeatability — derived analysis','',`Source records SHA-256: \`${derived.sourceRecordsSha256}\``,'','Probability ranges are max minus min within each five-run case. The table reports the mean of those 20 case-level ranges. Missing API responses have no probability and remain failures in the five-run agreement rate. Jev confidence is shown separately from Luna generated probabilities.',''];
for(const p of derived.providerMetrics){lines.push(`## ${p.provider}`,'',`Base wrong cases in subset: ${p.baseComparison.baseWrongCases.length}. Base correct but at least one repeat wrong/error: ${p.baseComparison.baseCorrectButRepeatNotAllCorrect.length}.`,'','| Atomic judgment | All-5 decision agreement | Mean 5-run agreement | Mean probability ranges |','|---|---:|---:|---|');for(const [id,a] of Object.entries(p.atomic) as any)lines.push(`| ${id} | ${a.all5AgreementCases}/20 | ${(a.meanModalAgreementAllFive*100).toFixed(1)}% | ${Object.entries(a.probabilityRangeByKey).map(([k,v]:any)=>`${k}: ${v.mean?.toFixed(3)??'n/a'}`).join('; ')} |`);lines.push('','Base wrong cases:', '');for(const c of p.baseComparison.baseWrongCases)lines.push(`- ${c.caseId}: Base ${c.baseAction}, Gold ${c.goldAction}; repeat ${c.repeatActions.join(', ')} (${c.repeatCorrect}/5 correct)`);if(!p.baseComparison.baseWrongCases.length)lines.push('- None');lines.push('','Base correct with a wrong or failed repeat:','');for(const c of p.baseComparison.baseCorrectButRepeatNotAllCorrect)lines.push(`- ${c.caseId}: Base ${c.baseAction}, Gold ${c.goldAction}; repeat ${c.repeatActions.join(', ')} (${c.repeatCorrect}/5 correct)`);if(!p.baseComparison.baseCorrectButRepeatNotAllCorrect.length)lines.push('- None');lines.push('');}
await writeFile(join(directory,'derived-analysis.md'),lines.join('\n')+'\n');
console.log(`Saved derived repeatability analysis: ${directory}`);
