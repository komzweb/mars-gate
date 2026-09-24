import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { reverseKeys } from './dataset.ts';
import { buildState, decide, QUESTIONS } from './judgments.ts';
import { buildRequest, config, invoke } from './providers.ts';
import { fixtureFetch } from './runner.ts';
import { verifyExecutionFreeze, EXECUTION_FREEZE, BENCHMARK_MANIFEST_HASH } from './frozen-benchmark.ts';
import type { Answer, RunRecord, Scenario } from './types.ts';

const ROOT='results/benchmark-v1';
const GPT6_BASE='2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live';
const GPT6_REPEAT='2026-09-23T03-50-55-205Z-postfreeze-gpt6-repeatability-live-b14a31dc';
const OLD_CONSISTENCY='2026-09-23T03-14-34-775Z-frozen-consistency-v1-live-dfc8769b';
const MODEL='gpt-6-luna';
const IDS=Object.keys(QUESTIONS);
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fileHash=async(p:string)=>createHash('sha256').update(await readFile(p)).digest('hex');
const load=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const records=async(p:string)=>(await readFile(p,'utf8')).trim().split('\n').map(x=>JSON.parse(x) as RunRecord);
const save=async(p:string,x:unknown)=>writeFile(p,JSON.stringify(x,null,2)+'\n');
const label=(a:Answer)=>a.type==='noul'?a.noul!>=0.5:a.type==='choice'?a.choice:Number(Object.entries(a.probabilities!).sort((x,y)=>y[1]-x[1])[0][0]);
const pct=(x:number[],p:number)=>x.length?[...x].sort((a,b)=>a-b)[Math.ceil(x.length*p)-1]:null;
const state=(s:Scenario)=>s.variant==='information-order'?reverseKeys(buildState(s)):buildState(s);
function exceptSpecies(s:Scenario){const o=structuredClone(s.observable);delete (o.profile as any).type;return o;}
function detail(v:Scenario,r:RunRecord,b:RunRecord,g:any){
 const atomic=Object.fromEntries(IDS.map(id=>{const a=b.answers?.[id]??null,x=r.answers?.[id]??null;
  return[id,{gold:g.expected[id],baseOutput:a,variantOutput:x,baseHardLabel:a?label(a):null,variantHardLabel:x?label(x):null,
   hardLabelAgreement:a&&x?label(a)===label(x):null,variantGoldMatch:r.atomicMatches?.[id]??null,
   probabilityDelta:a&&x?(x.type==='noul'?{deltaPYes:x.noul!-a.noul!,absoluteDeltaPYes:Math.abs(x.noul!-a.noul!)}:
    {perKey:Object.fromEntries(Object.keys(x.probabilities!).map(k=>[k,x.probabilities![k]-a.probabilities![k]])),
     distributionL1:Object.keys(x.probabilities!).reduce((n,k)=>n+Math.abs(x.probabilities![k]-a.probabilities![k]),0)}):null}]}));
 const changedAtomicDecisions=IDS.filter(id=>atomic[id].hardLabelAgreement===false);
 return{baseCaseId:v.baseId,variantId:v.id,transformationType:v.variant,goldAction:g.correctAction,
  baseAction:b.decision?.action??null,variantAction:r.decision?.action??null,baseCorrect:b.correct,variantCorrect:r.correct,
  baseVariantActionAgreement:b.decision&&r.decision?b.decision.action===r.decision.action:null,
  baseDecisionRule:b.decision?.rule??null,variantDecisionRule:r.decision?.rule??null,atomic,changedAtomicDecisions,
  atomicAgreementCount:IDS.filter(id=>atomic[id].hardLabelAgreement===true).length,
  atomicChangedWithoutActionChange:!!b.decision&&!!r.decision&&b.decision.action===r.decision.action&&changedAtomicDecisions.length>0,
  latencyMs:r.latencyMs,usage:r.usage,estimatedCostUsd:r.estimatedCostUsd,error:r.error,retries:Math.max(0,r.attempts.length-1)};
}
function aggregate(rows:any[],n:number){
 const agreement=rows.filter(x=>x.baseVariantActionAgreement===true).length;
 const gold=rows.filter(x=>x.variantCorrect===true).length;
 const atomic=rows.reduce((a,x)=>a+x.atomicAgreementCount,0);
 return{variants:n,successful:rows.filter(x=>x.variantAction!==null).length,failed:rows.filter(x=>x.variantAction===null).length,
  actionAgreement:{count:agreement,total:n,rate:agreement/n},groundTruthAccuracy:{correct:gold,total:n,accuracy:gold/n},
  atomicAgreement:{count:atomic,total:n*8,rate:atomic/(n*8)},changedAtomicDecisions:rows.reduce((a,x)=>a+x.changedAtomicDecisions.length,0),
  incorrectVariants:rows.filter(x=>x.variantCorrect!==true).map(x=>x.variantId),
  atomicChangedButActionSame:rows.filter(x=>x.atomicChangedWithoutActionChange).map(x=>x.variantId)};
}
function performance(rows:RunRecord[]){
 const t=rows.filter(x=>x.status==='ok').map(x=>x.latencyMs);
 const token=(k:'inputTokens'|'cachedInputTokens'|'cacheWriteTokens'|'outputTokens'|'reasoningTokens')=>rows.reduce((n,x)=>n+(x.usage?.[k]??0),0);
 return{success:rows.filter(x=>x.status==='ok').length,failure:rows.filter(x=>x.status==='error').length,errors:rows.filter(x=>x.status==='error').length,
  retries:rows.reduce((n,x)=>n+Math.max(0,x.attempts.length-1),0),latencyMeanMs:t.length?t.reduce((a,b)=>a+b,0)/t.length:null,
  latencyP50Ms:pct(t,.5),latencyP95Ms:pct(t,.95),totalInferenceLatencyMs:rows.reduce((n,x)=>n+x.latencyMs,0),
  inputTokens:token('inputTokens'),cachedInputTokens:token('cachedInputTokens'),cacheWriteTokens:token('cacheWriteTokens'),
  outputTokens:token('outputTokens'),reasoningTokens:token('reasoningTokens'),
  knownEstimatedCostUsd:rows.reduce((n,x)=>n+(x.estimatedCostUsd??0),0),costComplete:rows.every(x=>x.costComplete),
  maximumInputTokens:Math.max(0,...rows.map(x=>x.usage?.inputTokens??0))};
}
function comparison(old:any,current:any){
 const models=[
  {model:'Jev (jev-1.13.0)',s:old.providers.find((x:any)=>x.provider==='jev')},
  {model:'GPT-5.6 Luna Medium',s:old.providers.find((x:any)=>x.provider==='llm')},
  {model:'GPT-6 Luna Medium',s:current}];
 return{models:models.map(({model,s})=>({model,actionAgreement:s.actionAgreement,variantGoldAccuracy:s.groundTruthAccuracy,
  atomicAgreement:s.atomicAgreement,allFamilyCorrect:s.allFamilyCorrect,performance:s.performance,
  transformations:Object.fromEntries(['paraphrase','information-order','irrelevant-information','species-swap'].map(type=>{
   const x=model==='GPT-6 Luna Medium'?current.transformations.find((v:any)=>v.transformationType===type):
    old.transformations.find((v:any)=>v.transformationType===type&&v.provider===(model.startsWith('Jev')?'jev':'llm'));
   return[type,{actionAgreement:x.actionAgreement,variantGoldAccuracy:x.groundTruthAccuracy,atomicAgreement:x.atomicAgreement,
    changedAtomicDecisions:x.changedAtomicDecisions,incorrectVariants:x.incorrectVariants}];}))})),
  interpretation:'Observed Base-to-Variant consistency is reported alongside same-input repeatability; a single action change does not establish a causal transformation effect.'};
}
function markdown(comp:any,summary:any,species:any[]){
 const out=['# Frozen v1 — GPT-6 Luna Medium observed consistency','','| Model | Action agreement | Variant Gold | Atomic agreement | All-family-correct |',
  '|---|---:|---:|---:|---:|'];
 for(const p of comp.models)out.push(`| ${p.model} | ${p.actionAgreement.count}/48 | ${p.variantGoldAccuracy.correct}/48 | ${p.atomicAgreement.count}/384 | ${p.allFamilyCorrect.count}/12 |`);
 out.push('','## Transformation comparison','','| Transformation | Model | Action agreement | Variant Gold | Atomic agreement | Changed atomic | Incorrect variants |',
  '|---|---|---:|---:|---:|---:|---|');
 for(const type of ['paraphrase','information-order','irrelevant-information','species-swap'])for(const p of comp.models){
  const x=p.transformations[type];out.push(`| ${type} | ${p.model} | ${x.actionAgreement.count}/12 | ${x.variantGoldAccuracy.correct}/12 | ${x.atomicAgreement.count}/96 | ${x.changedAtomicDecisions} | ${x.incorrectVariants.join(', ')||'none'} |`);
 }
 out.push('','## GPT-6 species-swap','','Frozen validation confirms only profile.type changed; the remaining observable evidence is identical.','',
  '| Source | Variant | Species | Action changed | Correctness changed | Atomic changed |','|---|---|---|---|---|---|');
 for(const x of species)out.push(`| ${x.baseCaseId} | ${x.variantId} | ${x.baseSpecies} → ${x.variantSpecies} | ${x.actionChanged?'yes':'no'} | ${x.correctnessChanged?'yes':'no'} | ${x.changedAtomicJudgments.join(', ')||'none'} |`);
 out.push('','## Repeatability reference','','GPT-6 same-input repeatability: 100/100 Gold Final Action, 20/20 families with 5/5 same action, mean modal agreement 100%. This 20-case baseline does not prove zero same-input variance for all 12 consistency families.','',
  'Observed Base→Variant differences are descriptive; they are not assigned a causal transformation effect. Full atomic outputs and probability deltas are saved in case-level.json.','');
 return out.join('\n')+'\n';
}

export async function runPostfreezeGpt6Consistency(options:{offline?:boolean;limit?:number;outputRoot?:string;onRecord?:(r:RunRecord)=>void}={}){
 const gate=await verifyExecutionFreeze();if(!gate.pass)throw new Error(`Frozen v1 gate failed: ${JSON.stringify(gate.mismatches)}`);
 if(gate.freeze.components.consistencyDesign!==hash(gate.manifest.consistency)||
  gate.freeze.components.consistencyVariants!==await fileHash('benchmark/v1/consistency-variants.json'))throw new Error('Consistency design/variants hash mismatch');
 const baseDir=join(ROOT,GPT6_BASE),repeatDir=join(ROOT,GPT6_REPEAT),oldDir=join(ROOT,OLD_CONSISTENCY);
 const [baseManifest,repeatManifest,evalConfig,baseRecords,repeatSummary,oldManifest,oldSummary,oldRecords,allCases,variants,gold]=await Promise.all([
  load(join(baseDir,'manifest.json')),load(join(repeatDir,'manifest.json')),load(join(baseDir,'external-model-config.json')),
  records(join(baseDir,'records.jsonl')),load(join(repeatDir,'summary.json')),load(join(oldDir,'manifest.json')),
  load(join(oldDir,'summary.json')),records(join(oldDir,'records.jsonl')),load('benchmark/v1/cases.json'),
  load('benchmark/v1/consistency-variants.json'),load('benchmark/v1/gold-proposed.json')]);
 const configHash=hash(evalConfig),configFileHash=await fileHash(join(baseDir,'external-model-config.json'));
 if(configHash!==baseManifest.externalModelConfigHash||configHash!==repeatManifest.externalModelConfigHash||
  configFileHash!==baseManifest.externalModelConfigFileHash||configFileHash!==repeatManifest.externalModelConfigFileHash)throw new Error('GPT-6 post-freeze evaluation config hash mismatch');
 if(baseManifest.executionFreezeHash!==EXECUTION_FREEZE||repeatManifest.executionFreezeHash!==EXECUTION_FREEZE||
  baseManifest.benchmarkManifestHash!==BENCHMARK_MANIFEST_HASH||repeatManifest.benchmarkManifestHash!==BENCHMARK_MANIFEST_HASH||
  !baseManifest.complete||!repeatManifest.complete||baseRecords.length!==120||repeatSummary.attempted!==100||repeatSummary.successful!==100)throw new Error('GPT-6 Base/Repeat provenance mismatch');
 if(evalConfig.modelId!==MODEL||evalConfig.reasoningEffort!=='medium'||evalConfig.processingTier!=='Standard'||
  evalConfig.apiEndpoint!=='https://api.openai.com/v1/chat/completions'||!evalConfig.promptSchemaCompatibility.all120RequestsExactApartFromModel)throw new Error('GPT-6 evaluation settings mismatch');
 if(oldManifest.executionFreezeHash!==EXECUTION_FREEZE||oldManifest.consistencyDesignHash!==gate.freeze.components.consistencyDesign||
  oldManifest.consistencyVariantsHash!==gate.freeze.components.consistencyVariants||!oldManifest.complete||oldRecords.length!==96)throw new Error('Prior consistency provenance mismatch');
 const types=['paraphrase','information-order','irrelevant-information','species-swap'];
 const sourceIds:string[]=gate.manifest.consistency.baseCaseIds;
 if(sourceIds.length!==12||variants.length!==48||gate.manifest.consistency.variantTypes.join()!==types.join())throw new Error('Expected 12 frozen families × 4 transformations');
 const baseById=new Map(baseRecords.map(x=>[x.caseId,x]));
 const oldById=new Map(oldRecords.filter(x=>x.provider==='llm').map(x=>[x.caseId,x]));
 const speciesEvidenceChecks:any[]=[];
 for(const id of sourceIds){const s:Scenario=allCases.find((x:Scenario)=>x.id===id);if(!s||!gold[id])throw new Error(`Missing source ${id}`);
  const family:Scenario[]=variants.filter((v:Scenario)=>v.baseId===id);
  if(family.length!==4||types.some(type=>family.filter(v=>v.variant===type).length!==1))throw new Error(`Invalid family ${id}`);
  const swap=family.find(v=>v.variant==='species-swap')!;
  if(hash(exceptSpecies(s))!==hash(exceptSpecies(swap))||s.observable.profile.type===swap.observable.profile.type)throw new Error(`Species-swap evidence mismatch: ${id}`);
  speciesEvidenceChecks.push({baseCaseId:id,variantId:swap.id,baseSpecies:s.observable.profile.type,variantSpecies:swap.observable.profile.type,decisionRelevantEvidencePreserved:true});
  const b=baseById.get(id);if(!b||b.status!=='ok'||b.correct!==true||b.stateHash!==hash(buildState(s))||JSON.stringify(b.groundTruth)!==JSON.stringify(gold[id]))throw new Error(`GPT-6 Base mismatch or error: ${id}`);
 }
 const preflight=variants.map((v:Scenario)=>{const st=state(v),req=buildRequest('llm',MODEL,st,'medium'),prior=oldById.get(v.id);
  if(!sourceIds.includes(v.baseId)||!types.includes(v.variant)||!prior||JSON.stringify(req)!==JSON.stringify({...prior.request,model:MODEL})||
   prior.stateHash!==hash(st)||JSON.stringify(prior.groundTruth)!==JSON.stringify(gold[v.baseId]))throw new Error(`Variant request/Gold mismatch: ${v.id}`);
  return{v,st,req};});
 if(!options.offline&&options.limit!==undefined)throw new Error('Live consistency requires all 48 variants');
 if(options.offline&&options.limit!==undefined&&(!Number.isInteger(options.limit)||options.limit<1||options.limit>48))throw new Error('Invalid offline limit');
 const selected=options.limit?preflight.slice(0,options.limit):preflight;
 const providerSource=await readFile('src/providers.ts','utf8');
 if(!providerSource.includes('https://api.openai.com/v1/chat/completions'))throw new Error('OpenAI API route changed');
 const baseConfig=config('llm'),pricing=evalConfig.pricingAssumptions;
 const c={...baseConfig,model:MODEL,reasoningEffort:'medium' as const,price:{input:pricing.input,cachedInput:pricing.cachedInput,cacheWrite:pricing.cacheWrite,output:pricing.output},pricingAssumptions:pricing};
 if(!options.offline&&!c.key)throw new Error('Missing OPENAI_API_KEY');
 const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-postfreeze-gpt6-consistency-${options.offline?'offline':'live'}-${randomUUID().slice(0,8)}`;
 const directory=join(options.outputRoot??ROOT,runId);await mkdir(directory,{recursive:true});
 let manifest:any={schemaVersion:1,runId,suite:'postfreeze-gpt6-consistency',mode:options.offline?'offline-fixture':'live',benchmarkVersion:'v1',
  executionFreezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,consistencyDesignHash:gate.freeze.components.consistencyDesign,
  consistencyVariantsHash:gate.freeze.components.consistencyVariants,casesHash:gate.freeze.components.cases,goldHash:gate.freeze.components.gold,
  judgmentsSourceHash:gate.freeze.components.judgmentsSource,humanReviewStatus:gate.freeze.humanReviewStatus,
  externalModelConfigHash:configHash,externalModelConfigFileHash:configFileHash,gpt6BaseRunId:GPT6_BASE,gpt6RepeatabilityRunId:GPT6_REPEAT,
  previousConsistencyRunId:OLD_CONSISTENCY,gpt6BaseRecordsFileHash:await fileHash(join(baseDir,'records.jsonl')),
  gpt6RepeatabilitySummaryFileHash:await fileHash(join(repeatDir,'summary.json')),previousConsistencySummaryFileHash:await fileHash(join(oldDir,'summary.json')),
  previousResultsReadOnly:true,sourceCaseIds:sourceIds,variantIds:selected.map(x=>x.v.id),transformationTypes:types,
  requestedModel:MODEL,resolvedModels:[],reasoningEffort:'medium',processingTier:'Standard',pricingAssumptions:pricing,
  speciesEvidenceChecks,executionStartedAt:new Date().toISOString(),executionEndedAt:null,excludedFromBaseAccuracy:true,
  apiErrorRetryPolicy:'Existing invoke policy; retry 429/500/502/503/504/529 once, retain every attempt and failure.',
  interpretation:'Observed Base-to-Variant consistency; repeatability is separate and does not establish a causal transformation effect.',complete:false};
 await save(join(directory,'manifest.json'),manifest);
 const rows:RunRecord[]=[];
 for(const {v,st,req} of selected){
  const response=await invoke(c,req,options.offline?fixtureFetch('llm'):fetch);
  const decision=response.answers?decide(response.answers):null,g=gold[v.baseId];
  const r:RunRecord={schemaVersion:1,runId,mode:options.offline?'offline-fixture':'live',caseId:v.id,baseId:v.baseId,variant:v.variant,
   provider:'llm',modelRequested:MODEL,reasoningEffort:'medium',stateHash:hash(st),request:req,groundTruth:g,decision,
   correct:decision?decision.action===g.correctAction:null,
   atomicMatches:response.answers?Object.fromEntries(IDS.map(id=>[id,label(response.answers![id])===g.expected[id]])):null,
   status:response.answers?'ok':'error',startedAt:new Date().toISOString(),firstAttemptLatencyMs:response.attempts[0]?.latencyMs??0,...response};
  (r as any).processingTierRequested='Standard';(r as any).processingTierResolved=response.attempts.at(-1)?.rawResponse?.service_tier??null;
  rows.push(r);await appendFile(join(directory,'records.jsonl'),JSON.stringify(r)+'\n');options.onRecord?.(r);
  if(response.attempts.some(a=>[401,402,403].includes(a.status!)))break;
 }
 const details=selected.map(({v})=>{const r=rows.find(x=>x.caseId===v.id);return r?detail(v,r,baseById.get(v.baseId)!,gold[v.baseId]):null}).filter(Boolean);
 const overall=aggregate(details,selected.length);
 const families=sourceIds.map(id=>{const b=baseById.get(id)!;const variantsFor=details.filter((x:any)=>x.baseCaseId===id);
  return{baseCaseId:id,goldAction:gold[id].correctAction,baseAction:b.decision?.action??null,baseCorrect:b.correct,
   variants:variantsFor,allFamilyCorrect:b.correct===true&&variantsFor.length===4&&variantsFor.every((x:any)=>x.variantCorrect===true)};});
 const transformations=types.map(type=>({transformationType:type,...aggregate(details.filter((x:any)=>x.transformationType===type),12)}));
 const atomic=Object.fromEntries(IDS.map(id=>{const agreement=details.filter((x:any)=>x.atomic[id].hardLabelAgreement===true).length;
  const correct=details.filter((x:any)=>x.atomic[id].variantGoldMatch===true).length;
  const changed=details.filter((x:any)=>x.atomic[id].hardLabelAgreement===false).map((x:any)=>x.variantId);
  return[id,{baseVariantHardLabelAgreement:{count:agreement,total:48,rate:agreement/48},
   variantGroundTruthAccuracy:{correct,total:48,accuracy:correct/48},changedAtomicDecisions:changed.length,changedVariantIds:changed}]}));
 const species=speciesEvidenceChecks.map(check=>{const d=details.find((x:any)=>x.variantId===check.variantId);
  return{...check,baseAction:d?.baseAction??null,variantAction:d?.variantAction??null,actionChanged:d?.baseVariantActionAgreement===false,
   baseCorrect:d?.baseCorrect??null,variantCorrect:d?.variantCorrect??null,correctnessChanged:d?.baseCorrect!==d?.variantCorrect,
   changedAtomicJudgments:d?.changedAtomicDecisions??[]};});
 const perf=performance(rows);
 const summary={benchmarkVersion:'v1',suite:'postfreeze-gpt6-consistency',executionFreezeHash:EXECUTION_FREEZE,externalModelConfigHash:configHash,
  consistencyDesignHash:gate.freeze.components.consistencyDesign,consistencyVariantsHash:gate.freeze.components.consistencyVariants,
  sourceFamilies:12,variants:selected.length,expectedRequests:selected.length,requestRecords:rows.length,complete:rows.length===selected.length,
  ...overall,transitions:{correctBaseToIncorrectVariant:details.filter((x:any)=>x.baseCorrect===true&&x.variantCorrect!==true).length,
   incorrectBaseToCorrectVariant:details.filter((x:any)=>x.baseCorrect===false&&x.variantCorrect===true).length,
   baseVariantBothCorrect:details.filter((x:any)=>x.baseCorrect===true&&x.variantCorrect===true).length,
   baseVariantBothIncorrect:details.filter((x:any)=>x.baseCorrect===false&&x.variantCorrect===false).length},
  allFamilyCorrect:{count:families.filter(x=>x.allFamilyCorrect).length,total:12},transformations,
  variantAtomicGoldAccuracy:{correct:IDS.reduce((n,id)=>n+atomic[id].variantGroundTruthAccuracy.correct,0),total:selected.length*IDS.length,
   accuracy:IDS.reduce((n,id)=>n+atomic[id].variantGroundTruthAccuracy.correct,0)/(selected.length*IDS.length)},
  atomic,performance:perf,
  repeatabilityReference:{sourceRunId:GPT6_REPEAT,finalCorrect:repeatSummary.finalCorrect,successful:repeatSummary.successful,
   exactRepeatabilityCases:repeatSummary.exactRepeatabilityCases,meanModalAgreement:repeatSummary.meanModalAgreement,
   note:'Same-input baseline is a separate 20-case sample, not a causal adjustment to observed consistency.'}};
 await save(join(directory,'summary.json'),summary);
 await save(join(directory,'case-level.json'),details);
 await save(join(directory,'family-report.json'),families);
 await save(join(directory,'species-swap-report.json'),species);
 await save(join(directory,'atomic-consistency-report.json'),{overall:atomic,
  atomicChangedButActionSame:overall.atomicChangedButActionSame,caseLevel:details.map((x:any)=>({variantId:x.variantId,changedAtomicDecisions:x.changedAtomicDecisions,atomicAgreementCount:x.atomicAgreementCount}))});
 const three=comparison(oldSummary,summary);
 await save(join(directory,'three-model-consistency.json'),three);
 await writeFile(join(directory,'three-model-consistency.md'),markdown(three,summary,species));
 await save(join(directory,'post-run-observations.json'),{freezeHash:EXECUTION_FREEZE,datasetMutations:0,observations:[]});
 manifest={...manifest,resolvedModels:[...new Set(rows.map(x=>x.modelResolved).filter(Boolean))],
  resolvedProcessingTiers:[...new Set(rows.map(x=>(x as any).processingTierResolved).filter(Boolean))],
  executionEndedAt:new Date().toISOString(),complete:summary.complete,apiErrors:perf.errors,retries:perf.retries};
 await save(join(directory,'manifest.json'),manifest);
 return{directory,summary,three,manifest};
}
