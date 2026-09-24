import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildState, decide, llmSchema, QUESTIONS } from './judgments.ts';
import { buildRequest, config, invoke } from './providers.ts';
import { verifyExecutionFreeze, EXECUTION_FREEZE, BENCHMARK_MANIFEST_HASH } from './frozen-benchmark.ts';
import { fixtureFetch } from './runner.ts';
import type { Action, Answer, RunRecord, Scenario } from './types.ts';

const ROOT='results/benchmark-v1';
const ORIGINAL='2026-09-23T02-04-26-591Z-frozen-benchmark-v1-live';
const MODEL='gpt-6-luna';
const PRICE={input:0.10,cachedInput:0.01,cacheWrite:0.125,output:0.50};
const hash=(data:unknown)=>createHash('sha256').update(typeof data==='string'?data:JSON.stringify(data)).digest('hex');
const fileHash=async(path:string)=>createHash('sha256').update(await readFile(path)).digest('hex');
const load=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const jsonl=async(path:string)=>(await readFile(path,'utf8')).trim().split('\n').map(line=>JSON.parse(line) as RunRecord);
const save=async(path:string,data:unknown)=>writeFile(path,JSON.stringify(data,null,2)+'\n');
const label=(a:Answer)=>a.type==='noul' ? a.noul!>=0.5 : a.type==='choice' ? a.choice : Number(Object.entries(a.probabilities!).sort((x,y)=>y[1]-x[1])[0][0]);
const pct=(x:number[],p:number)=>x.length?[...x].sort((a,b)=>a-b)[Math.ceil(x.length*p)-1]:null;
const IDS=Object.keys(QUESTIONS);
const ACTIONS:Action[]=['CLEAR','QUESTION','INSPECT','DENY'];

export function summarizeGpt6(rows:RunRecord[]) {
 const ok=rows.filter(r=>r.status==='ok');
 const correct=rows.filter(r=>r.correct).length;
 const times=ok.map(r=>r.latencyMs);
 const totalCost=rows.reduce((n,r)=>n+(r.estimatedCostUsd??0),0);
 const token=(key:'inputTokens'|'cachedInputTokens'|'cacheWriteTokens'|'outputTokens'|'reasoningTokens')=>rows.reduce((n,r)=>n+(r.usage?.[key]??0),0);
 const atomicByJudgment=Object.fromEntries(IDS.map(id=>{const n=rows.filter(r=>r.atomicMatches?.[id]).length;return[id,{correct:n,total:rows.length,accuracy:n/rows.length}]}));
 const atomicCorrect=Object.values(atomicByJudgment).reduce((n:number,x:any)=>n+x.correct,0);
 return {model:MODEL,attempted:rows.length,successful:ok.length,failed:rows.length-ok.length,finalCorrect:correct,finalActionAccuracy:correct/rows.length,
  recall:Object.fromEntries(ACTIONS.map(a=>{const x=rows.filter(r=>r.groundTruth.correctAction===a);const n=x.filter(r=>r.correct).length;return[a,{correct:n,total:x.length,recall:n/x.length}]})),
  confusionMatrix:Object.fromEntries(ACTIONS.map(g=>[g,Object.fromEntries([...ACTIONS,'ERROR'].map(a=>[a,rows.filter(r=>r.groundTruth.correctAction===g&&(r.decision?.action??'ERROR')===a).length]))])),
  overallAtomicAccuracy:{correct:atomicCorrect,total:rows.length*IDS.length,accuracy:atomicCorrect/(rows.length*IDS.length)},atomicByJudgment,
  performance:{latencyMeanMs:times.length?times.reduce((a,b)=>a+b,0)/times.length:null,latencyP50Ms:pct(times,.5),latencyP95Ms:pct(times,.95),
   inputTokens:token('inputTokens'),cachedInputTokens:token('cachedInputTokens'),cacheWriteTokens:token('cacheWriteTokens'),outputTokens:token('outputTokens'),reasoningTokens:token('reasoningTokens'),
   maximumInputTokens:Math.max(0,...rows.map(r=>r.usage?.inputTokens??0)),totalEstimatedCostUsd:totalCost,costPerAttemptedCaseUsd:totalCost/rows.length,costPerCorrectFinalActionUsd:correct?totalCost/correct:null,
   apiErrors:rows.filter(r=>r.status==='error').length,retries:rows.reduce((n,r)=>n+Math.max(0,r.attempts.length-1),0),costComplete:rows.every(r=>r.costComplete)}};
}

function compare(records:RunRecord[],old:RunRecord[]){
 const by=(rows:RunRecord[],provider:string)=>new Map(rows.filter(r=>r.provider===provider).map(r=>[r.caseId,r]));
 const j=by(old,'jev'),l=by(old,'llm'),g=by(records,'llm');
 const details:any[]=[];
 for(const [id,x] of g){
  const a=j.get(id),b=l.get(id);if(!a||!b)throw new Error(`Missing original result for ${id}`);
  if(a.groundTruth.correctAction!==x.groundTruth.correctAction||b.groundTruth.correctAction!==x.groundTruth.correctAction)throw new Error(`Gold mismatch: ${id}`);
  const actions=[a.decision?.action??'ERROR',b.decision?.action??'ERROR',x.decision?.action??'ERROR'];
  const category={
   gpt56OnlyWrong:!!a.correct&&!b.correct&&!!x.correct,
   gpt6OnlyWrong:!!a.correct&&!!b.correct&&!x.correct,
   jevOnlyWrong:!a.correct&&!!b.correct&&!!x.correct,
   gpt6ResolvedGpt56Error:!b.correct&&!!x.correct,
   gpt6NewError:!!b.correct&&!x.correct,
  };
  if(!x.correct||new Set(actions).size>1)details.push({caseId:id,goldAction:x.groundTruth.correctAction,actions:{jev:actions[0],gpt56Luna:actions[1],gpt6Luna:actions[2]},
   correctness:{jev:a.correct,gpt56Luna:b.correct,gpt6Luna:x.correct},category,
   rules:{jev:a.decision?.rule??null,gpt56Luna:b.decision?.rule??null,gpt6Luna:x.decision?.rule??null},
   atomic:Object.fromEntries(IDS.map(q=>[q,{gold:x.groundTruth.expected[q],jev:a.answers?.[q]??null,gpt56Luna:b.answers?.[q]??null,gpt6Luna:x.answers?.[q]??null,
    labels:{jev:a.answers?label(a.answers[q]):null,gpt56Luna:b.answers?label(b.answers[q]):null,gpt6Luna:x.answers?label(x.answers[q]):null}}]))});
 }
 const categories=['gpt56OnlyWrong','gpt6OnlyWrong','jevOnlyWrong','gpt6ResolvedGpt56Error','gpt6NewError'] as const;
 return {counts:{selectedCases:details.length,gpt6Errors:details.filter(d=>!d.correctness.gpt6Luna).length,actionDisagreements:details.filter(d=>new Set(Object.values(d.actions)).size>1).length,...Object.fromEntries(categories.map(k=>[k,details.filter(d=>d.category[k]).length]))},details};
}
function comparisonMarkdown(rows:any[]){
 const out=['# Frozen v1 post-freeze GPT-6 Luna case comparison','','Selected when GPT-6 Luna is wrong or any of the three final actions differ. Probabilities are native model outputs; no cross-model confidence equivalence is implied.',''];
 for(const d of rows){out.push(`## ${d.caseId}`,'',`Gold: ${d.goldAction}; Jev: ${d.actions.jev} (${d.rules.jev}); GPT-5.6 Luna: ${d.actions.gpt56Luna} (${d.rules.gpt56Luna}); GPT-6 Luna: ${d.actions.gpt6Luna} (${d.rules.gpt6Luna})`,'',`Categories: ${Object.entries(d.category).filter(([,v])=>v).map(([k])=>k).join(', ')||'none'}`,'','| Atomic judgment | Gold | Jev | GPT-5.6 Luna | GPT-6 Luna |','|---|---|---|---|---|');for(const [id,v] of Object.entries(d.atomic) as any)out.push(`| ${id} | ${JSON.stringify(v.gold)} | ${JSON.stringify(v.jev)} | ${JSON.stringify(v.gpt56Luna)} | ${JSON.stringify(v.gpt6Luna)} |`);out.push('');}
 return out.join('\n')+'\n';
}
function comparisonTable(rows:any[]){
 const fmt=(p:any)=>({model:p.provider==='jev'?'Jev (jev-1.13.0)':p.provider==='llm'?'GPT-5.6 Luna Medium':'GPT-6 Luna Medium',final:`${p.finalCorrect}/${p.attempted}`,recall:Object.fromEntries(ACTIONS.map(a=>[a,`${p.recall[a].correct}/${p.recall[a].total}`])),atomic:`${p.overallAtomicAccuracy.correct}/${p.overallAtomicAccuracy.total}`,atomicByJudgment:Object.fromEntries(IDS.map(id=>[id,`${p.atomicByJudgment[id].correct}/${p.atomicByJudgment[id].total}`])),latencyMeanMs:p.performance.latencyMeanMs,latencyP50Ms:p.performance.latencyP50Ms,latencyP95Ms:p.performance.latencyP95Ms,totalCostUsd:p.performance.totalEstimatedCostUsd,costPerCaseUsd:p.performance.costPerAttemptedCaseUsd,costPerCorrectUsd:p.performance.costPerCorrectFinalActionUsd});
 return rows.map(fmt);
}

export async function runPostfreezeGpt6Base(options:{offline?:boolean;limit?:number;outputRoot?:string;onRecord?:(r:RunRecord)=>void}={}){
 const gate=await verifyExecutionFreeze();if(!gate.pass)throw new Error(`Freeze gate failed: ${JSON.stringify(gate.mismatches)}`);
 const cases:Scenario[]=await load('benchmark/v1/cases.json'),gold=await load('benchmark/v1/gold-proposed.json');
 const selected=options.limit?cases.slice(0,options.limit):cases;
 if(!options.offline&&selected.length!==120)throw new Error('Live post-freeze run requires all 120 base cases');
 const oldDir=join(ROOT,ORIGINAL),old=await jsonl(join(oldDir,'records.jsonl')),oldSummary=await load(join(oldDir,'summary.json'));
 if(old.length!==240||new Set(old.filter(r=>r.provider==='llm').map(r=>r.caseId)).size!==120)throw new Error('Original Base benchmark incomplete');
 const oldLlm=new Map(old.filter(r=>r.provider==='llm').map(r=>[r.caseId,r]));
 const requests=selected.map(s=>{const state=buildState(s),request=buildRequest('llm',MODEL,state,'medium'),prior=oldLlm.get(s.id);
  if(!prior||prior.stateHash!==hash(state)||JSON.stringify(request)!==JSON.stringify({...prior.request,model:MODEL}))throw new Error(`Prompt/schema/state incompatibility: ${s.id}`);
  if(JSON.stringify(prior.groundTruth)!==JSON.stringify(gold[s.id]))throw new Error(`Gold differs from original: ${s.id}`);
  return {scenario:s,state,request,requestBytes:Buffer.byteLength(JSON.stringify(request),'utf8')};
 });
 const maxRequestBytes=Math.max(...requests.map(r=>r.requestBytes));
 if(maxRequestBytes>272000)throw new Error(`Conservative 272K input preflight failed: max request bytes ${maxRequestBytes}`);
 const base=config('llm');
 const c={...base,model:MODEL,reasoningEffort:'medium' as const,price:PRICE,pricingAssumptions:{currency:'USD' as const,unit:'per_million_tokens' as const,...PRICE,checkedAt:'2026-09-23',source:'https://developers.openai.com/api/docs/models/gpt-6-luna',notes:['Standard processing; existing Chat Completions route is preserved for exact GPT-5.6 request compatibility.','Reasoning tokens included in output tokens.','All 120 requests conservatively below 272K input tokens.']}};
 if(!options.offline&&!c.key)throw new Error('Missing OPENAI_API_KEY');
 const oldManifest=await load(join(oldDir,'manifest.json'));
 const evaluationConfig={schemaVersion:1,kind:'post-freeze external model evaluation',benchmarkVersion:'v1',executionFreezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,
  modelId:MODEL,reasoningEffort:'medium',processingTier:'Standard',processingRequest:'default service tier (service_tier omitted as in GPT-5.6 original request)',
  apiEndpoint:'https://api.openai.com/v1/chat/completions',apiPathNote:'Existing GPT-5.6 implementation uses Chat Completions, despite later description calling it Responses; same actual route and payload are preserved.',
  promptSchemaCompatibility:{all120RequestsExactApartFromModel:true,questionHash:gate.freeze.components.questions,judgmentsSourceHash:gate.freeze.components.judgmentsSource,
   schemaHash:hash(llmSchema()),developerPromptHash:hash(requests[0].request.messages[0].content),existingBaseRunId:ORIGINAL},
  pricingAssumptions:c.pricingAssumptions,modelReleasedAt:'2026-09-22',modelReleaseSource:'https://developers.openai.com/api/docs/changelog',
  contentFrozenBeforeGpt6Results:true,contentComponentsPreserved:['cases','gold','judgmentsSource','questions','policy','thresholds','decisionRules','repeatabilitySubset','consistencyVariants','sensitivityVariants','sensitivityGold']};
 const configHash=hash(evaluationConfig);
 const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-postfreeze-gpt6-luna-base-${options.offline?'offline':'live'}`;
 const directory=join(options.outputRoot??ROOT,runId);
 await mkdir(directory,{recursive:true});
 await save(join(directory,'external-model-config.json'),evaluationConfig);
 const startedAt=new Date().toISOString();
 let manifest:any={schemaVersion:1,runId,suite:'frozen-base-postfreeze-external-model',mode:options.offline?'offline-fixture':'live',benchmarkVersion:'v1',
  executionFreezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,freezeComponents:gate.freeze.components,
  humanReviewStatus:gate.freeze.humanReviewStatus,externalModelConfigHash:configHash,externalModelConfigFileHash:await fileHash(join(directory,'external-model-config.json')),
  originalBaseRunId:ORIGINAL,originalBaseRecordsFileHash:await fileHash(join(oldDir,'records.jsonl')),originalBaseSummaryFileHash:await fileHash(join(oldDir,'summary.json')),originalResultsReusedReadOnly:true,
  requestedModel:MODEL,resolvedModels:[],reasoningEffort:'medium',processingTier:'Standard',pricingAssumptions:c.pricingAssumptions,
  executionStartedAt:startedAt,executionEndedAt:null,maximumPreflightRequestBytes:maxRequestBytes,apiErrorRetryPolicy:'Same existing invoke policy: HTTP 429/500/502/503/504/529 retry once; no ambiguous network retries; every attempt saved.',complete:false};
 await save(join(directory,'manifest.json'),manifest);
 const records:RunRecord[]=[];
 for(const {scenario:s,state,request} of requests){
  const started=new Date().toISOString();
  const response=await invoke(c,request,options.offline?fixtureFetch('llm'):fetch);
  const decision=response.answers?decide(response.answers):null;
  const g=gold[s.id];
  const matches=response.answers?Object.fromEntries(IDS.map(id=>[id,label(response.answers![id])===g.expected[id]])):null;
  const record:RunRecord={schemaVersion:1,runId,mode:options.offline?'offline-fixture':'live',caseId:s.id,baseId:s.id,variant:'base',provider:'llm',
   modelRequested:MODEL,reasoningEffort:'medium',stateHash:hash(state),request,groundTruth:g,decision,correct:decision?decision.action===g.correctAction:null,
   atomicMatches:matches,status:response.answers?'ok':'error',startedAt:started,firstAttemptLatencyMs:response.attempts[0]?.latencyMs??0,...response};
  (record as any).processingTierRequested='Standard';
  (record as any).processingTierResolved=response.attempts.at(-1)?.rawResponse?.service_tier??null;
  if(record.usage?.inputTokens&&record.usage.inputTokens>272000)throw new Error(`Observed input >272K for ${s.id}; record is saved first`);
  records.push(record);await appendFile(join(directory,'records.jsonl'),JSON.stringify(record)+'\n');options.onRecord?.(record);
  if(response.attempts.some(a=>[401,402,403].includes(a.status!)))break;
 }
 const summary=summarizeGpt6(records);
 const three=comparisonTable([...oldSummary.providers,summary]);
 const diffs=compare(records,old);
 await save(join(directory,'summary.json'),summary);
 await save(join(directory,'three-model-comparison.json'),{models:three,caseCategories:diffs.counts,originalBaseSummaryReadOnly:join(oldDir,'summary.json')});
 await save(join(directory,'case-comparison.json'),diffs);
 await writeFile(join(directory,'case-comparison.md'),comparisonMarkdown(diffs.details));
 const md=['# Frozen v1 post-freeze GPT-6 Luna base evaluation','','| Model | Final | Atomic | Mean ms | p50 ms | p95 ms | Total USD | USD/case | USD/correct |','|---|---:|---:|---:|---:|---:|---:|---:|---:|',...three.map((m:any)=>`| ${m.model} | ${m.final} | ${m.atomic} | ${m.latencyMeanMs?.toFixed(1)} | ${m.latencyP50Ms?.toFixed(1)} | ${m.latencyP95Ms?.toFixed(1)} | ${m.totalCostUsd?.toFixed(6)} | ${m.costPerCaseUsd?.toFixed(6)} | ${m.costPerCorrectUsd?.toFixed(6)} |`),'','## Class recall',...ACTIONS.map(a=>`- ${a}: ${three.map((m:any)=>`${m.model} ${m.recall[a]}`).join('; ')}`),'','## Atomic accuracy',...IDS.map(id=>`- ${id}: ${three.map((m:any)=>`${m.model} ${m.atomicByJudgment[id]}`).join('; ')}`),'',`Max observed GPT-6 input tokens: ${summary.performance.maximumInputTokens}. Max preflight request bytes: ${maxRequestBytes}.`,'','The original GPT-5.6 implementation uses Chat Completions; the GPT-6 evaluation preserves that exact endpoint and request contract.',''];
 await writeFile(join(directory,'three-model-comparison.md'),md.join('\n')+'\n');
 await save(join(directory,'post-run-observations.json'),{freezeHash:EXECUTION_FREEZE,datasetMutations:0,observations:[],note:'Observations only; Frozen v1 remains unchanged.'});
 manifest={...manifest,resolvedModels:[...new Set(records.map(r=>r.modelResolved).filter(Boolean))],resolvedProcessingTiers:[...new Set(records.map(r=>(r as any).processingTierResolved).filter(Boolean))],
  executionEndedAt:new Date().toISOString(),complete:records.length===selected.length&&records.every(r=>r.status==='ok'),actualMaxInputTokens:summary.performance.maximumInputTokens};
 await save(join(directory,'manifest.json'),manifest);
 return {directory,summary,three,diffs:diffs.counts,manifest};
}
