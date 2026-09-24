import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { verifyExecutionFreeze, EXECUTION_FREEZE, BENCHMARK_MANIFEST_HASH } from '../src/frozen-benchmark.ts';
import { ACTIONS, JUDGMENTS, SENSITIVITY_TYPES, TRANSFORMS, atomicFinalAnalysis, baseMetrics, consistencyMetrics, hard, repeatMetrics, sensitivityMetrics } from '../src/final-analysis-audit.ts';
import type { RunRecord } from '../src/types.ts';

const ROOT='results/benchmark-v1',OUT=join(ROOT,'final-analysis');
const PATHS={
 originalBase:'2026-09-23T02-04-26-591Z-frozen-benchmark-v1-live',
 originalRepeat:'2026-09-23T02-35-43-756Z-frozen-repeatability-v1-live-c192f906',
 originalConsistency:'2026-09-23T03-14-34-775Z-frozen-consistency-v1-live-dfc8769b',
 originalSensitivity:'2026-09-23T03-24-25-696Z-frozen-sensitivity-v1-live-633b0297',
 gpt6Base:'2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live',
 gpt6Repeat:'2026-09-23T03-50-55-205Z-postfreeze-gpt6-repeatability-live-b14a31dc',
 gpt6Consistency:'2026-09-23T04-11-23-084Z-postfreeze-gpt6-consistency-live-c003b8cb',
 gpt6Sensitivity:'2026-09-23T04-32-50-871Z-postfreeze-gpt6-sensitivity-live-bc20da56',
} as const;
const MODELS=['Jev','GPT-5.6 Luna Medium','GPT-6 Luna Medium'];
const sha=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
const load=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const save=async(p:string,x:unknown)=>writeFile(p,JSON.stringify(x,null,2)+'\n');
const csv=(rows:Record<string,unknown>[])=>{
 const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
 const cell=(x:unknown)=>{const s=x===null||x===undefined?'':typeof x==='object'?JSON.stringify(x):String(x);return /[",\n]/.test(s)?'\"'+s.replaceAll('\"','\"\"')+'\"':s;};
 return[keys.join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\n')+'\n';
};
async function readRun(id:keyof typeof PATHS){
 const path=join(ROOT,PATHS[id]),manifest=await load(join(path,'manifest.json')),summary=await load(join(path,'summary.json'));
 const rawBytes=await readFile(join(path,'records.jsonl'));
 const rows=rawBytes.toString('utf8').trim().split('\n').map(x=>JSON.parse(x) as RunRecord);
 return{id,path,manifest,summary,rows,rawHash:sha(rawBytes)};
}
function equal(a:any,b:any){return typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<=1e-8:a===b;}
function auditCheck(list:any[],name:string,recomputed:any,saved:any){
 list.push({metric:name,status:equal(recomputed,saved)?'MATCH':'MISMATCH',recomputed,saved});
}
function auditSuite(list:any[],model:string,suite:string,m:any,s:any){
 const n=(k:string,a:any,b:any)=>auditCheck(list,`${model}.${suite}.${k}`,a,b);
 if(suite==='base'){
  n('attempted',m.attempted,s.attempted);n('successful',m.successful,s.successful);n('finalCorrect',m.finalCorrect,s.finalCorrect);
  n('atomicCorrect',m.atomic.correct,s.overallAtomicAccuracy.correct);
  for(const a of ACTIONS){n(`recall.${a}`,m.recall[a].correct,s.recall[a].correct);
   for(const pred of [...ACTIONS,'ERROR'])n(`confusion.${a}.${pred}`,m.confusionMatrix[a][pred],s.confusionMatrix[a][pred]);}
  for(const q of JUDGMENTS)n(`atomic.${q}`,m.atomic.byJudgment[q].correct,s.atomicByJudgment[q].correct);
 }else if(suite==='repeatability'){
  n('attempted',m.attempted,s.attempted??s.requestRecords);n('successful',m.successful,s.successful);
  n('finalCorrect',m.finalCorrect,s.finalCorrect);n('all5Cases',m.all5Cases,s.exactRepeatabilityCases);
  n('meanModalAgreement',m.meanModalAgreement,s.meanModalAgreement);
  for(const q of JUDGMENTS){n(`atomicAll5.${q}`,m.atomic[q].all5AgreementCases,s.atomic[q].all5AgreementCases);
   n(`atomicGold.${q}`,m.atomic[q].goldCorrect,s.atomic[q].groundTruthMatches);}
 }else if(suite==='consistency'){
  n('actionAgreement',m.actionAgreement,s.actionAgreement.count);n('goldCorrect',m.goldCorrect,s.groundTruthAccuracy.correct);
  n('atomicAgreement',m.atomicAgreement,s.atomicAgreement.count);n('allFamilyCorrect',m.allFamilyCorrect,s.allFamilyCorrect.count);
  for(const t of TRANSFORMS){const x=m.transformations[t],y=s.transformations.find((v:any)=>v.transformationType===t);
   n(`transform.${t}.action`,x.actionAgreement,y.actionAgreement.count);
   n(`transform.${t}.gold`,x.goldCorrect,y.groundTruthAccuracy.correct);
   n(`transform.${t}.atomic`,x.atomicAgreement,y.atomicAgreement.count);}
 }else{
  n('variantGold',m.variantGoldCorrect,s.variantGoldAccuracy.correct);
  n('correctActionChange',m.correctActionChange,s.correctRequiredActionChanges.count);
  n('expectedAtomic',m.expectedAtomic,s.atomic.expectedChanged);
  n('correctExpectedAtomic',m.correctExpectedAtomic,s.atomic.correctlyChangedExactGoldTransition);
  n('missedExpectedAtomic',m.missedExpectedAtomic,s.atomic.missedExpectedChanges);
  n('wrongDirectionAtomic',m.wrongDirectionAtomic,s.atomic.wrongDirectionChanges);
  n('unexpectedAtomic',m.unexpectedAtomic,s.atomic.unexpectedChanges);
  for(const t of SENSITIVITY_TYPES){const x=m.transformations[t],y=s.transformations.find((v:any)=>v.transformationType===t);
   for(const [key,a,b] of [['gold',x.variantGoldCorrect,y.variantGoldAccuracy.correct],['action',x.correctActionChange,y.correctRequiredActionChanges.count],
    ['expected',x.correctExpectedAtomic,y.atomic.correctlyChangedExactGoldTransition],['missed',x.missedExpectedAtomic,y.atomic.missedExpectedChanges],
    ['wrong',x.wrongDirectionAtomic,y.atomic.wrongDirectionChanges],['unexpected',x.unexpectedAtomic,y.atomic.unexpectedChanges]] as any[])n(`transform.${t}.${key}`,a,b);}
 }
 const p=s.performance;
 n('latencyMeanMs',m.performance.latencyMeanMs,p.latencyMeanMs);n('latencyP50Ms',m.performance.latencyP50Ms,p.latencyP50Ms);
 n('latencyP95Ms',m.performance.latencyP95Ms,p.latencyP95Ms);
 for(const k of ['inputTokens','cachedInputTokens','cacheWriteTokens','outputTokens','reasoningTokens','retries'] as const)n(k,m.performance[k],p[k]);
 n('apiErrors',m.performance.errors,p.apiErrors??p.errors);
 n('costUsd',m.performance.knownEstimatedCostUsd,p.totalEstimatedCostUsd??p.knownEstimatedCostUsd);
 n('costComplete',m.performance.costComplete,p.costComplete);
}
function inventory(runs:any[]){
 return runs.map(run=>({runKey:run.id,path:run.path,manifestPath:join(run.path,'manifest.json'),
  rawRecordsPath:join(run.path,'records.jsonl'),rawRecordsSha256:run.rawHash,
  suite:run.manifest.suite,mode:run.manifest.mode,requestCount:run.rows.length,
  providers:[...new Set(run.rows.map((r:RunRecord)=>r.provider))],
  requestedModels:[...new Set(run.rows.map((r:RunRecord)=>r.modelRequested))],
  resolvedModels:[...new Set(run.rows.map((r:RunRecord)=>r.modelResolved).filter(Boolean))],
  modelSettings:run.manifest.modelSettings??{model:run.manifest.requestedModel,reasoningEffort:run.manifest.reasoningEffort,
   processingTier:run.manifest.processingTier,apiEndpoint:'https://api.openai.com/v1/chat/completions'},
  pricingAssumptions:run.manifest.pricingAssumptions??null,
  reasoningEfforts:[...new Set(run.rows.map((r:RunRecord)=>r.reasoningEffort))],
  processingTiers:[...new Set(run.rows.map((r:RunRecord)=>(r as any).processingTierResolved).filter(Boolean))],
  startedAt:run.manifest.executionStartedAt,endedAt:run.manifest.executionEndedAt,
  executionFreezeHash:run.manifest.executionFreezeHash,benchmarkManifestHash:run.manifest.benchmarkManifestHash,
  gpt6ExternalConfigHash:run.manifest.externalModelConfigHash??null,complete:run.manifest.complete}));
}
function compactAnswer(a:any){if(!a)return 'ERROR';if(a.type==='noul')return`P(Yes)=${a.noul}`;
 return a.type==='choice'?`${a.choice}; ${JSON.stringify(a.probabilities)}`:`score=${a.score}; ${JSON.stringify(a.probabilities)}`;}
function reviewData(ids:string[],allCases:any[],variants:any[],bg:any,vg:any,baseRows:RunRecord[][],sensRows:RunRecord[][]){
 return ids.map(id=>{const b=allCases.find(x=>x.id===id),v=variants.find(x=>x.baseId===id);
  const providers=MODELS.map((model,i)=>({model,base:baseRows[i].find(r=>r.caseId===id),
   variant:sensRows[i].find(r=>r.caseId===v.id)}));
  return{caseId:id,variantId:v.id,transformationType:v.variant,baseObservable:b.observable,variantObservable:v.observable,
   baseGold:bg[id],variantGold:vg[v.id],
   providers:providers.map(x=>({model:x.model,baseAction:x.base?.decision?.action,baseRule:x.base?.decision?.rule,
    variantAction:x.variant?.decision?.action,variantRule:x.variant?.decision?.rule,
    baseAnswers:x.base?.answers,variantAnswers:x.variant?.answers,
    variantAtomicMatches:x.variant?.atomicMatches}))};
 });
}
const REVIEWS:Record<string,{conclusion:string;confidence:string;interpretations:Record<string,{for:string;against:string}>;futureV2:string}>={
 'HB-002':{conclusion:'The added signed correction supports an innocent explanation, but the unchanged interview does not directly answer whether payment will be received. Frozen CLEAR relies on answer_completeness=complete and on a generic correction that does not specify the payment amount. This is a substantial item/annotation ambiguity; Q2 remains a defensible QUESTION under the fixed rules.',confidence:'high',
  interpretations:{A:{for:'An independent signed correction is new evidence supporting the entrant’s explanation.',against:'All three systems continued to see an unanswered or incomplete payment question; the correction is generic.'},
   B:{for:'The explanation_supported question may mark the correction as supported, but answer_completeness separately asks whether the explicit payment question was answered.',against:'The eight questions can express both facts; the difficulty is how the frozen labels were assigned.'},
   C:{for:'Q2 fires after the contradiction is resolved when partial/evasive probability remains high.',against:'The rule faithfully implements its fixed incomplete-answer policy; changing it would be post-hoc tuning.'},
   D:{for:'The interview answer is unchanged and does not explicitly state whether payment occurs; a generic correction may not settle that fact.',against:'The authenticated correction explicitly says it resolves the discrepancy, which can support CLEAR.'}},
  futureV2:'Specify the correction’s concrete payment finding and separately adjudicate answer_completeness before freezing.'},
 'HB-013':{conclusion:'Removing the lodging-contact document does not change the explicitly evasive interview answer. Variant Gold switches answer_completeness from evasive to complete despite identical question and answer. Under the frozen question and Q2 rule, QUESTION is strongly supported; this is a high-priority future item review, without changing v1 Gold.',confidence:'high',
  interpretations:{A:{for:'The document requirement disappears, reducing one concern.',against:'The unanswered name and dome-address question remains exactly the same.'},
   B:{for:'The frozen atomic Gold changes answer_completeness even though the question/answer pair does not; this is an annotation-versus-definition mismatch.',against:'If completeness were interpreted as only relevant required information, document deletion might matter, but that is not the fixed definition.'},
   C:{for:'All three models assign evasive responses and Q2 maps them to QUESTION.',against:'The mapping is consistent with the fixed rule rather than an implementation defect.'},
   D:{for:'CLEAR is difficult to justify with the unchanged reassurance in place of name and address.',against:'No remaining document mandates a lodging contact, so a narrower policy could allow CLEAR.'}},
  futureV2:'Re-adjudicate the atomic label against the exact interview question; if the test is about deleting a requirement, change the interview evidence in a separately designed v2 item.'},
 'HB-040':{conclusion:'The polarity-flip variant removes authenticated credential-alteration evidence but replaces it with unrelated inert-sample evidence while the entrant still says the credential is genuine and admits a change outside the issuer process. DENY is no longer authenticated, yet the remaining semantic tension can justify QUESTION under Q1. Frozen CLEAR appears overly narrow for this observable state.',confidence:'medium',
  interpretations:{A:{for:'Models correctly lower altered_identity from confirmed status after authenticated proof disappears.',against:'The remaining interview and declaration can still conflict, so the task is not only detecting evidence polarity.'},
   B:{for:'The material_contradiction judgment remains relevant and all three systems assign enough weight to trigger Q1.',against:'The existing atomic questions can represent the situation; the issue is partly the variant composition and Gold.'},
   C:{for:'Q1 maps a material unexplained contradiction to QUESTION, preventing CLEAR.',against:'The fixed mapping behaves as intended if the contradiction label is accepted.'},
   D:{for:'The variant keeps credential claims but substitutes a pathogen assay unrelated to the credential; QUESTION is a reasonable action.',against:'Neither authenticated record nor scan now proves post-issuance alteration, so DENY must fall away and CLEAR is arguable if entrant claims are treated as nonconflicting.'}},
  futureV2:'Use a true credential-evidence polarity reversal while keeping the evidence domain fixed; independently adjudicate material_contradiction.'},
 'HB-073':{conclusion:'Removing authenticated alteration evidence correctly blocks DENY. The variant still has an unresolved credential-image difference; all three systems select INSPECT through physical_concern, whereas frozen Gold says QUESTION. Whether credential identity uncertainty counts as a physical concern under the current question is the central review issue.',confidence:'medium',
  interpretations:{A:{for:'Confirmed alteration becomes unconfirmed, and all three systems respond by leaving DENY.',against:'Their INSPECT choice may be reasonable under the existing physical-concern question rather than a failed semantic update.'},
   B:{for:'The physical_concern wording focuses on carried-item identity/contents/capability but does not explicitly distinguish credential-image uncertainty from verbal identity clarification.',against:'A credential is a carried physical item, making physical inspection plausible under the current wording.'},
   C:{for:'I1 takes priority over Q1 when physical_concern exceeds 0.65; all three variant outputs do so.',against:'The rule is the fixed intended priority, so the issue is the scope of physical_concern rather than a code defect.'},
   D:{for:'The unavailable prior image and unauthenticated difference reasonably support INSPECT as well as QUESTION.',against:'The frozen Gold treats this as a semantic clarification only, consistent with a narrower credential-specific interpretation.'}},
  futureV2:'Clarify whether uncertain credential identity is a physical concern, then design separate QUESTION and INSPECT examples before freezing.'},
};
function reviewMarkdown(data:any[]){
 const out=['# Frozen v1 sensitivity: four-case post-hoc review','','This is interpretation support after observing all model outputs. It does not change frozen Gold, scoring, questions, rules, or raw results. A–D are competing explanations, not causal findings.',''];
 for(const d of data){const v=REVIEWS[d.caseId];
  out.push(`## ${d.caseId} / ${d.variantId}`,'',`Transformation: ${d.transformationType}. Frozen Gold: ${d.baseGold.correctAction} → ${d.variantGold.correctAction}.`,'',
   '### Base observable evidence','','```json\n'+JSON.stringify(d.baseObservable,null,2)+'\n```','',
   '### Variant observable evidence','','```json\n'+JSON.stringify(d.variantObservable,null,2)+'\n```','',
   '### Frozen Gold','',`Base rationale: ${d.baseGold.rationaleJa}`,`Variant rationale: ${d.variantGold.rationaleJa}`,'',
   '| Judgment | Base Gold | Variant Gold | Jev Base → Variant | GPT-5.6 Base → Variant | GPT-6 Base → Variant |','|---|---|---|---|---|---|');
  for(const q of JUDGMENTS)out.push(`| ${q} | ${JSON.stringify(d.baseGold.expected[q])} | ${JSON.stringify(d.variantGold.expected[q])} | ${compactAnswer(d.providers[0].baseAnswers[q])} → ${compactAnswer(d.providers[0].variantAnswers[q])} | ${compactAnswer(d.providers[1].baseAnswers[q])} → ${compactAnswer(d.providers[1].variantAnswers[q])} | ${compactAnswer(d.providers[2].baseAnswers[q])} → ${compactAnswer(d.providers[2].variantAnswers[q])} |`);
  out.push('','Shared final-action rule results:');
  for(const p of d.providers)out.push(`- ${p.model}: ${p.baseAction} (${p.baseRule}) → ${p.variantAction} (${p.variantRule}).`);
  out.push('','### Competing interpretations','');
  for(const [k,x] of Object.entries(v.interpretations))out.push(`- ${k}: supporting evidence — ${x.for} Against — ${x.against}`);
  out.push('',`Review conclusion (${v.confidence} confidence): ${v.conclusion}`,'',`Future v2 candidate: ${v.futureV2}`,'');
 }
 return out.join('\n')+'\n';
}

export async function generateFinalAnalysis(){
 const gate=await verifyExecutionFreeze();if(!gate.pass)throw new Error(`Frozen integrity FAIL: ${JSON.stringify(gate.mismatches)}`);
 const keys=Object.keys(PATHS) as (keyof typeof PATHS)[];
 const runs=Object.fromEntries(await Promise.all(keys.map(async k=>[k,await readRun(k)]))) as Record<keyof typeof PATHS,any>;
 const requiredCounts={originalBase:240,originalRepeat:200,originalConsistency:96,originalSensitivity:18,
  gpt6Base:120,gpt6Repeat:100,gpt6Consistency:48,gpt6Sensitivity:9};
 for(const k of keys){const run=runs[k];
  if(run.rows.length!==requiredCounts[k]||!run.manifest.complete||run.manifest.mode!=='live'||run.manifest.executionFreezeHash!==EXECUTION_FREEZE||
   run.manifest.benchmarkManifestHash!==BENCHMARK_MANIFEST_HASH)throw new Error(`Run provenance/count FAIL: ${k}`);
  if(run.rows.some((r:RunRecord)=>r.request&&JSON.stringify(r.request).includes('correctAction')))throw new Error(`Gold leaked to request: ${k}`);
 }
 const cfg=await load(join(runs.gpt6Base.path,'external-model-config.json')),configHash=sha(JSON.stringify(cfg));
 for(const k of ['gpt6Base','gpt6Repeat','gpt6Consistency','gpt6Sensitivity'] as const)
  if(runs[k].manifest.externalModelConfigHash!==configHash)throw new Error(`GPT-6 config mismatch: ${k}`);
 const [cases,bg,cv,sv,vg]=await Promise.all(['cases.json','gold-proposed.json','consistency-variants.json','sensitivity-variants.json','sensitivity-gold-proposed.json'].map(p=>load(join('benchmark/v1',p))));
 const subset:string[]=gate.manifest.repeatability.caseIds,sourceIds:string[]=gate.manifest.consistency.baseCaseIds;
 const filter=(rows:RunRecord[],provider:string)=>rows.filter(r=>r.provider===provider);
 const bases=[filter(runs.originalBase.rows,'jev'),filter(runs.originalBase.rows,'llm'),runs.gpt6Base.rows];
 const repeats=[filter(runs.originalRepeat.rows,'jev'),filter(runs.originalRepeat.rows,'llm'),runs.gpt6Repeat.rows];
 const consistencies=[filter(runs.originalConsistency.rows,'jev'),filter(runs.originalConsistency.rows,'llm'),runs.gpt6Consistency.rows];
 const sensitivities=[filter(runs.originalSensitivity.rows,'jev'),filter(runs.originalSensitivity.rows,'llm'),runs.gpt6Sensitivity.rows];
 const metrics=MODELS.map((model,i)=>({model,base:baseMetrics(bases[i]),repeatability:repeatMetrics(repeats[i],subset),
  consistency:consistencyMetrics(consistencies[i],bases[i],sourceIds,cv),
  sensitivity:sensitivityMetrics(sensitivities[i],bases[i],sv,bg,vg)}));
 const audit:any[]=[];
 for(let i=0;i<3;i++){
  const old=i<2,idx=i;
  auditSuite(audit,MODELS[i],'base',metrics[i].base,old?runs.originalBase.summary.providers[idx]:runs.gpt6Base.summary);
  auditSuite(audit,MODELS[i],'repeatability',metrics[i].repeatability,old?runs.originalRepeat.summary.providers[idx]:runs.gpt6Repeat.summary);
  const consSaved=old?runs.originalConsistency.summary.providers[idx]:runs.gpt6Consistency.summary;
  auditSuite(audit,MODELS[i],'consistency',metrics[i].consistency,
   {...consSaved,transformations:old?runs.originalConsistency.summary.transformations.filter((x:any)=>x.provider===(i===0?'jev':'llm')):runs.gpt6Consistency.summary.transformations});
  const sensSaved=old?runs.originalSensitivity.summary.providers[idx]:runs.gpt6Sensitivity.summary;
  auditSuite(audit,MODELS[i],'sensitivity',metrics[i].sensitivity,
   {...sensSaved,transformations:old?runs.originalSensitivity.summary.transformations.filter((x:any)=>x.provider===(i===0?'jev':'llm')):runs.gpt6Sensitivity.summary.transformations});
 }
 const mismatch=audit.filter(x=>x.status==='MISMATCH');
 const developmentHistory=await readFile('docs/development-history.md','utf8');
 const developmentHistoryPass=developmentHistory.includes('GPT-5.6 Sol Medium')&&developmentHistory.includes('GPT-6 Sol Medium')&&
  developmentHistory.includes('Post-freeze external model evaluation');
 const inventoryRows=inventory(keys.map(k=>runs[k]));
 await mkdir(OUT,{recursive:true});
 await save(join(OUT,'source-inventory.json'),{freezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,
  postFreezeConfigHash:configHash,runs:inventoryRows});
 await save(join(OUT,'independent-audit.json'),{status:mismatch.length?'FAIL':'PASS',checks:audit.length,mismatches:mismatch.length,
  freezePass:true,componentMismatches:gate.mismatches,developmentHistoryPass,results:audit});
 await writeFile(join(OUT,'audit-comparison.csv'),csv(audit));
 const atomicAnalyses=MODELS.map((model,i)=>({model,...atomicFinalAnalysis(bases[i])}));
 await save(join(OUT,'atomic-final-action-replay.json'),atomicAnalyses);
 const by=(rows:RunRecord[])=>new Map(rows.map(r=>[r.caseId,r]));
 const baseMaps=bases.map(by);
 const differences=cases.map((c:any)=>{const r=baseMaps.map(m=>m.get(c.id)!);
  const actions=r.map(x=>x.decision?.action??'ERROR');
  return{caseId:c.id,goldAction:bg[c.id].correctAction,actions:Object.fromEntries(MODELS.map((m,i)=>[m,actions[i]])),
   correct:Object.fromEntries(MODELS.map((m,i)=>[m,r[i].correct])),actionDisagreement:new Set(actions).size>1};});
 const changed56to6=differences.filter((x:any)=>x.correct[MODELS[1]]===false&&x.correct[MODELS[2]]===true).map((x:any)=>{
  const a=baseMaps[1].get(x.caseId)!,z=baseMaps[2].get(x.caseId)!;
  const changes=JUDGMENTS.filter(q=>hard(a.answers![q])!==hard(z.answers![q]));
  return{caseId:x.caseId,goldAction:x.goldAction,gpt56Action:a.decision?.action,gpt6Action:z.decision?.action,
   changedJudgments:changes,correctnessImproved:changes.filter(q=>hard(a.answers![q])!==bg[x.caseId].expected[q]&&hard(z.answers![q])===bg[x.caseId].expected[q]),
   correctnessWorsened:changes.filter(q=>hard(a.answers![q])===bg[x.caseId].expected[q]&&hard(z.answers![q])!==bg[x.caseId].expected[q])};});
 const judgementImprovement=Object.fromEntries(JUDGMENTS.map(q=>[q,{hardLabelChanged:changed56to6.filter(x=>x.changedJudgments.includes(q)).length,
  improved:changed56to6.filter(x=>x.correctnessImproved.includes(q)).length,worsened:changed56to6.filter(x=>x.correctnessWorsened.includes(q)).length}]));
 const ratios=[{pair:'Jev / GPT-5.6 Luna',a:metrics[0],b:metrics[1]},{pair:'Jev / GPT-6 Luna',a:metrics[0],b:metrics[2]},
  {pair:'GPT-5.6 Luna / GPT-6 Luna',a:metrics[1],b:metrics[2]}].map(({pair,a,b})=>({
   pair,latencyP50RatioAOverB:a.base.performance.latencyP50Ms!/b.base.performance.latencyP50Ms!,
   latencyMeanRatioAOverB:a.base.performance.latencyMeanMs!/b.base.performance.latencyMeanMs!,
   totalCostRatioAOverB:a.base.performance.knownEstimatedCostUsd/b.base.performance.knownEstimatedCostUsd}));
 const allThreeSensitivityMissIds=sv.filter((v:any)=>sensitivities.every(rows=>rows.find(r=>r.caseId===v.id)?.correct===false)).map((v:any)=>v.baseId);
 if(JSON.stringify([...allThreeSensitivityMissIds].sort())!==JSON.stringify(['HB-002','HB-013','HB-040','HB-073']))
  throw new Error(`Unexpected common Sensitivity misses: ${allThreeSensitivityMissIds.join(', ')}`);
 const review=reviewData(allThreeSensitivityMissIds,cases,sv,bg,vg,bases,sensitivities);
 await save(join(OUT,'sensitivity-four-case-review-data.json'),review);
 await writeFile(join(OUT,'sensitivity-four-case-posthoc-review.md'),reviewMarkdown(review));
 const chartData=[
  ...metrics.flatMap(x=>[
   {chart:'base_final_accuracy',model:x.model,value:x.base.finalCorrect,denominator:120,unit:'correct_cases'},
   {chart:'base_atomic_accuracy',model:x.model,value:x.base.atomic.correct,denominator:960,unit:'correct_judgments'},
   {chart:'base_p50_latency',model:x.model,value:x.base.performance.latencyP50Ms,denominator:null,unit:'milliseconds'},
   {chart:'base_total_cost',model:x.model,value:x.base.performance.knownEstimatedCostUsd,denominator:null,unit:'USD'},
   {chart:'repeatability_final_action',model:x.model,value:x.repeatability.finalCorrect,denominator:100,unit:'correct_runs'},
   {chart:'consistency_action_agreement',model:x.model,value:x.consistency.actionAgreement,denominator:48,unit:'agreeing_variants'},
   {chart:'consistency_atomic_agreement',model:x.model,value:x.consistency.atomicAgreement,denominator:384,unit:'agreeing_judgments'},
   {chart:'stability_vs_responsiveness',model:x.model,series:'stability',value:x.consistency.actionAgreement,denominator:48,unit:'cases'},
   {chart:'stability_vs_responsiveness',model:x.model,series:'responsiveness',value:x.sensitivity.correctActionChange,denominator:9,unit:'cases'}]),
  ...metrics.flatMap(x=>JUDGMENTS.map(q=>({chart:'base_judgment_accuracy',model:x.model,series:q,value:x.base.atomic.byJudgment[q].correct,denominator:120,unit:'correct_cases'}))),
  ...changed56to6.map(x=>({chart:'gpt56_to_gpt6_improvement',model:'GPT-5.6 → GPT-6',series:x.caseId,value:1,denominator:1,unit:'case'}))];
 await save(join(OUT,'chart-data.json'),chartData);
 await writeFile(join(OUT,'chart-data.csv'),csv(chartData));
 const metricsRows=metrics.flatMap(x=>[
  {model:x.model,suite:'base',finalCorrect:x.base.finalCorrect,finalTotal:120,atomicCorrect:x.base.atomic.correct,atomicTotal:960,
   latencyMeanMs:x.base.performance.latencyMeanMs,latencyP50Ms:x.base.performance.latencyP50Ms,latencyP95Ms:x.base.performance.latencyP95Ms,
   totalCostUsd:x.base.performance.knownEstimatedCostUsd,costPerCaseUsd:x.base.performance.costPerCaseUsd,costPerCorrectUsd:x.base.performance.costPerCorrectUsd},
  {model:x.model,suite:'repeatability',success:x.repeatability.successful,requests:100,finalCorrect:x.repeatability.finalCorrect,
   all5Cases:x.repeatability.all5Cases,meanModalAgreement:x.repeatability.meanModalAgreement,
   latencyMeanMs:x.repeatability.performance.latencyMeanMs,latencyP50Ms:x.repeatability.performance.latencyP50Ms,
   latencyP95Ms:x.repeatability.performance.latencyP95Ms,totalCostUsd:x.repeatability.performance.knownEstimatedCostUsd,
   costComplete:x.repeatability.performance.costComplete},
  {model:x.model,suite:'consistency',actionAgreement:x.consistency.actionAgreement,variantGoldCorrect:x.consistency.goldCorrect,
   atomicAgreement:x.consistency.atomicAgreement,allFamilyCorrect:x.consistency.allFamilyCorrect,
   latencyMeanMs:x.consistency.performance.latencyMeanMs,latencyP50Ms:x.consistency.performance.latencyP50Ms,
   latencyP95Ms:x.consistency.performance.latencyP95Ms,totalCostUsd:x.consistency.performance.knownEstimatedCostUsd},
  {model:x.model,suite:'sensitivity',variantGoldCorrect:x.sensitivity.variantGoldCorrect,
   correctActionChange:x.sensitivity.correctActionChange,expectedAtomicCorrect:x.sensitivity.correctExpectedAtomic,
   expectedAtomicTotal:x.sensitivity.expectedAtomic,missedAtomic:x.sensitivity.missedExpectedAtomic,
   wrongDirectionAtomic:x.sensitivity.wrongDirectionAtomic,unexpectedAtomic:x.sensitivity.unexpectedAtomic,
   latencyMeanMs:x.sensitivity.performance.latencyMeanMs,latencyP50Ms:x.sensitivity.performance.latencyP50Ms,
   latencyP95Ms:x.sensitivity.performance.latencyP95Ms,totalCostUsd:x.sensitivity.performance.knownEstimatedCostUsd}]);
 const judgementRows=metrics.flatMap(x=>JUDGMENTS.map(q=>({model:x.model,judgment:q,
  correct:x.base.atomic.byJudgment[q].correct,total:120,accuracy:x.base.atomic.byJudgment[q].accuracy})));
 const transformationRows=metrics.flatMap(x=>TRANSFORMS.map(t=>({model:x.model,transformation:t,
  actionAgreement:x.consistency.transformations[t].actionAgreement,variantGoldCorrect:x.consistency.transformations[t].goldCorrect,
  atomicAgreement:x.consistency.transformations[t].atomicAgreement,totalVariants:12,totalAtomic:96})));
 const sensitivityTransformationRows=metrics.flatMap(x=>SENSITIVITY_TYPES.map(t=>({model:x.model,transformation:t,
  ...x.sensitivity.transformations[t]})));
 const data={schemaVersion:1,freezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,
  gpt6ConfigHash:configHash,sourceInventory:'source-inventory.json',auditStatus:mismatch.length?'FAIL':'PASS',
  denominatorNotes:{jevRepeatability:'99/100 success; HB-073 repeat 1 HTTP 520 is missing, not a wrong semantic response. Cost is a known-usage subtotal/lower bound.'},
  models:metrics.map(x=>({model:x.model,base:x.base,repeatability:x.repeatability,consistency:x.consistency,
   sensitivity:x.sensitivity})),efficiencyRatios:ratios,baseDisagreementIds:differences.filter(x=>x.actionDisagreement).map(x=>x.caseId),
  gpt56ErrorsResolvedByGpt6:changed56to6,judgmentImprovement:judgementImprovement,
  allThreeSensitivityMissIds,chartData};
 await save(join(OUT,'publication-data.json'),data);
 await writeFile(join(OUT,'publication-data.csv'),csv(metricsRows));
 await writeFile(join(OUT,'judgment-metrics.csv'),csv(judgementRows));
 await writeFile(join(OUT,'consistency-transformations.csv'),csv(transformationRows));
 await writeFile(join(OUT,'sensitivity-transformations.csv'),csv(sensitivityTransformationRows));
 await writeFile(join(OUT,'case-disagreements.csv'),csv(differences.filter(x=>x.actionDisagreement)));
 await save(join(OUT,'gpt56-to-gpt6-improvements.json'),{cases:changed56to6,judgmentCounts:judgementImprovement});
 const auditSummary={status:mismatch.length?'FAIL':'PASS',checks:audit.length,mismatches:mismatch.length,
  freezeHash:EXECUTION_FREEZE,benchmarkManifestHash:BENCHMARK_MANIFEST_HASH,componentMismatches:0,
  gpt6ConfigHash:configHash,developmentHistoryPass,runCount:inventoryRows.length,rawRequestCount:inventoryRows.reduce((n,x)=>n+x.requestCount,0)};
 await save(join(OUT,'audit-summary.json'),auditSummary);
 return{auditSummary,metrics,ratios,atomicAnalyses,changed56to6,judgementImprovement,review,inventoryRows};
}
