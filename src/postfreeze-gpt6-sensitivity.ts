import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildState, decide, QUESTIONS } from './judgments.ts';
import { buildRequest, config, invoke } from './providers.ts';
import { fixtureFetch } from './runner.ts';
import { verifyExecutionFreeze, EXECUTION_FREEZE, BENCHMARK_MANIFEST_HASH } from './frozen-benchmark.ts';
import type { Answer, RunRecord, Scenario } from './types.ts';

const ROOT='results/benchmark-v1';
const BASE='2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live';
const REPEAT='2026-09-23T03-50-55-205Z-postfreeze-gpt6-repeatability-live-b14a31dc';
const CONSISTENCY='2026-09-23T04-11-23-084Z-postfreeze-gpt6-consistency-live-c003b8cb';
const OLD_SENSITIVITY='2026-09-23T03-24-25-696Z-frozen-sensitivity-v1-live-633b0297';
const MODEL='gpt-6-luna';
const IDS=Object.keys(QUESTIONS);
const CATEGORIES=['decisive-evidence-addition','decisive-evidence-deletion','evidence-polarity-reversal'];
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fileHash=async(p:string)=>createHash('sha256').update(await readFile(p)).digest('hex');
const load=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const records=async(p:string)=>(await readFile(p,'utf8')).trim().split('\n').map(x=>JSON.parse(x) as RunRecord);
const save=async(p:string,x:unknown)=>writeFile(p,JSON.stringify(x,null,2)+'\n');
const label=(a:Answer)=>a.type==='noul'?a.noul!>=0.5:a.type==='choice'?a.choice:Number(Object.entries(a.probabilities!).sort((x,y)=>y[1]-x[1])[0][0]);
const pct=(x:number[],p:number)=>x.length?[...x].sort((a,b)=>a-b)[Math.ceil(x.length*p)-1]:null;

function detail(v:Scenario,r:RunRecord,b:RunRecord,baseGold:any,variantGold:any){
 const atomic=Object.fromEntries(IDS.map(id=>{const a=b.answers?.[id]??null,x=r.answers?.[id]??null;
  const baseLabel=a?label(a):null,variantLabel=x?label(x):null,bg=baseGold.expected[id],vg=variantGold.expected[id];
  const expectedChange=bg!==vg,observedChange=baseLabel!==null&&variantLabel!==null?baseLabel!==variantLabel:null;
  return[id,{baseGold:bg,variantGold:vg,baseOutput:a,variantOutput:x,baseHardLabel:baseLabel,variantHardLabel:variantLabel,
   expectedChange,observedChange,exactGoldTransition:expectedChange&&baseLabel===bg&&variantLabel===vg,
   correctVariantLabel:variantLabel===vg,missedExpectedChange:expectedChange&&observedChange===false,
   wrongDirectionChange:expectedChange&&observedChange===true&&variantLabel!==vg,
   recoveredFromWrongBase:expectedChange&&observedChange===true&&baseLabel!==bg&&variantLabel===vg,
   unexpectedChange:!expectedChange&&observedChange===true,
   probabilityDelta:a&&x?(x.type==='noul'?{pYes:x.noul!-a.noul!}:
    {perKey:Object.fromEntries(Object.keys(x.probabilities!).map(k=>[k,x.probabilities![k]-a.probabilities![k]])),
     distributionL1:Object.keys(x.probabilities!).reduce((n,k)=>n+Math.abs(x.probabilities![k]-a.probabilities![k]),0)}):null}]}));
 const baseAction=b.decision?.action??null,variantAction=r.decision?.action??null;
 const observedActionChange=baseAction&&variantAction?baseAction!==variantAction:null;
 return{sourceBaseCaseId:v.baseId,variantId:v.id,transformationType:v.variant,
  baseGoldAction:baseGold.correctAction,variantGoldAction:variantGold.correctAction,
  baseModelAction:baseAction,variantModelAction:variantAction,requiredActionChange:baseGold.correctAction!==variantGold.correctAction,
  observedActionChange,correctRequiredActionChange:observedActionChange===true&&variantAction===variantGold.correctAction,
  variantGoldCorrect:variantAction===variantGold.correctAction,baseCorrect:b.correct,
  exactGoldTransition:baseAction===baseGold.correctAction&&variantAction===variantGold.correctAction,
  baseDecisionRule:b.decision?.rule??null,variantDecisionRule:r.decision?.rule??null,atomic,
  expectedAtomicChanges:IDS.filter(id=>atomic[id].expectedChange),observedAtomicChanges:IDS.filter(id=>atomic[id].observedChange===true),
  latencyMs:r.latencyMs,usage:r.usage,estimatedCostUsd:r.estimatedCostUsd,status:r.status,error:r.error,retries:Math.max(0,r.attempts.length-1)};
}
function aggregate(rows:any[],denominator:number){
 const all=rows.flatMap(d=>IDS.map(id=>({variantId:d.variantId,id,...d.atomic[id]})));
 const expected=all.filter(x=>x.expectedChange),stable=all.filter(x=>!x.expectedChange);
 return{variants:denominator,variantGoldAccuracy:{correct:rows.filter(d=>d.variantGoldCorrect).length,total:denominator},
  requiredActionChangeDetected:{count:rows.filter(d=>d.observedActionChange===true).length,total:denominator},
  correctRequiredActionChanges:{count:rows.filter(d=>d.correctRequiredActionChange).length,total:denominator},
  exactGoldTransitions:{count:rows.filter(d=>d.exactGoldTransition).length,total:denominator},
  transitions:{correctBaseToCorrectVariant:rows.filter(d=>d.baseCorrect===true&&d.variantGoldCorrect).length,
   incorrectBaseToCorrectVariant:rows.filter(d=>d.baseCorrect===false&&d.variantGoldCorrect).length,
   correctBaseToIncorrectVariant:rows.filter(d=>d.baseCorrect===true&&!d.variantGoldCorrect).length,
   incorrectBaseToIncorrectVariant:rows.filter(d=>d.baseCorrect===false&&!d.variantGoldCorrect).length},
  atomic:{expectedChanged:expected.length,correctlyChangedExactGoldTransition:expected.filter(x=>x.exactGoldTransition).length,
   missedExpectedChanges:expected.filter(x=>x.missedExpectedChange).length,
   wrongDirectionChanges:expected.filter(x=>x.wrongDirectionChange).length,
   recoveredFromWrongBase:expected.filter(x=>x.recoveredFromWrongBase).length,
   unexpectedChanges:stable.filter(x=>x.unexpectedChange).length,
   unexpectedChangeDetails:stable.filter(x=>x.unexpectedChange).map(x=>({variantId:x.variantId,judgment:x.id,baseGold:x.baseGold,
    variantGold:x.variantGold,baseHardLabel:x.baseHardLabel,variantHardLabel:x.variantHardLabel}))}};
}
function performance(rows:RunRecord[]){
 const t=rows.filter(x=>x.status==='ok').map(x=>x.latencyMs);
 const token=(k:'inputTokens'|'cachedInputTokens'|'cacheWriteTokens'|'outputTokens'|'reasoningTokens')=>rows.reduce((n,x)=>n+(x.usage?.[k]??0),0);
 return{successful:rows.filter(x=>x.status==='ok').length,failed:rows.filter(x=>x.status==='error').length,errors:rows.filter(x=>x.status==='error').length,
  retries:rows.reduce((n,x)=>n+Math.max(0,x.attempts.length-1),0),latencyMeanMs:t.length?t.reduce((a,b)=>a+b,0)/t.length:null,
  latencyP50Ms:pct(t,.5),latencyP95Ms:pct(t,.95),totalInferenceLatencyMs:rows.reduce((n,x)=>n+x.latencyMs,0),
  inputTokens:token('inputTokens'),cachedInputTokens:token('cachedInputTokens'),cacheWriteTokens:token('cacheWriteTokens'),
  outputTokens:token('outputTokens'),reasoningTokens:token('reasoningTokens'),
  knownEstimatedCostUsd:rows.reduce((n,x)=>n+(x.estimatedCostUsd??0),0),costComplete:rows.every(x=>x.costComplete),
  maximumInputTokens:Math.max(0,...rows.map(x=>x.usage?.inputTokens??0))};
}
function reportMarkdown(three:any,caseRows:any[],stability:any[]){
 const out=['# Frozen v1 — GPT-6 Luna Medium sensitivity','','Gold requires the Final Action to change for all nine variants. Mere model action change is not counted as success.','',
  '| Model | Variant Gold | Correct required change | Exact Gold transition | Expected atomic correct | Missed | Wrong direction | Unexpected atomic |',
  '|---|---:|---:|---:|---:|---:|---:|---:|'];
 for(const p of three.models)out.push(`| ${p.model} | ${p.variantGoldAccuracy.correct}/9 | ${p.correctRequiredActionChanges.count}/9 | ${p.exactGoldTransitions.count}/9 | ${p.atomic.correctlyChangedExactGoldTransition}/${p.atomic.expectedChanged} | ${p.atomic.missedExpectedChanges} | ${p.atomic.wrongDirectionChanges} | ${p.atomic.unexpectedChanges} |`);
 out.push('','## GPT-6 by transformation','','| Transformation | Variant Gold | Correct action change | Atomic correct | Missed | Wrong direction | Unexpected |',
  '|---|---:|---:|---:|---:|---:|---:|');
 for(const x of three.transformations)out.push(`| ${x.transformationType} | ${x.variantGoldAccuracy.correct}/${x.variants} | ${x.correctRequiredActionChanges.count}/${x.variants} | ${x.atomic.correctlyChangedExactGoldTransition}/${x.atomic.expectedChanged} | ${x.atomic.missedExpectedChanges} | ${x.atomic.wrongDirectionChanges} | ${x.atomic.unexpectedChanges} |`);
 out.push('','## Case transitions','','| Source | Variant | Gold Base→Variant | Jev | GPT-5.6 Luna | GPT-6 Luna |',
  '|---|---|---|---|---|---|');
 for(const x of caseRows)out.push(`| ${x.sourceBaseCaseId} | ${x.variantId} | ${x.baseGoldAction}→${x.variantGoldAction} | ${x.jev.baseModelAction}→${x.jev.variantModelAction} | ${x.gpt56Luna.baseModelAction}→${x.gpt56Luna.variantModelAction} | ${x.gpt6Luna.baseModelAction}→${x.gpt6Luna.variantModelAction} |`);
 out.push('','## Stability and responsiveness','','| Model | Stability | Responsiveness |','|---|---:|---:|');
 for(const x of stability)out.push(`| ${x.model} | ${x.stability.count}/48 | ${x.responsiveness.count}/9 |`);
 out.push('','Stability and responsiveness are separate measurements; no composite score is formed. Full probabilities and atomic transitions are in case-level.json.','');
 return out.join('\n')+'\n';
}

export async function runPostfreezeGpt6Sensitivity(options:{offline?:boolean;limit?:number;outputRoot?:string;onRecord?:(r:RunRecord)=>void}={}){
 const gate=await verifyExecutionFreeze();if(!gate.pass)throw new Error(`Frozen v1 gate failed: ${JSON.stringify(gate.mismatches)}`);
 if(gate.freeze.components.sensitivityVariants!==await fileHash('benchmark/v1/sensitivity-variants.json')||
  gate.freeze.components.sensitivityGold!==await fileHash('benchmark/v1/sensitivity-gold-proposed.json'))throw new Error('Sensitivity variants/Gold hash mismatch');
 const baseDir=join(ROOT,BASE),repeatDir=join(ROOT,REPEAT),consistencyDir=join(ROOT,CONSISTENCY),oldDir=join(ROOT,OLD_SENSITIVITY);
 const [baseManifest,repeatManifest,consistencyManifest,evalConfig,baseRecords,oldManifest,oldSummary,oldDetails,oldRecords,consistencySummary,variants,baseGold,variantGold,allCases]=await Promise.all([
  load(join(baseDir,'manifest.json')),load(join(repeatDir,'manifest.json')),load(join(consistencyDir,'manifest.json')),
  load(join(baseDir,'external-model-config.json')),records(join(baseDir,'records.jsonl')),load(join(oldDir,'manifest.json')),
  load(join(oldDir,'summary.json')),load(join(oldDir,'case-level.json')),records(join(oldDir,'records.jsonl')),load(join(consistencyDir,'summary.json')),
  load('benchmark/v1/sensitivity-variants.json'),load('benchmark/v1/gold-proposed.json'),
  load('benchmark/v1/sensitivity-gold-proposed.json'),load('benchmark/v1/cases.json')]);
 const configHash=hash(evalConfig),configFileHash=await fileHash(join(baseDir,'external-model-config.json'));
 for(const m of [baseManifest,repeatManifest,consistencyManifest]){
  if(m.externalModelConfigHash!==configHash||m.externalModelConfigFileHash!==configFileHash||m.executionFreezeHash!==EXECUTION_FREEZE||
   m.benchmarkManifestHash!==BENCHMARK_MANIFEST_HASH||!m.complete)throw new Error('GPT-6 prior run configuration/provenance mismatch');
 }
 if(baseRecords.length!==120||evalConfig.modelId!==MODEL||evalConfig.reasoningEffort!=='medium'||evalConfig.processingTier!=='Standard'||
  evalConfig.apiEndpoint!=='https://api.openai.com/v1/chat/completions'||!evalConfig.promptSchemaCompatibility.all120RequestsExactApartFromModel)throw new Error('GPT-6 settings mismatch');
 if(oldManifest.executionFreezeHash!==EXECUTION_FREEZE||oldManifest.sensitivityVariantsHash!==gate.freeze.components.sensitivityVariants||
  oldManifest.sensitivityGoldHash!==gate.freeze.components.sensitivityGold||!oldManifest.complete||oldDetails.length!==18||oldRecords.length!==18)throw new Error('Prior sensitivity provenance mismatch');
 if(variants.length!==9||Object.keys(variantGold).length!==9||CATEGORIES.map(t=>variants.filter((v:Scenario)=>v.variant===t).length).join()!=='2,4,3')throw new Error('Expected 9 frozen variants, split 2/4/3');
 const byBase=new Map(baseRecords.map(x=>[x.caseId,x]));
 const preflight=variants.map((v:Scenario)=>{const source:Scenario=allCases.find((s:Scenario)=>s.id===v.baseId),b=byBase.get(v.baseId),g=variantGold[v.id];
  if(!source||!b||b.status!=='ok'||b.correct!==true||b.stateHash!==hash(buildState(source))||
   JSON.stringify(b.groundTruth)!==JSON.stringify(baseGold[v.baseId])||!g?.scoringEligible||
   baseGold[v.baseId].correctAction===g.correctAction)throw new Error(`Invalid source or Gold transition: ${v.id}`);
  const st=buildState(v),req=buildRequest('llm',MODEL,st,'medium');
  const old=oldDetails.find((x:any)=>x.variantId===v.id&&x.provider==='llm');
  const prior=oldRecords.find(x=>x.caseId===v.id&&x.provider==='llm');
  if(!old||old.sourceBaseCaseId!==v.baseId||!prior||prior.stateHash!==hash(st)||
   JSON.stringify(req)!==JSON.stringify({...prior.request,model:MODEL})||
   JSON.stringify(prior.groundTruth)!==JSON.stringify(g))throw new Error(`Prior request/Gold mismatch: ${v.id}`);
  return{v,st,req};});
 if(!options.offline&&options.limit!==undefined)throw new Error('Live requires all nine variants');
 if(options.offline&&options.limit!==undefined&&(!Number.isInteger(options.limit)||options.limit<1||options.limit>9))throw new Error('Invalid offline limit');
 const selected=options.limit?preflight.slice(0,options.limit):preflight;
 if(!(await readFile('src/providers.ts','utf8')).includes('https://api.openai.com/v1/chat/completions'))throw new Error('API route changed');
 const baseConfig=config('llm'),pricing=evalConfig.pricingAssumptions;
 const c={...baseConfig,model:MODEL,reasoningEffort:'medium' as const,
  price:{input:pricing.input,cachedInput:pricing.cachedInput,cacheWrite:pricing.cacheWrite,output:pricing.output},pricingAssumptions:pricing};
 if(!options.offline&&!c.key)throw new Error('Missing OPENAI_API_KEY');
 const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-postfreeze-gpt6-sensitivity-${options.offline?'offline':'live'}-${randomUUID().slice(0,8)}`;
 const directory=join(options.outputRoot??ROOT,runId);await mkdir(directory,{recursive:true});
 let manifest:any={schemaVersion:1,runId,suite:'postfreeze-gpt6-sensitivity',mode:options.offline?'offline-fixture':'live',benchmarkVersion:'v1',
  executionFreezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,
  sensitivityVariantsHash:gate.freeze.components.sensitivityVariants,sensitivityGoldHash:gate.freeze.components.sensitivityGold,
  casesHash:gate.freeze.components.cases,baseGoldHash:gate.freeze.components.gold,judgmentsSourceHash:gate.freeze.components.judgmentsSource,
  humanReviewStatus:gate.freeze.humanReviewStatus,externalModelConfigHash:configHash,externalModelConfigFileHash:configFileHash,
  gpt6BaseRunId:BASE,gpt6RepeatabilityRunId:REPEAT,gpt6ConsistencyRunId:CONSISTENCY,previousSensitivityRunId:OLD_SENSITIVITY,
  gpt6BaseRecordsFileHash:await fileHash(join(baseDir,'records.jsonl')),previousSensitivitySummaryFileHash:await fileHash(join(oldDir,'summary.json')),
  previousResultsReadOnly:true,variantIds:selected.map(x=>x.v.id),sourceBaseCaseIds:selected.map(x=>x.v.baseId),
  requestedModel:MODEL,resolvedModels:[],reasoningEffort:'medium',processingTier:'Standard',pricingAssumptions:pricing,
  executionStartedAt:new Date().toISOString(),executionEndedAt:null,excludedFromBaseAccuracy:true,
  apiErrorRetryPolicy:'Existing invoke policy; retry 429/500/502/503/504/529 once, retain every attempt and failure.',complete:false};
 await save(join(directory,'manifest.json'),manifest);
 const rows:RunRecord[]=[];
 for(const {v,st,req} of selected){
  const startedAt=new Date().toISOString();
  const response=await invoke(c,req,options.offline?fixtureFetch('llm'):fetch);
  const g=variantGold[v.id],decision=response.answers?decide(response.answers):null;
  const r:RunRecord={schemaVersion:1,runId,mode:options.offline?'offline-fixture':'live',caseId:v.id,baseId:v.baseId,variant:v.variant,
   provider:'llm',modelRequested:MODEL,reasoningEffort:'medium',stateHash:hash(st),request:req,groundTruth:g,decision,
   correct:decision?decision.action===g.correctAction:null,
   atomicMatches:response.answers?Object.fromEntries(IDS.map(id=>[id,label(response.answers![id])===g.expected[id]])):null,
   status:response.answers?'ok':'error',startedAt,firstAttemptLatencyMs:response.attempts[0]?.latencyMs??0,...response};
  (r as any).processingTierRequested='Standard';(r as any).processingTierResolved=response.attempts.at(-1)?.rawResponse?.service_tier??null;
  rows.push(r);await appendFile(join(directory,'records.jsonl'),JSON.stringify(r)+'\n');options.onRecord?.(r);
  if(response.attempts.some(a=>[401,402,403].includes(a.status!)))break;
 }
 const details=selected.map(({v})=>{const r=rows.find(x=>x.caseId===v.id);
  return r?detail(v,r,byBase.get(v.baseId)!,baseGold[v.baseId],variantGold[v.id]):null;}).filter(Boolean);
 const overall=aggregate(details,selected.length);
 const transformations=CATEGORIES.map(type=>({transformationType:type,...aggregate(details.filter((x:any)=>x.transformationType===type),
  variants.filter((v:Scenario)=>v.variant===type).length)}));
 const atomicByJudgment=Object.fromEntries(IDS.map(id=>{const all=details.map((d:any)=>({variantId:d.variantId,...d.atomic[id]}));
  const expected=all.filter(x=>x.expectedChange),stable=all.filter(x=>!x.expectedChange);
  return[id,{expectedChanged:expected.length,correctlyChangedExactGoldTransition:expected.filter(x=>x.exactGoldTransition).length,
   missedExpectedChanges:expected.filter(x=>x.missedExpectedChange).length,wrongDirectionChanges:expected.filter(x=>x.wrongDirectionChange).length,
   recoveredFromWrongBase:expected.filter(x=>x.recoveredFromWrongBase).length,unexpectedChanges:stable.filter(x=>x.unexpectedChange).length,
   caseLevel:all}]}));
 const perf=performance(rows);
 const summary={benchmarkVersion:'v1',suite:'postfreeze-gpt6-sensitivity',executionFreezeHash:EXECUTION_FREEZE,
  externalModelConfigHash:configHash,sensitivityVariantsHash:gate.freeze.components.sensitivityVariants,
  sensitivityGoldHash:gate.freeze.components.sensitivityGold,expectedRequests:selected.length,requestRecords:rows.length,
  complete:rows.length===selected.length,...overall,transformations,atomicByJudgment,performance:perf};
 await save(join(directory,'summary.json'),summary);
 await save(join(directory,'case-level.json'),details);
 await save(join(directory,'atomic-sensitivity-report.json'),{overall:overall.atomic,byJudgment:atomicByJudgment,
  definitions:{correctlyChangedExactGoldTransition:'Base model label equals Base Gold and variant model label equals Variant Gold.',
   missedExpectedChange:'Base and variant model labels remain equal even though Gold changed.',
   wrongDirectionChange:'Model label changes but variant label is not Variant Gold.',
   unexpectedChange:'Model label changes although atomic Gold is unchanged.'}});
 const priorJ=oldSummary.providers.find((x:any)=>x.provider==='jev'),priorL=oldSummary.providers.find((x:any)=>x.provider==='llm');
 const three={models:[{model:'Jev (jev-1.13.0)',...priorJ},{model:'GPT-5.6 Luna Medium',...priorL},
  {model:'GPT-6 Luna Medium',...overall,performance:perf}],
  transformations,consistencyReference:{jev:48,gpt56Luna:36,gpt6Luna:consistencySummary.actionAgreement.count,total:48}};
 await save(join(directory,'three-model-sensitivity.json'),three);
 const caseComparison=selected.map(({v})=>{const jev=oldDetails.find((x:any)=>x.variantId===v.id&&x.provider==='jev');
  const luna=oldDetails.find((x:any)=>x.variantId===v.id&&x.provider==='llm');
  const gpt6=details.find((x:any)=>x.variantId===v.id);
  return{sourceBaseCaseId:v.baseId,variantId:v.id,transformationType:v.variant,baseGoldAction:baseGold[v.baseId].correctAction,
   variantGoldAction:variantGold[v.id].correctAction,
   jev:{baseModelAction:jev?.baseModelAction,variantModelAction:jev?.variantModelAction,correct:jev?.variantGoldCorrect},
   gpt56Luna:{baseModelAction:luna?.baseModelAction,variantModelAction:luna?.variantModelAction,correct:luna?.variantGoldCorrect},
   gpt6Luna:{baseModelAction:gpt6?.baseModelAction,variantModelAction:gpt6?.variantModelAction,correct:gpt6?.variantGoldCorrect}};});
 await save(join(directory,'three-model-case-transitions.json'),caseComparison);
 const stability=[
  {model:'Jev (jev-1.13.0)',stability:{count:48,total:48},responsiveness:priorJ.correctRequiredActionChanges},
  {model:'GPT-5.6 Luna Medium',stability:{count:36,total:48},responsiveness:priorL.correctRequiredActionChanges},
  {model:'GPT-6 Luna Medium',stability:{count:consistencySummary.actionAgreement.count,total:48},responsiveness:overall.correctRequiredActionChanges}];
 await save(join(directory,'stability-responsiveness.json'),stability);
 await writeFile(join(directory,'three-model-sensitivity.md'),reportMarkdown(three,caseComparison,stability));
 const common=['HB-002','HB-013','HB-040','HB-073'].filter(id=>caseComparison.some(c=>c.sourceBaseCaseId===id)).map(id=>{const x=caseComparison.find(c=>c.sourceBaseCaseId===id)!;
  return{sourceBaseCaseId:id,variantId:x.variantId,variantGoldAction:x.variantGoldAction,jevCorrect:x.jev.correct,
   gpt56LunaCorrect:x.gpt56Luna.correct,gpt6LunaCorrect:x.gpt6Luna.correct,allThreeWrong:!x.jev.correct&&!x.gpt56Luna.correct&&!x.gpt6Luna.correct};});
 await save(join(directory,'common-failure-cases.json'),common);
 const observations:any[]=[];
 for(const x of common.filter(x=>x.allThreeWrong))observations.push({type:'future-human-review-candidate',caseId:x.sourceBaseCaseId,
  variantId:x.variantId,note:'All three models missed frozen Variant Gold. Review benchmark item interpretation for a future version; do not change Frozen v1 Gold or results.'});
 await save(join(directory,'post-run-observations.json'),{freezeHash:EXECUTION_FREEZE,datasetMutations:0,observations});
 manifest={...manifest,resolvedModels:[...new Set(rows.map(x=>x.modelResolved).filter(Boolean))],
  resolvedProcessingTiers:[...new Set(rows.map(x=>(x as any).processingTierResolved).filter(Boolean))],
  executionEndedAt:new Date().toISOString(),complete:summary.complete,apiErrors:perf.errors,retries:perf.retries};
 await save(join(directory,'manifest.json'),manifest);
 return{directory,summary,three,common,manifest};
}
