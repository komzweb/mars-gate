import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildState, decide, QUESTIONS } from './judgments.ts';
import { buildRequest, config, invoke } from './providers.ts';
import { verifyExecutionFreeze, EXECUTION_FREEZE, BENCHMARK_MANIFEST_HASH } from './frozen-benchmark.ts';
import { fixtureFetch } from './runner.ts';
import type { Answer, Answers, RunRecord, Scenario } from './types.ts';

const ROOT='results/benchmark-v1';
const BASE='2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live';
const PREVIOUS='2026-09-23T02-35-43-756Z-frozen-repeatability-v1-live-c192f906';
const MODEL='gpt-6-luna';
const IDS=Object.keys(QUESTIONS);
const ACTIONS=['CLEAR','QUESTION','INSPECT','DENY'];
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fileHash=async(p:string)=>createHash('sha256').update(await readFile(p)).digest('hex');
const load=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const readRecords=async(p:string)=>(await readFile(p,'utf8')).trim().split('\n').map(x=>JSON.parse(x) as RunRecord);
const save=async(p:string,x:unknown)=>writeFile(p,JSON.stringify(x,null,2)+'\n');
const label=(a:Answer)=>a.type==='noul'?a.noul!>=0.5:a.type==='choice'?a.choice:Number(Object.entries(a.probabilities!).sort((x,y)=>y[1]-x[1])[0][0]);
const stats=(x:number[])=>x.length?{count:x.length,min:Math.min(...x),max:Math.max(...x),mean:x.reduce((a,b)=>a+b,0)/x.length,range:Math.max(...x)-Math.min(...x)}:{count:0,min:null,max:null,mean:null,range:null};
const pct=(x:number[],p:number)=>x.length?[...x].sort((a,b)=>a-b)[Math.ceil(x.length*p)-1]:null;

function atomicCase(rows:RunRecord[],id:string){
 const ok=rows.filter(r=>r.answers?.[id]);
 const classes=ok.map(r=>String(label(r.answers![id])));
 const counts=Object.fromEntries([...new Set(classes)].sort().map(v=>[v,classes.filter(x=>x===v).length]));
 const modal=Math.max(0,...Object.values(counts));
 const sample=ok[0]?.answers![id];
 const probabilityVariation=sample?.type==='noul'?{pYes:stats(ok.map(r=>r.answers![id].noul!))}:Object.fromEntries(Object.keys(sample?.probabilities??{}).map(k=>[k,stats(ok.map(r=>r.answers![id].probabilities![k]))]));
 return{decisionCounts:counts,successful:ok.length,modalDecisionAgreement:ok.length?modal/ok.length:null,all5Agreement:ok.length===5&&modal===5,
  groundTruthMatches:rows.filter(r=>r.atomicMatches?.[id]).length,groundTruthAccuracy:rows.filter(r=>r.atomicMatches?.[id]).length/5,probabilityVariation,
  ...(sample?.type==='score'?{expectedScoreVariation:stats(ok.map(r=>r.answers![id].score!))}:{})};
}
function performance(rows:RunRecord[]){
 const times=rows.filter(r=>r.status==='ok').map(r=>r.latencyMs);
 const total=(k:'inputTokens'|'cachedInputTokens'|'cacheWriteTokens'|'outputTokens'|'reasoningTokens')=>rows.reduce((n,r)=>n+(r.usage?.[k]??0),0);
 return{latencyMeanMs:times.length?times.reduce((a,b)=>a+b,0)/times.length:null,latencyP50Ms:pct(times,.5),latencyP95Ms:pct(times,.95),
  totalInferenceLatencyMs:rows.reduce((n,r)=>n+r.latencyMs,0),inputTokens:total('inputTokens'),cachedInputTokens:total('cachedInputTokens'),cacheWriteTokens:total('cacheWriteTokens'),
  outputTokens:total('outputTokens'),reasoningTokens:total('reasoningTokens'),maximumInputTokens:Math.max(0,...rows.map(r=>r.usage?.inputTokens??0)),
  totalEstimatedCostUsd:rows.reduce((n,r)=>n+(r.estimatedCostUsd??0),0),costComplete:rows.every(r=>r.costComplete),
  apiErrors:rows.filter(r=>r.status==='error').length,retries:rows.reduce((n,r)=>n+Math.max(0,r.attempts.length-1),0)};
}
function comparison(old:any,newSummary:any){
 const rows=[...old.providers,newSummary];
 const names=['Jev (jev-1.13.0)','GPT-5.6 Luna Medium','GPT-6 Luna Medium'];
 return rows.map((p:any,i:number)=>({model:names[i],attempted:p.attempted,successful:p.successful,failed:p.attempted-p.successful,
  finalCorrect:p.finalCorrect,finalActionAccuracy:p.finalActionAccuracy,exactRepeatabilityCases:p.exactRepeatabilityCases,meanModalAgreement:p.meanModalAgreement,
  atomic:Object.fromEntries(IDS.map(id=>[id,{all5AgreementCases:p.atomic[id].all5AgreementCases,groundTruthMatches:p.atomic[id].groundTruthMatches,groundTruthAccuracy:p.atomic[id].groundTruthAccuracy}])),
  latencyMeanMs:p.performance.latencyMeanMs,latencyP50Ms:p.performance.latencyP50Ms,latencyP95Ms:p.performance.latencyP95Ms,
  totalEstimatedCostUsd:p.performance.totalEstimatedCostUsd,apiErrors:p.performance.apiErrors,retries:p.performance.retries}));
}
function markdown(cases:any[],summary:any,comparison:any[]){
 const out=['# Frozen v1 — GPT-6 Luna Medium repeatability','','The 20 frozen cases have five new GPT-6 requests each. GPT-6 Base responses are shown only as a comparison; they are excluded from the five repeats.','',
  '| Model | Success | Final correct | 5/5 action cases | Mean modal agreement | Mean ms | p50 ms | p95 ms | Cost USD |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
 for(const p of comparison)out.push(`| ${p.model} | ${p.successful}/${p.attempted} | ${p.finalCorrect}/100 | ${p.exactRepeatabilityCases}/20 | ${(p.meanModalAgreement*100).toFixed(1)}% | ${p.latencyMeanMs?.toFixed(1)} | ${p.latencyP50Ms?.toFixed(1)} | ${p.latencyP95Ms?.toFixed(1)} | ${p.totalEstimatedCostUsd?.toFixed(6)} |`);
 out.push('','Jev HB-073 retains its original HTTP 520 as a missing response; it was not rerun or imputed.','',
  '## Atomic 5/5 hard-label agreement and Gold accuracy','','| Judgment | Jev 5/5 | Jev Gold | GPT-5.6 5/5 | GPT-5.6 Gold | GPT-6 5/5 | GPT-6 Gold |',
  '|---|---:|---:|---:|---:|---:|---:|');
 for(const id of IDS)out.push(`| ${id} | ${comparison[0].atomic[id].all5AgreementCases}/20 | ${comparison[0].atomic[id].groundTruthMatches}/100 | ${comparison[1].atomic[id].all5AgreementCases}/20 | ${comparison[1].atomic[id].groundTruthMatches}/100 | ${comparison[2].atomic[id].all5AgreementCases}/20 | ${comparison[2].atomic[id].groundTruthMatches}/100 |`);
 out.push('','## GPT-6 Base versus five repeats','','| Case | Gold | Base | Five new actions | Modal | Agreement | 5/5 | Correct repeats |','|---|---|---|---|---|---:|---|---:|');
 for(const c of cases)out.push(`| ${c.caseId} | ${c.goldAction} | ${c.base.action??'ERROR'} | ${c.runs.map((r:any)=>r.action??'ERROR').join(', ')} | ${c.modalAction??'none'} | ${(c.modalAgreementRate*100).toFixed(0)}% | ${c.all5Agreement?'yes':'no'} | ${c.groundTruthMatches}/5 |`);
 out.push('','Full per-case probability ranges/distributions and raw API responses are in case-report.json and records.jsonl. LLM-generated probabilities are not Jev confidence.','');
 return out.join('\n')+'\n';
}

export async function runPostfreezeGpt6Repeatability(options:{offline?:boolean;limitCases?:number;outputRoot?:string;onRecord?:(r:RunRecord)=>void}={}){
 const gate=await verifyExecutionFreeze();
 if(!gate.pass)throw new Error(`Frozen v1 gate failed: ${JSON.stringify(gate.mismatches)}`);
 if(gate.freeze.components.repeatabilitySubset!==hash(gate.manifest.repeatability))throw new Error('Frozen subset/config hash mismatch');
 const ids:string[]=gate.manifest.repeatability.caseIds;
 if(ids.length!==20||new Set(ids).size!==20||gate.manifest.repeatability.repetitionsPerModelPlanned!==5)throw new Error('Expected frozen 20-case × 5 configuration');
 const baseDir=join(ROOT,BASE),oldDir=join(ROOT,PREVIOUS);
 const [baseManifest,evalConfig,baseRecords,oldManifest,oldSummary,cases,gold]=await Promise.all([
  load(join(baseDir,'manifest.json')),load(join(baseDir,'external-model-config.json')),readRecords(join(baseDir,'records.jsonl')),
  load(join(oldDir,'manifest.json')),load(join(oldDir,'summary.json')),load('benchmark/v1/cases.json'),load('benchmark/v1/gold-proposed.json')]);
 if(baseManifest.externalModelConfigHash!==hash(evalConfig)||baseManifest.externalModelConfigFileHash!==await fileHash(join(baseDir,'external-model-config.json')))throw new Error('GPT-6 external evaluation config hash mismatch');
 if(baseManifest.executionFreezeHash!==EXECUTION_FREEZE||baseManifest.benchmarkManifestHash!==BENCHMARK_MANIFEST_HASH||!baseManifest.complete||baseRecords.length!==120)throw new Error('GPT-6 Base provenance mismatch');
 if(evalConfig.modelId!==MODEL||evalConfig.reasoningEffort!=='medium'||evalConfig.processingTier!=='Standard'||evalConfig.apiEndpoint!=='https://api.openai.com/v1/chat/completions'||!evalConfig.promptSchemaCompatibility.all120RequestsExactApartFromModel)throw new Error('GPT-6 evaluation settings differ from Base');
 if(oldManifest.executionFreezeHash!==EXECUTION_FREEZE||oldManifest.repeatabilitySubsetHash!==gate.freeze.components.repeatabilitySubset||!oldManifest.complete||oldSummary.requestRecords!==200)throw new Error('Previous repeatability provenance mismatch');
 const byBase=new Map(baseRecords.map(r=>[r.caseId,r]));
 const selected:Scenario[]=ids.slice(0,options.limitCases??20).map(id=>{const s=cases.find((x:Scenario)=>x.id===id);if(!s||s.variant!=='base'||!gold[id]?.scoringEligible)throw new Error(`Invalid frozen case ${id}`);return s;});
 if(!options.offline&&selected.length!==20)throw new Error('Live run requires all frozen 20 cases');
 const preflight=selected.map(s=>{const state=buildState(s),request=buildRequest('llm',MODEL,state,'medium'),base=byBase.get(s.id);
  if(!base||base.status!=='ok'||base.stateHash!==hash(state)||JSON.stringify(base.request)!==JSON.stringify(request)||JSON.stringify(base.groundTruth)!==JSON.stringify(gold[s.id]))throw new Error(`Base comparison mismatch for ${s.id}`);
  return{s,state,request};});
 const providerSource=await readFile('src/providers.ts','utf8');
 if(!providerSource.includes('https://api.openai.com/v1/chat/completions'))throw new Error('OpenAI API route changed');
 const baseConfig=config('llm');
 const pricing=evalConfig.pricingAssumptions;
 const c={...baseConfig,model:MODEL,reasoningEffort:'medium' as const,price:{input:pricing.input,cachedInput:pricing.cachedInput,cacheWrite:pricing.cacheWrite,output:pricing.output},pricingAssumptions:pricing};
 if(!options.offline&&!c.key)throw new Error('Missing OPENAI_API_KEY');
 const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-postfreeze-gpt6-repeatability-${options.offline?'offline':'live'}-${randomUUID().slice(0,8)}`;
 const directory=join(options.outputRoot??ROOT,runId);
 await mkdir(directory,{recursive:true});
 let manifest:any={schemaVersion:1,runId,suite:'postfreeze-gpt6-repeatability',mode:options.offline?'offline-fixture':'live',benchmarkVersion:'v1',
  executionFreezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,repeatabilitySubsetHash:gate.freeze.components.repeatabilitySubset,
  casesHash:gate.freeze.components.cases,goldHash:gate.freeze.components.gold,judgmentsSourceHash:gate.freeze.components.judgmentsSource,humanReviewStatus:gate.freeze.humanReviewStatus,
  externalModelConfigHash:baseManifest.externalModelConfigHash,externalModelConfigFileHash:baseManifest.externalModelConfigFileHash,
  gpt6BaseRunId:BASE,gpt6BaseRecordsFileHash:await fileHash(join(baseDir,'records.jsonl')),previousRepeatabilityRunId:PREVIOUS,
  previousRepeatabilitySummaryFileHash:await fileHash(join(oldDir,'summary.json')),previousResultsReadOnly:true,
  caseIds:selected.map(s=>s.id),repeatCount:5,requestedModel:MODEL,resolvedModels:[],reasoningEffort:'medium',processingTier:'Standard',pricingAssumptions:pricing,
  executionStartedAt:new Date().toISOString(),executionEndedAt:null,apiErrorRetryPolicy:'Existing invoke policy; retry 429/500/502/503/504/529 once, retain every attempt and failure.',excludedFromBaseAccuracy:true,complete:false};
 await save(join(directory,'manifest.json'),manifest);
 const records:RunRecord[]=[];
 let stop=false;
 for(const {s,state,request} of preflight){for(let repeatIndex=1;repeatIndex<=5&&!stop;repeatIndex++){
  const startedAt=new Date().toISOString();
  const response=await invoke(c,request,options.offline?fixtureFetch('llm'):fetch);
  const decision=response.answers?decide(response.answers):null;
  const record:RunRecord={schemaVersion:1,runId,mode:options.offline?'offline-fixture':'live',caseId:s.id,baseId:s.id,variant:'base',repeatIndex,
   provider:'llm',modelRequested:MODEL,reasoningEffort:'medium',stateHash:hash(state),request,groundTruth:gold[s.id],decision,
   correct:decision?decision.action===gold[s.id].correctAction:null,
   atomicMatches:response.answers?Object.fromEntries(IDS.map(id=>[id,label(response.answers![id])===gold[s.id].expected[id]])):null,
   status:response.answers?'ok':'error',startedAt,firstAttemptLatencyMs:response.attempts[0]?.latencyMs??0,...response};
  (record as any).processingTierRequested='Standard';
  (record as any).processingTierResolved=response.attempts.at(-1)?.rawResponse?.service_tier??null;
  records.push(record);await appendFile(join(directory,'records.jsonl'),JSON.stringify(record)+'\n');options.onRecord?.(record);
  if(response.attempts.some(a=>[401,402,403].includes(a.status!)))stop=true;
 }}
 const caseReports=selected.map(s=>{const rows=records.filter(r=>r.caseId===s.id),base=byBase.get(s.id)!;
  const actionCounts=Object.fromEntries(ACTIONS.map(a=>[a,rows.filter(r=>r.decision?.action===a).length]));
  const modalCount=Math.max(0,...Object.values(actionCounts));
  const modalAction=modalCount?ACTIONS.find(a=>actionCounts[a]===modalCount):null;
  return{caseId:s.id,goldAction:gold[s.id].correctAction,base:{action:base.decision?.action??null,correct:base.correct,rule:base.decision?.rule??null,answers:base.answers},
   runs:rows.map(r=>({repeatIndex:r.repeatIndex,action:r.decision?.action??null,rule:r.decision?.rule??null,correct:r.correct,status:r.status,answers:r.answers,
    atomicMatches:r.atomicMatches,latencyMs:r.latencyMs,usage:r.usage,estimatedCostUsd:r.estimatedCostUsd,error:r.error,retries:Math.max(0,r.attempts.length-1)})),
   actionCounts,modalAction,modalAgreementRate:rows.length?modalCount/rows.length:null,all5Agreement:rows.length===5&&modalCount===5,
   groundTruthMatches:rows.filter(r=>r.correct).length,baseCorrectRepeatAllCorrect:base.correct===true&&rows.length===5&&rows.every(r=>r.correct),
   baseCorrectRepeatAnyWrong:base.correct===true&&rows.some(r=>r.correct===false),atomic:Object.fromEntries(IDS.map(id=>[id,atomicCase(rows,id)]))};
 });
 const atomic=Object.fromEntries(IDS.map(id=>{const per=caseReports.map(c=>c.atomic[id]);return[id,{all5AgreementCases:per.filter(x=>x.all5Agreement).length,
  all5AgreementRate:per.filter(x=>x.all5Agreement).length/selected.length,meanModalDecisionAgreement:per.reduce((n,x)=>n+(x.modalDecisionAgreement??0),0)/selected.length,
  groundTruthMatches:records.filter(r=>r.atomicMatches?.[id]).length,groundTruthAccuracy:records.filter(r=>r.atomicMatches?.[id]).length/records.length,
  probabilityVariationByCase:Object.fromEntries(caseReports.map(c=>[c.caseId,c.atomic[id].probabilityVariation]))}]}));
 const perf=performance(records),finalCorrect=records.filter(r=>r.correct).length;
 const summary={benchmarkVersion:'v1',suite:'postfreeze-gpt6-repeatability',executionFreezeHash:EXECUTION_FREEZE,externalModelConfigHash:baseManifest.externalModelConfigHash,
  repeatabilitySubsetHash:gate.freeze.components.repeatabilitySubset,caseCount:selected.length,repeatsPerCase:5,expectedRequests:selected.length*5,
  attempted:records.length,successful:records.filter(r=>r.status==='ok').length,failed:records.filter(r=>r.status==='error').length,
  finalCorrect,finalActionAccuracy:records.length?finalCorrect/records.length:null,exactRepeatabilityCases:caseReports.filter(c=>c.all5Agreement).length,
  meanModalAgreement:caseReports.reduce((n,c)=>n+(c.modalAgreementRate??0),0)/caseReports.length,
  baseCorrectRepeatAllCorrectCases:caseReports.filter(c=>c.baseCorrectRepeatAllCorrect).map(c=>c.caseId),
  baseCorrectRepeatAnyWrongCases:caseReports.filter(c=>c.baseCorrectRepeatAnyWrong).map(c=>c.caseId),
  atomic,performance:perf,complete:records.length===selected.length*5};
 await save(join(directory,'summary.json'),summary);
 await save(join(directory,'case-report.json'),caseReports);
 const three=comparison(oldSummary,summary);
 await save(join(directory,'three-model-repeatability.json'),{models:three,jevHttp520:'HB-073 retained as a missing response; no rerun or imputation'});
 await writeFile(join(directory,'three-model-repeatability.md'),markdown(caseReports,summary,three));
 await save(join(directory,'post-run-observations.json'),{freezeHash:EXECUTION_FREEZE,datasetMutations:0,observations:[]});
 manifest={...manifest,resolvedModels:[...new Set(records.map(r=>r.modelResolved).filter(Boolean))],resolvedProcessingTiers:[...new Set(records.map(r=>(r as any).processingTierResolved).filter(Boolean))],
  executionEndedAt:new Date().toISOString(),complete:summary.complete,apiErrors:perf.apiErrors,retries:perf.retries};
 await save(join(directory,'manifest.json'),manifest);
 return{directory,summary,three,manifest};
}
