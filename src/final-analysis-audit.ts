import { decide, QUESTIONS } from './judgments.ts';
import type { Answer, Answers, RunRecord } from './types.ts';

export const JUDGMENTS=Object.keys(QUESTIONS);
export const ACTIONS=['CLEAR','QUESTION','INSPECT','DENY'] as const;
export const TRANSFORMS=['paraphrase','information-order','irrelevant-information','species-swap'];
export const SENSITIVITY_TYPES=['decisive-evidence-addition','decisive-evidence-deletion','evidence-polarity-reversal'];
export function hard(a:Answer):boolean|string|number {
 return a.type==='noul'?a.noul!>=0.5:a.type==='choice'?a.choice!:Number(Object.entries(a.probabilities!).sort((x,y)=>y[1]-x[1])[0][0]);
}
export const percentile=(a:number[],p:number)=>a.length?[...a].sort((x,y)=>x-y)[Math.ceil(a.length*p)-1]:null;
export function performance(rows:RunRecord[]){
 const ok=rows.filter(r=>r.status==='ok'),lat=ok.map(r=>r.latencyMs);
 const token=(key:'inputTokens'|'cachedInputTokens'|'cacheWriteTokens'|'outputTokens'|'reasoningTokens')=>rows.reduce((n,r)=>n+(r.usage?.[key]??0),0);
 return{successful:ok.length,failed:rows.length-ok.length,errors:rows.filter(r=>r.status==='error').length,
  retries:rows.reduce((n,r)=>n+Math.max(0,r.attempts.length-1),0),
  latencyMeanMs:lat.length?lat.reduce((a,b)=>a+b,0)/lat.length:null,latencyP50Ms:percentile(lat,.5),latencyP95Ms:percentile(lat,.95),
  totalInferenceLatencyMs:rows.reduce((n,r)=>n+r.latencyMs,0),
  inputTokens:token('inputTokens'),cachedInputTokens:token('cachedInputTokens'),cacheWriteTokens:token('cacheWriteTokens'),
  outputTokens:token('outputTokens'),reasoningTokens:token('reasoningTokens'),
  knownEstimatedCostUsd:rows.reduce((n,r)=>n+(r.estimatedCostUsd??0),0),costComplete:rows.every(r=>r.costComplete),
  costUnknownAttempts:rows.filter(r=>!r.costComplete).map(r=>({caseId:r.caseId,repeatIndex:r.repeatIndex??null,statuses:r.attempts.map(a=>a.status)}))};
}
export function baseMetrics(rows:RunRecord[]){
 const correct=rows.filter(r=>r.correct).length,perf=performance(rows);
 const recall=Object.fromEntries(ACTIONS.map(g=>{const x=rows.filter(r=>r.groundTruth.correctAction===g),n=x.filter(r=>r.correct).length;return[g,{correct:n,total:x.length,recall:n/x.length}]}));
 const confusion=Object.fromEntries(ACTIONS.map(g=>[g,Object.fromEntries([...ACTIONS,'ERROR'].map(a=>[a,rows.filter(r=>r.groundTruth.correctAction===g&&(r.decision?.action??'ERROR')===a).length]))]));
 const atomic=Object.fromEntries(JUDGMENTS.map(id=>{const n=rows.filter(r=>r.answers&&hard(r.answers[id])===r.groundTruth.expected[id]).length;return[id,{correct:n,total:rows.length,accuracy:n/rows.length}]}));
 const ac=Object.values(atomic).reduce((n:any,x:any)=>n+x.correct,0);
 return{attempted:rows.length,successful:perf.successful,failed:perf.failed,finalCorrect:correct,finalAccuracy:correct/rows.length,
  recall,confusionMatrix:confusion,atomic:{correct:ac,total:rows.length*JUDGMENTS.length,accuracy:ac/(rows.length*JUDGMENTS.length),byJudgment:atomic},
  performance:{...perf,costPerCaseUsd:perf.knownEstimatedCostUsd/rows.length,costPerCorrectUsd:perf.knownEstimatedCostUsd/correct},
  wrongCaseIds:rows.filter(r=>!r.correct).map(r=>r.caseId)};
}
export function repeatMetrics(rows:RunRecord[],subset:string[]){
 const byCase=subset.map(id=>{const x=rows.filter(r=>r.caseId===id),actions=x.filter(r=>r.decision).map(r=>r.decision!.action);
  const counts=Object.fromEntries(ACTIONS.map(a=>[a,actions.filter(v=>v===a).length]));
  const modal=Math.max(0,...Object.values(counts));
  const atom=Object.fromEntries(JUDGMENTS.map(q=>{const v=x.filter(r=>r.answers).map(r=>hard(r.answers![q]));return[q,{all5:v.length===5&&new Set(v).size===1,goldCorrect:x.filter(r=>r.answers&&hard(r.answers[q])===r.groundTruth.expected[q]).length}]}));
  return{caseId:id,attempted:x.length,successful:actions.length,actionCounts:counts,modalCount:modal,modalAgreement:modal/5,
   all5:x.length===5&&actions.length===5&&modal===5,correct:x.filter(r=>r.correct).length,atomic:atom};});
 const atomic=Object.fromEntries(JUDGMENTS.map(q=>[q,{all5AgreementCases:byCase.filter(c=>c.atomic[q].all5).length,
  goldCorrect:byCase.reduce((n,c)=>n+c.atomic[q].goldCorrect,0)}]));
 return{attempted:rows.length,successful:rows.filter(r=>r.status==='ok').length,failed:rows.filter(r=>r.status==='error').length,
  finalCorrect:rows.filter(r=>r.correct).length,finalAccuracy:rows.filter(r=>r.correct).length/rows.length,
  all5Cases:byCase.filter(c=>c.all5).length,meanModalAgreement:byCase.reduce((n,c)=>n+c.modalAgreement,0)/subset.length,
  atomic,caseLevel:byCase,performance:performance(rows)};
}
export function consistencyMetrics(rows:RunRecord[],baseRows:RunRecord[],sourceIds:string[],variants:any[]){
 const base=new Map(baseRows.map(r=>[r.caseId,r]));
 const details=variants.map(v=>{const r=rows.find(x=>x.caseId===v.id),b=base.get(v.baseId);
  if(!r||!b)throw new Error(`Missing consistency pair ${v.id}`);
  const changed=JUDGMENTS.filter(q=>r.answers&&b.answers&&hard(r.answers[q])!==hard(b.answers[q]));
  const atomicCorrect=JUDGMENTS.filter(q=>r.answers&&hard(r.answers[q])===r.groundTruth.expected[q]).length;
  return{baseCaseId:v.baseId,variantId:v.id,type:v.variant,baseAction:b.decision?.action??null,action:r.decision?.action??null,
   gold:r.groundTruth.correctAction,baseCorrect:b.correct,correct:r.correct,
   actionAgreement:!!b.decision&&!!r.decision&&b.decision.action===r.decision.action,
   atomicAgreement:8-changed.length,atomicCorrect,changedJudgments:changed};});
 const aggregate=(d:any[])=>({variants:d.length,actionAgreement:d.filter(x=>x.actionAgreement).length,goldCorrect:d.filter(x=>x.correct).length,
  atomicAgreement:d.reduce((n,x)=>n+x.atomicAgreement,0),atomicCorrect:d.reduce((n,x)=>n+x.atomicCorrect,0),
  changedAtomicDecisions:d.reduce((n,x)=>n+x.changedJudgments.length,0),atomicChangedButActionSame:d.filter(x=>x.actionAgreement&&x.changedJudgments.length).length,
  incorrectVariantIds:d.filter(x=>!x.correct).map(x=>x.variantId)});
 const overall=aggregate(details);
 const transformations=Object.fromEntries(TRANSFORMS.map(t=>[t,aggregate(details.filter(d=>d.type===t))]));
 const families=sourceIds.map(id=>{const x=details.filter(d=>d.baseCaseId===id),b=base.get(id);
  return{baseCaseId:id,baseCorrect:b?.correct,allFamilyCorrect:b?.correct===true&&x.length===4&&x.every(d=>d.correct)};});
 const species=details.filter(x=>x.type==='species-swap');
 return{...overall,allFamilyCorrect:families.filter(x=>x.allFamilyCorrect).length,families,transformations,
  speciesSwap:{actionChanged:species.filter(x=>!x.actionAgreement).map(x=>x.variantId),
   correctnessChanged:species.filter(x=>x.baseCorrect!==x.correct).map(x=>x.variantId),
   atomicChanged:species.filter(x=>x.changedJudgments.length).map(x=>({variantId:x.variantId,judgments:x.changedJudgments}))},
  details,performance:performance(rows)};
}
export function sensitivityMetrics(rows:RunRecord[],baseRows:RunRecord[],variants:any[],baseGold:any,variantGold:any){
 const base=new Map(baseRows.map(r=>[r.caseId,r]));
 const details=variants.map(v=>{const r=rows.find(x=>x.caseId===v.id),b=base.get(v.baseId),bg=baseGold[v.baseId],vg=variantGold[v.id];
  if(!r||!b||!bg||!vg)throw new Error(`Missing sensitivity pair ${v.id}`);
  const atomic=Object.fromEntries(JUDGMENTS.map(q=>{const expected=bg.expected[q]!==vg.expected[q],a=b.answers?hard(b.answers[q]):null,z=r.answers?hard(r.answers[q]):null,observed=a!==null&&z!==null?a!==z:null;
   return[q,{baseGold:bg.expected[q],variantGold:vg.expected[q],baseLabel:a,variantLabel:z,expectedChange:expected,observedChange:observed,
    exactGoldTransition:expected&&a===bg.expected[q]&&z===vg.expected[q],missed:expected&&observed===false,
    wrongDirection:expected&&observed===true&&z!==vg.expected[q],recovered:expected&&observed===true&&a!==bg.expected[q]&&z===vg.expected[q],
    unexpected:!expected&&observed===true}]}));
  const a=b.decision?.action??null,z=r.decision?.action??null;
  return{baseCaseId:v.baseId,variantId:v.id,type:v.variant,baseGold:bg.correctAction,variantGold:vg.correctAction,
   baseAction:a,action:z,baseCorrect:b.correct,variantCorrect:z===vg.correctAction,
   actionChanged:a!==null&&z!==null&&a!==z,correctActionChange:a!==null&&z!==null&&a!==z&&z===vg.correctAction,
   exactGoldTransition:a===bg.correctAction&&z===vg.correctAction,atomic};});
 const aggregate=(d:any[])=>{const a=d.flatMap(x=>Object.values(x.atomic) as any[]);
  const expected=a.filter(x=>x.expectedChange),stable=a.filter(x=>!x.expectedChange);
  return{variants:d.length,variantGoldCorrect:d.filter(x=>x.variantCorrect).length,actionChanged:d.filter(x=>x.actionChanged).length,
   correctActionChange:d.filter(x=>x.correctActionChange).length,exactGoldTransitions:d.filter(x=>x.exactGoldTransition).length,
   correctBaseToCorrectVariant:d.filter(x=>x.baseCorrect===true&&x.variantCorrect).length,
   correctBaseToIncorrectVariant:d.filter(x=>x.baseCorrect===true&&!x.variantCorrect).length,
   expectedAtomic:expected.length,correctExpectedAtomic:expected.filter(x=>x.exactGoldTransition).length,
   missedExpectedAtomic:expected.filter(x=>x.missed).length,wrongDirectionAtomic:expected.filter(x=>x.wrongDirection).length,
   recoveredFromWrongBase:expected.filter(x=>x.recovered).length,unexpectedAtomic:stable.filter(x=>x.unexpected).length};};
 return{...aggregate(details),transformations:Object.fromEntries(SENSITIVITY_TYPES.map(t=>[t,aggregate(details.filter(x=>x.type===t))])),
  details,performance:performance(rows)};
}
export function goldAnswer(id:string,value:boolean|string|number):Answer {
 const q=QUESTIONS[id];
 if(q.type==='noul')return{type:'noul',noul:value?1:0};
 const keys=q.type==='choice'?Object.keys(q.criteria!):(q.criteria as string[]).map((_,i)=>String(i));
 const probabilities=Object.fromEntries(keys.map(k=>[k,Number(String(value)===k)]));
 return q.type==='choice'?{type:'choice',choice:String(value),probabilities}:{type:'score',score:Number(value),probabilities};
}
export function thresholdDistances(a:Answers){
 const p=(q:string)=>a[q].noul!;
 const c=a.answer_completeness.probabilities!;
 const x={deny:Math.abs(Math.max(p('prohibited_shutdown'),p('prohibited_pathogen'),p('altered_identity'))-0.85),
  inspect:Math.abs(p('physical_concern')-0.65),contradiction:Math.abs(p('material_contradiction')-0.65),
  explanation:Math.abs(p('explanation_supported')-0.8),incomplete:Math.abs(c.partial+c.evasive-0.6),
  uncertaintyProhibited:Math.abs(Math.max(p('prohibited_shutdown'),p('prohibited_pathogen'),p('altered_identity'))-0.35),
  uncertaintyPhysical:Math.abs(p('physical_concern')-0.35),uncertaintyContradiction:Math.abs(p('material_contradiction')-0.35),
  completeFloor:Math.abs(c.complete-0.6)};
 return Object.entries(x).sort((a,b)=>a[1]-b[1]).map(([threshold,distance])=>({threshold,distance}));
}
export function atomicFinalAnalysis(rows:RunRecord[]){
 const cases=rows.map(r=>{const errors=JUDGMENTS.filter(q=>r.answers&&hard(r.answers[q])!==r.groundTruth.expected[q]);
  const singleCorrections=errors.map(q=>{const copy=structuredClone(r.answers!);copy[q]=goldAnswer(q,r.groundTruth.expected[q]);
   const replay=decide(copy);return{judgment:q,replayedAction:replay.action,sufficientToReachGold:replay.action===r.groundTruth.correctAction};});
  const all=structuredClone(r.answers!);for(const q of errors)all[q]=goldAnswer(q,r.groundTruth.expected[q]);
  return{caseId:r.caseId,goldAction:r.groundTruth.correctAction,observedAction:r.decision?.action??null,observedRule:r.decision?.rule??null,
   finalCorrect:r.correct,atomicErrors:errors,singleCorrections,
   allErrorCorrectionAction:r.answers?decide(all).action:null,closestThresholds:r.answers?thresholdDistances(r.answers).slice(0,3):[]};});
 const wrong=cases.filter(x=>!x.finalCorrect),masked=cases.filter(x=>x.finalCorrect&&x.atomicErrors.length);
 return{cases,counts:{finalErrors:wrong.length,finalErrorsWithSingleCorrectionSufficient:wrong.filter(x=>x.singleCorrections.some(y=>y.sufficientToReachGold)).length,
  finalErrorsCorrectedByAllAtomicGold:wrong.filter(x=>x.allErrorCorrectionAction===x.goldAction).length,
  correctFinalWithAtomicErrors:masked.length,correctFinalWithoutAtomicErrors:cases.filter(x=>x.finalCorrect&&!x.atomicErrors.length).length},
  singleCorrectionSufficientByJudgment:Object.fromEntries(JUDGMENTS.map(q=>[q,wrong.filter(x=>x.singleCorrections.some(y=>y.judgment===q&&y.sufficientToReachGold)).map(x=>x.caseId)])),
  atomicErrorFrequencyInFinalErrors:Object.fromEntries(JUDGMENTS.map(q=>[q,wrong.filter(x=>x.atomicErrors.includes(q)).length])),
  thresholdProximateFinalErrors:wrong.filter(x=>x.closestThresholds[0]?.distance<=0.1).map(x=>({caseId:x.caseId,closest:x.closestThresholds[0]}))};
}
