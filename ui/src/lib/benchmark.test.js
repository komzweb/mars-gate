import {describe,it,expect} from 'vitest';
import {cases,getResult,filteredCases,adjacentCase,randomCase,modelMetric,probabilities,ROUTES} from './benchmark.js';

describe('frozen UI data adapter',()=>{
 it('normalizes 120 cases and 360 saved responses without an API request',()=>{
  expect(cases).toHaveLength(120);
  for(const c of cases)for(const model of ['jev','gpt56','gpt6']){
   const r=getResult(c.id,model);expect(r).toBeTruthy();expect(r.action).toBeTruthy();expect(Object.keys(r.answers)).toHaveLength(8);
  }
 });
 it('supports case filters and navigation',()=>{
  const x=filteredCases({goldAction:'CLEAR',visitorType:'Human'});
  expect(x).toHaveLength(5);
  const ids=x.map(c=>c.id);
  expect(adjacentCase(ids[0],ids,-1)).toBe(ids.at(-1));
  expect(adjacentCase(ids[0],ids,1)).toBe(ids[1]);
  expect(randomCase(ids[0],ids,()=>0)).not.toBe(ids[0]);
 });
 it('loads publication metrics and keeps probability semantics distinct',()=>{
  expect(modelMetric('jev').base.finalCorrect).toBe(119);
  expect(modelMetric('gpt56').base.finalCorrect).toBe(109);
  expect(modelMetric('gpt6').base.finalCorrect).toBe(120);
  const jev=probabilities(getResult('HB-001','jev').answers.physical_concern,'jev');
  const llm=probabilities(getResult('HB-001','gpt6').answers.physical_concern,'gpt6');
  expect(jev[0].label).toBe('P(YES)');
  expect(llm[0].label).toBe('MODEL-REPORTED P(YES)');
  expect(ROUTES.INSPECT.destination).toBe('INSPECTION BAY');
 });
});
