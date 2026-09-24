import {describe,it,expect} from 'vitest';
import {cases,getCase,getResult,hardValue,hardDecision,thresholds} from './benchmark.js';
import {atomicComparisons,goldComparison,decisionTrace,modelDisagreements,headlineFindings} from './decisionPresentation.js';
import {decide} from '../../../src/judgments.ts';

describe('frozen decision presentation derivation',()=>{
 it('uses the saved rule for all four routes and only highlights route signals',()=>{
  const examples={CLEAR:['HB-007','C1',[]],QUESTION:['HB-002','Q1',['material_contradiction','explanation_supported']],
   INSPECT:['HB-001','I1',['physical_concern']],DENY:['HB-008','D1',['prohibited_shutdown']]};
  for(const [action,[id,rule,triggers]] of Object.entries(examples)){
   const r=getResult(id,'jev'),trace=decisionTrace(r,'jev');
   expect(r.action).toBe(action);expect(trace.ruleId).toBe(rule);expect(trace.action).toBe(action);
   expect(trace.triggerIds).toEqual(triggers);
  }
  expect(decisionTrace(getResult('HB-005','jev'),'jev').triggerIds).toContain('answer_completeness');
  expect(decisionTrace(getResult('HB-004','jev'),'jev').ruleId).toBe('Q3');
  expect(thresholds.inspect).toBe(.65);
 });
 it('matches the authoritative shared decision on all 360 frozen Base responses',()=>{
  let checked=0;
  for(const c of cases)for(const model of ['jev','gpt56','gpt6']){
   const saved=getResult(c.id,model),authoritative=decide(saved.answers),trace=decisionTrace(saved,model);
   expect({caseId:c.id,model,action:saved.action,rule:saved.rule}).toMatchObject({action:authoritative.action,rule:authoritative.rule});
   expect(trace.action).toBe(saved.action);
   expect(trace.ruleId).toBe(saved.rule.split(':')[0]);
   checked++;
  }
  expect(checked).toBe(360);
 });
 it('keeps the frozen priority D1 over I1, I1 over Q2, and Q1 over Q2',()=>{
  const deny=getResult('HB-008','jev');
  expect(deny.answers.physical_concern.noul).toBeGreaterThanOrEqual(thresholds.inspect);
  expect(deny.answers.prohibited_shutdown.noul).toBeGreaterThanOrEqual(thresholds.deny);
  expect(decide(deny.answers).rule).toBe(deny.rule);
  expect(decisionTrace(deny,'jev').triggerIds).toEqual(['prohibited_shutdown']);
  const inspect=getResult('HB-003','jev');
  expect(inspect.answers.answer_completeness.probabilities.partial+inspect.answers.answer_completeness.probabilities.evasive).toBeGreaterThanOrEqual(thresholds.incomplete);
  expect(decide(inspect.answers).rule).toBe(inspect.rule);
  expect(decisionTrace(inspect,'jev').triggerIds).toEqual(['physical_concern']);
  const question=getResult('HB-002','jev');
  expect(question.answers.answer_completeness.probabilities.partial+question.answers.answer_completeness.probabilities.evasive).toBeGreaterThanOrEqual(thresholds.incomplete);
  expect(decide(question.answers).rule).toBe(question.rule);
  expect(decisionTrace(question,'jev').ruleId).toBe('Q1');
  const clear=getResult('HB-007','jev');
  expect(decide(clear.answers).rule).toBe(clear.rule);
  expect(decisionTrace(clear,'jev').triggerIds).toEqual([]);
 });
 it('normalizes Noul YES/NO to Boolean Gold without changing either source',()=>{
  const r=getResult('HB-001','jev'),g=getCase('HB-001').gold;
  const rows=atomicComparisons(r,g);
  expect(rows.find(x=>x.id==='physical_concern')).toMatchObject({predicted:true,expected:true,match:true,predictionLabel:'YES',goldLabel:'TRUE'});
  expect(rows.find(x=>x.id==='material_contradiction')).toMatchObject({predicted:false,expected:true,match:false,predictionLabel:'NO',goldLabel:'TRUE'});
  expect(rows.find(x=>x.id==='prohibited_shutdown')).toMatchObject({predicted:false,expected:false,match:true,predictionLabel:'NO',goldLabel:'FALSE'});
 });
 it('compares Choice and Score selected levels',()=>{
  const r=getResult('HB-001','jev'),g=getCase('HB-001').gold;
  expect(atomicComparisons(r,g).find(x=>x.id==='answer_completeness').match).toBe(true);
  expect(atomicComparisons(r,g).find(x=>x.id==='anomaly_severity').match).toBe(true);
  expect(atomicComparisons(r,{expected:{...g.expected,answer_completeness:'partial',anomaly_severity:1}}).filter(x=>['answer_completeness','anomaly_severity'].includes(x.id)).every(x=>!x.match)).toBe(true);
  expect(hardDecision(r.answers.anomaly_severity)).toBe('LEVEL 0');
  expect(hardValue({type:'score',score:1.2,probabilities:{0:.1,1:.7,2:.2}})).toBe(1);
 });
 it('counts atomic matches and distinguishes correct, incorrect, and perfect final outcomes',()=>{
  const c=getCase('HB-001');const jev=goldComparison(getResult(c.id,'jev'),c.gold);
  expect(jev).toMatchObject({finalMatch:true,matches:7,total:8});
  expect(jev.summary).toContain('Final Action matched. 7 of 8');
  const wrong=goldComparison(getResult(c.id,'gpt56'),c.gold);
  expect(wrong.finalMatch).toBe(false);expect(wrong.summary).toContain('Final Action differed');
  const perfectResult={...getResult(c.id,'jev'),action:c.gold.action,answers:{...getResult(c.id,'jev').answers,
   material_contradiction:{type:'noul',noul:1}}};
  expect(goldComparison(perfectResult,c.gold).summary).toBe('Final Action and all 8 atomic judgments matched Frozen Gold.');
 });
 it('flags only hard-label model disagreement and derives headline ratios',()=>{
  const models=['jev','gpt56','gpt6'].map(m=>getResult('HB-001',m));
  const d=modelDisagreements(models);
  expect(d.count).toBe(4);expect(d.ids).toContain('prohibited_shutdown');
  const same=models.map(r=>({...r,answers:{...r.answers,physical_concern:{...r.answers.physical_concern,noul:r.answers.physical_concern.noul===.89?.8:.9}}}));
  expect(modelDisagreements(same).ids).not.toContain('physical_concern');
  const facts=headlineFindings();
  expect(facts.map(x=>x.value)).toEqual(['120 / 120','910 / 960','~11.7×','~5.9×']);
  expect(facts.every(x=>/observed|estimated/i.test(x.label))).toBe(true);
 });
});
