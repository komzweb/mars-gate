import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { QUESTIONS, POLICY, THRESHOLDS } from '../src/judgments.ts';
import { runFrozenBenchmark, verifyExecutionFreeze } from '../src/frozen-benchmark.ts';
import { runFrozenRepeatability } from '../src/frozen-repeatability.ts';
import { runFrozenConsistency } from '../src/frozen-consistency.ts';
import { runFrozenSensitivity } from '../src/frozen-sensitivity.ts';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const read = async (name: string) => JSON.parse(await readFile(new URL(`../benchmark/v1/${name}`, import.meta.url), 'utf8'));
const hash = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex');

test('held-out v1 is balanced, separated, reviewed, and uses frozen judgments', async () => {
  const [cases, gold, latent, metadata, manifest] = await Promise.all(['cases.json','gold-proposed.json','latent-truth.json','case-metadata.json','manifest.json'].map(read));
  assert.equal(cases.length, 120);
  assert.equal(new Set(cases.map((c: any) => c.id)).size, 120);
  assert.equal(manifest.modelApiRuns, 0);
  assert.equal(manifest.prototypeExcluded, true);
  assert.equal(manifest.questionsHash, hash(QUESTIONS));
  assert.equal(manifest.policyHash, hash(POLICY));
  assert.equal(manifest.thresholdsHash, hash(THRESHOLDS));
  for (const action of ['CLEAR','QUESTION','INSPECT','DENY']) {
    const rows = cases.filter((c: any) => gold[c.id].correctAction === action);
    assert.equal(rows.length, 30);
    for (const type of ['Human','Android','Alien','Cyborg','Synthetic','Uplift']) assert.equal(rows.filter((c: any) => c.observable.profile.type === type).length, 5);
    for (const origin of new Set(cases.map((c: any) => c.observable.profile.origin))) assert.equal(rows.filter((c: any) => c.observable.profile.origin === origin).length, 3);
    for (const purpose of new Set(cases.map((c: any) => c.observable.profile.purpose))) assert.equal(rows.filter((c: any) => c.observable.profile.purpose === purpose).length, 3);
  }
  for (const c of cases) {
    assert.deepEqual(Object.keys(c).sort(), ['baseId','id','observable','variant']);
    assert.ok(gold[c.id] && latent[c.id] && metadata[c.id]);
    assert.equal(gold[c.id].annotationStatus, 'reviewed/frozen; pre-benchmark human adjudication complete');
    assert.equal(gold[c.id].scoringEligible, true);
    assert.deepEqual(gold[c.id].acceptableActions, [gold[c.id].correctAction]);
    assert.deepEqual(Object.keys(gold[c.id].expected).sort(), Object.keys(QUESTIONS).sort());
  }
});

test('pre-benchmark adjudication and altered-identity interpretation are frozen', async () => {
  const [gold, manifest, review, freeze, history] = await Promise.all(['gold-proposed.json','manifest.json','review-adjudication.json','freeze.json','freeze-history.json'].map(read));
  assert.equal(manifest.status, 'reviewed/frozen');
  assert.equal(manifest.counts.scoringEligible, 120);
  assert.equal(manifest.modelApiRuns, 0);
  assert.equal(review.modelOutputsObserved, false);
  assert.match(review.prototypeAnnotationNote, /MG-18/);
  assert.equal(gold['HB-056'].correctAction, 'QUESTION');
  assert.equal(gold['HB-056'].borderline, true);
  for (const [id, action] of Object.entries({ 'HB-067':'INSPECT','HB-079':'INSPECT','HB-090':'INSPECT','HB-113':'QUESTION' })) assert.deepEqual(gold[id].acceptableActions, [action]);
  for (const g of Object.values(gold) as any[]) if (g.expected.altered_identity) assert.equal(g.expected.physical_concern, true);
  assert.equal(freeze.status, 'reviewed/frozen');
  assert.equal(freeze.modelApiRuns, 0);
  assert.equal(freeze.components.benchmarkManifest, await (async () => createHash('sha256').update(await readFile(new URL('../benchmark/v1/manifest.json', import.meta.url))).digest('hex'))());
  assert.ok(freeze.overallFreezeHash);
  assert.equal(history.supersededFreeze.overallFreezeHash, '341b3128158df5d608a6e10b70b0830170581467d85bc9634cceeebdce71ad2e');
  assert.deepEqual(history.componentComparison.added, ['benchmarkManifest']);
  assert.deepEqual(history.componentComparison.changed, []);
  assert.deepEqual(history.componentComparison.removed, []);
});

test('repeatability, consistency, and sensitivity sets are pre-fixed and disjoint from base scoring', async () => {
  const [gold, manifest, variants, sensitivity, sensitivityGold] = await Promise.all(['gold-proposed.json','manifest.json','consistency-variants.json','sensitivity-variants.json','sensitivity-gold-proposed.json'].map(read));
  assert.equal(manifest.repeatability.caseIds.length, 20);
  assert.equal(new Set(manifest.repeatability.caseIds).size, 20);
  for (const action of ['CLEAR','QUESTION','INSPECT','DENY']) assert.equal(manifest.repeatability.caseIds.filter((id: string) => gold[id].correctAction === action).length, 5);
  assert.ok(manifest.repeatability.caseIds.every((id: string) => gold[id].scoringEligible));
  assert.equal(manifest.consistency.baseCaseIds.length, 12);
  assert.equal(variants.length, 48);
  for (const type of manifest.consistency.variantTypes) assert.equal(variants.filter((v: any) => v.variant === type).length, 12);
  assert.equal(sensitivity.length, 9);
  for (const v of sensitivity) assert.notEqual(sensitivityGold[v.id].correctAction, gold[v.baseId].correctAction);
});

test('frozen runner gates integrity and persists auditable offline records', async () => {
  const gate=await verifyExecutionFreeze(); assert.equal(gate.pass,true);
  const temp=await mkdtemp(join(tmpdir(),'mars-frozen-'));
  try{const result=await runFrozenBenchmark({offline:true,limit:2,outputRoot:temp});assert.equal(result.records.length,4);assert.equal(result.summary.complete,true);assert.ok(result.records.every(r=>r.request&&r.attempts[0].rawResponse&&r.groundTruth&&r.atomicMatches));assert.equal(result.summary.providers.length,2);assert.equal(result.summary.attemptedCases,2);}finally{await rm(temp,{recursive:true,force:true});}
});

test('frozen repeatability uses 20 fixed cases and five new requests per provider', async () => {
  const temp=await mkdtemp(join(tmpdir(),'mars-repeatability-'));
  try{
    const result=await runFrozenRepeatability({offline:true,outputRoot:temp});
    const manifest=await readFile(join(result.directory,'manifest.json'),'utf8').then(JSON.parse);
    assert.equal(result.records.length,200);
    assert.equal(result.summary.complete,true);
    assert.equal(result.caseReports.length,20);
    assert.equal(manifest.repeatabilitySubsetHash,(await read('freeze.json')).components.repeatabilitySubset);
    for(const c of result.caseReports)for(const p of c.providers){
      assert.equal(p.runs.length,5);
      assert.deepEqual(p.runs.map((r:any)=>r.repeatIndex),[1,2,3,4,5]);
      assert.ok(p.base.action);
      assert.ok(p.runs.every((r:any)=>r.answers&&r.rule));
    }
    assert.ok(result.records.every(r=>r.attempts[0].rawResponse&&r.request&&r.groundTruth));
  }finally{await rm(temp,{recursive:true,force:true});}
});

test('frozen consistency runs only 48 variants and verifies species evidence preservation', async () => {
  const temp=await mkdtemp(join(tmpdir(),'mars-consistency-'));
  try{
    const result=await runFrozenConsistency({offline:true,outputRoot:temp});
    const manifest=await readFile(join(result.directory,'manifest.json'),'utf8').then(JSON.parse);
    assert.equal(result.records.length,96);
    assert.equal(result.summary.complete,true);
    assert.equal(result.summary.sourceFamilies,12);
    assert.equal(result.summary.transformations.length,8);
    assert.equal(manifest.speciesEvidenceChecks.length,12);
    assert.ok(manifest.speciesEvidenceChecks.every((x:any)=>x.decisionRelevantEvidencePreserved));
    assert.ok(result.records.every(r=>r.variant!=='base'&&r.request&&r.attempts[0].rawResponse));
    assert.ok(result.summary.providers.every((p:any)=>p.actionAgreement.total===48&&p.atomicAgreement.total===384));
    for(const type of ['paraphrase','information-order','irrelevant-information','species-swap']){
      const firstProviders=result.records.filter((_,i)=>i%2===0).filter(r=>r.variant===type).map(r=>r.provider);
      assert.equal(firstProviders.filter(p=>p==='jev').length,6);
      assert.equal(firstProviders.filter(p=>p==='llm').length,6);
    }
  }finally{await rm(temp,{recursive:true,force:true});}
});

test('frozen sensitivity runs nine changed-Gold variants without reusing Base responses', async () => {
  const temp=await mkdtemp(join(tmpdir(),'mars-sensitivity-'));
  try{
    const result=await runFrozenSensitivity({offline:true,outputRoot:temp});
    const report=await readFile(join(result.directory,'case-level.json'),'utf8').then(JSON.parse);
    assert.equal(result.records.length,18);
    assert.equal(report.length,18);
    assert.equal(result.summary.complete,true);
    assert.deepEqual(result.summary.transformations.map((x:any)=>x.variants),[2,2,4,4,3,3]);
    assert.ok(report.every((x:any)=>x.requiredActionChange&&x.baseGoldAction!==x.variantGoldAction));
    assert.ok(result.records.every(r=>r.variant!=='base'&&r.request&&r.attempts[0].rawResponse));
    assert.ok(result.summary.providers.every((p:any)=>p.variantGoldAccuracy.total===9&&p.correctRequiredActionChanges.total===9));
  }finally{await rm(temp,{recursive:true,force:true});}
});
