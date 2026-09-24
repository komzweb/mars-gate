import {JUDGMENTS,hardValue,formatHard,ROUTES,thresholds,publication,getModel} from './benchmark.js';

const names=Object.fromEntries(JUDGMENTS.map(([id,label])=>[id,label]));
const pct=n=>`${Math.round(n*100)}%`;
const probabilityPrefix=model=>model==='jev'?'P':'MODEL-REPORTED P';
const signal=(id,answer,model,kind='yes')=>{
 const p=probabilityPrefix(model);
 let detail='—';
 if(answer?.type==='noul')detail=`${p}(YES) ${pct(answer.noul)}`;
 if(answer?.type==='choice')detail=kind==='incomplete'
  ?`${p}(PARTIAL + EVASIVE) ${pct(answer.probabilities.partial+answer.probabilities.evasive)}`
  :`${p}(COMPLETE) ${pct(answer.probabilities.complete)}`;
 return{id,label:names[id],hard:formatHard(hardValue(answer)),detail};
};

// The saved rule ID and action are authoritative. This only describes which stored
// atomic probabilities satisfy that already-applied frozen rule; it never routes a case.
export function decisionTrace(result,model){
 if(!result?.answers||!result?.rule||!result?.action)return null;
 const a=result.answers,t=thresholds,id=result.rule.split(':')[0];
 const yes=q=>a[q]?.noul??0;
 const list=[];
 const add=(q,kind)=>{if(!list.some(x=>x.id===q))list.push(signal(q,a[q],model,kind));};
 if(id==='D1')for(const q of ['prohibited_shutdown','prohibited_pathogen','altered_identity'])if(yes(q)>=t.deny)add(q);
 if(id==='I1')add('physical_concern');
 if(id==='Q1'){add('material_contradiction');add('explanation_supported');}
 if(id==='Q2')add('answer_completeness','incomplete');
 if(id==='Q3'){
  for(const q of ['prohibited_shutdown','prohibited_pathogen','altered_identity','physical_concern'])if(yes(q)>=t.uncertaintyFloor)add(q);
  if(yes('material_contradiction')>=t.uncertaintyFloor&&yes('explanation_supported')<t.explanation){add('material_contradiction');add('explanation_supported');}
  if((a.answer_completeness?.probabilities?.complete??1)<t.incomplete)add('answer_completeness','complete');
 }
 const titles={D1:'CONFIRMED PROHIBITED CONDITION',I1:'UNRESOLVED PHYSICAL CONCERN',
  Q1:'UNEXPLAINED MATERIAL CONTRADICTION',Q2:'INCOMPLETE INTERVIEW RESPONSE',
  Q3:'UNRESOLVED MODEL UNCERTAINTY',C1:'NO MATERIAL UNRESOLVED ISSUE'};
 return{ruleId:id,ruleText:result.rule.split(':').slice(1).join(':').trim(),title:titles[id]??result.rule,
  action:result.action,route:ROUTES[result.action],signals:list,triggerIds:list.map(x=>x.id)};
}

export function atomicComparisons(result,gold){
 return JUDGMENTS.map(([id,label])=>{
  const predicted=hardValue(result?.answers?.[id]);const expected=gold?.expected?.[id];
  return{id,label,predicted,expected,match:predicted!==null&&predicted===expected,
   predictionLabel:formatHard(predicted),goldLabel:typeof expected==='boolean'?(expected?'TRUE':'FALSE'):formatHard(expected)};
 });
}
export function goldComparison(result,gold){
 const rows=atomicComparisons(result,gold),matches=rows.filter(x=>x.match).length;
 const finalMatch=!!result?.action&&result.action===gold?.action;
 const summary=!finalMatch?`Final Action differed from Frozen Gold. ${matches} of 8 atomic judgments matched.`:
  matches===8?'Final Action and all 8 atomic judgments matched Frozen Gold.':
  `Final Action matched. ${matches} of 8 atomic judgments matched Frozen Gold.`;
 return{finalMatch,matches,total:rows.length,rows,summary};
}
export function modelDisagreements(results){
 const disagreementIds=JUDGMENTS.filter(([id])=>new Set(results.map(r=>hardValue(r?.answers?.[id]))).size>1).map(([id])=>id);
 return{ids:disagreementIds,count:disagreementIds.length,labels:disagreementIds.map(id=>names[id])};
}
export function headlineFindings(){
 const jev=publication.models.find(x=>x.model===getModel('jev').full);
 const gpt6=publication.models.find(x=>x.model===getModel('gpt6').full);
 return[
  {eyebrow:'GPT-6 LUNA · BASE FINAL ACTION',value:`${gpt6.base.finalCorrect} / ${gpt6.base.attempted}`,label:'Observed on this Frozen workload'},
  {eyebrow:'JEV · BASE ATOMIC GOLD MATCH',value:`${jev.base.atomic.correct} / ${jev.base.atomic.total}`,label:'Highest observed among the three models'},
  {eyebrow:'JEV / GPT-6 · p50 LATENCY',value:`~${(gpt6.base.performance.latencyP50Ms/jev.base.performance.latencyP50Ms).toFixed(1)}×`,label:'Lower observed Jev API latency on this workload'},
  {eyebrow:'JEV / GPT-6 · BASE COST',value:`~${(gpt6.base.performance.knownEstimatedCostUsd/jev.base.performance.knownEstimatedCostUsd).toFixed(1)}×`,label:'Lower estimated Jev cost on this workload'},
 ];
}
