import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { QUESTIONS, POLICY, THRESHOLDS, decide } from '../src/judgments.ts';

const dir='benchmark/v1';
const read=async(name:string)=>JSON.parse(await readFile(`${dir}/${name}`,'utf8'));
const cases:any[]=await read('cases.json'); const gold:Record<string,any>=await read('gold-proposed.json'); const latent:Record<string,any>=await read('latent-truth.json'); const metadata:Record<string,any>=await read('case-metadata.json'); const variants:any[]=await read('consistency-variants.json'); const sensitivity:any[]=await read('sensitivity-variants.json'); const sensitivityGold:Record<string,any>=await read('sensitivity-gold-proposed.json'); const reviewRecord=await read('review-adjudication.json'); const manifest=await read('manifest.json');
const prototypeCases:any[]=JSON.parse(await readFile('data/cases.json','utf8'));
const fail=(message:string):never=>{throw new Error(message)}; const eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
const expectedKeys=Object.keys(QUESTIONS).sort();
const inferred=(e:any)=>e.prohibited_shutdown||e.prohibited_pathogen||e.altered_identity?'DENY':e.physical_concern?'INSPECT':e.material_contradiction&&!e.explanation_supported?'QUESTION':e.answer_completeness!=='complete'?'QUESTION':'CLEAR';

if(cases.length!==120) fail('Expected 120 base cases');
if(new Set(cases.map(c=>c.id)).size!==120) fail('Duplicate base IDs');
for(const c of cases){
  if(c.baseId!==c.id||c.variant!=='base') fail(`Invalid base identity ${c.id}`);
  if(Object.keys(c).sort().join()!=='baseId,id,observable,variant') fail(`Evaluation metadata leaked into case object ${c.id}`);
  if(Object.keys(c.observable).sort().join()!=='declaration,documents,interview,profile,scanner,worldFacts') fail(`Unexpected observable field ${c.id}`);
  const g=gold[c.id]; if(!g||!latent[c.id]||!metadata[c.id]) fail(`Missing separated record ${c.id}`);
  if(Object.keys(g.expected).sort().join()!==expectedKeys.join()) fail(`Atomic keys mismatch ${c.id}`);
  if(inferred(g.expected)!==g.correctAction) fail(`Atomic/action mismatch ${c.id}: ${inferred(g.expected)} vs ${g.correctAction}`);
  if(!g.scoringEligible||g.acceptableActions.length!==1||g.acceptableActions[0]!==g.correctAction) fail(`Case not singly adjudicated ${c.id}`);
  if(g.annotationStatus!=='reviewed/frozen; pre-benchmark human adjudication complete') fail(`Status mismatch ${c.id}`);
}
if(manifest.status!=='reviewed/frozen'||!manifest.frozen||!manifest.humanReviewCompleted||manifest.modelApiRuns!==0)fail('Freeze status invalid');
if(!eq(manifest.policy,POLICY)||!eq(manifest.questions,QUESTIONS)||!eq(manifest.thresholds,THRESHOLDS))fail('Frozen judgment definitions mismatch source');
for(const [id,action] of Object.entries({'HB-067':'INSPECT','HB-079':'INSPECT','HB-090':'INSPECT','HB-113':'QUESTION'}))if(gold[id].correctAction!==action||!gold[id].scoringEligible)fail(`Adjudication missing ${id}`);
if(gold['HB-056'].correctAction!=='QUESTION'||!gold['HB-056'].scoringEligible||!gold['HB-056'].borderline)fail('HB-056 disposition changed');
for(const c of cases.filter(c=>gold[c.id].expected.altered_identity))if(!gold[c.id].expected.physical_concern)fail(`Altered identity physical_concern inconsistency ${c.id}`);
if(!reviewRecord.prototypeAnnotationNote.includes('MG-18')||reviewRecord.modelOutputsObserved!==false)fail('Review record missing MG-18 note or pre-model status');
const actions=['CLEAR','QUESTION','INSPECT','DENY']; const types=['Human','Android','Alien','Cyborg','Synthetic','Uplift'];
const actionCounts=Object.fromEntries(actions.map(a=>[a,cases.filter(c=>gold[c.id].correctAction===a).length]));
if(Object.values(actionCounts).some(n=>n!==30)) fail(`Unbalanced actions ${JSON.stringify(actionCounts)}`);
const typeByAction=Object.fromEntries(actions.map(a=>[a,Object.fromEntries(types.map(t=>[t,cases.filter(c=>gold[c.id].correctAction===a&&c.observable.profile.type===t).length]))]));
if(Object.values(typeByAction).some((row:any)=>Object.values(row).some(n=>n!==5))) fail('Type/action independence failed');
const originValues=[...new Set(cases.map(c=>c.observable.profile.origin))]; const purposeValues=[...new Set(cases.map(c=>c.observable.profile.purpose))];
const originByAction=Object.fromEntries(actions.map(a=>[a,Object.fromEntries(originValues.map(v=>[v,cases.filter(c=>gold[c.id].correctAction===a&&c.observable.profile.origin===v).length]))]));
const purposeByAction=Object.fromEntries(actions.map(a=>[a,Object.fromEntries(purposeValues.map(v=>[v,cases.filter(c=>gold[c.id].correctAction===a&&c.observable.profile.purpose===v).length]))]));
if(Object.values(originByAction).some((row:any)=>Object.values(row).some(n=>n!==3))) fail('Origin/action independence failed');
if(Object.values(purposeByAction).some((row:any)=>Object.values(row).some(n=>n!==3))) fail('Purpose/action independence failed');

const content=(c:any)=>[...c.observable.documents.map((x:any)=>x.text),c.observable.declaration,...c.observable.scanner.map((x:any)=>x.text),c.observable.interview.question,c.observable.interview.answer].join(' ').toLowerCase();
const grams=(s:string)=>{const w=s.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);return new Set(Array.from({length:Math.max(0,w.length-3)},(_,i)=>w.slice(i,i+4).join(' ')))};
const jaccard=(a:Set<string>,b:Set<string>)=>{const intersection=[...a].filter(x=>b.has(x)).length;return intersection/(a.size+b.size-intersection||1)};
let closest={heldout:'',prototype:'',similarity:0};
for(const c of cases)for(const p of prototypeCases){const similarity=jaccard(grams(content(c)),grams(content(p)));if(similarity>closest.similarity)closest={heldout:c.id,prototype:p.id,similarity};}
if(closest.similarity>=0.35) fail(`Held-out case too similar to prototype: ${JSON.stringify(closest)}`);
const normalized=cases.map(c=>content(c).replace(/\s+/g,' ')); if(new Set(normalized).size!==120)fail('Duplicate case content');

const repeatIds=manifest.repeatability.caseIds; if(repeatIds.length!==20||new Set(repeatIds).size!==20)fail('Invalid repeatability subset');
const repeatActionCounts=Object.fromEntries(actions.map(a=>[a,repeatIds.filter((id:string)=>gold[id].correctAction===a).length])); if(Object.values(repeatActionCounts).some(n=>n!==5))fail('Repeatability actions unbalanced');
for(const id of repeatIds)if(!gold[id])fail(`Unknown repeatability ID ${id}`);
for(const atomic of ['material_contradiction','explanation_supported','physical_concern','prohibited_shutdown','prohibited_pathogen','altered_identity'])if(!repeatIds.some((id:string)=>gold[id].expected[atomic]===true))fail(`Repeatability lacks positive ${atomic}`);
if(!['partial','evasive','complete'].every(v=>repeatIds.some((id:string)=>gold[id].expected.answer_completeness===v)))fail('Repeatability lacks answer-completeness coverage');

if(variants.length!==manifest.counts.consistencyVariants||new Set(variants.map(v=>v.id)).size!==variants.length)fail('Consistency count/IDs invalid');
const variantCounts=Object.fromEntries(manifest.consistency.variantTypes.map((t:string)=>[t,variants.filter(v=>v.variant===t).length])); if(Object.values(variantCounts).some(n=>n!==manifest.consistency.baseCaseIds.length))fail('Consistency types unbalanced');
for(const v of variants){
 const b=cases.find(c=>c.id===v.baseId);if(!b)fail(`Missing consistency base ${v.id}`);
 if(v.variant==='information-order'&&!eq(v.observable,b.observable))fail(`Order variant changed meaning ${v.id}`);
 if(v.variant==='irrelevant-information'){const copy=structuredClone(v.observable);delete copy.irrelevantInformation;if(!eq(copy,b.observable))fail(`Irrelevant variant changed evidence ${v.id}`);}
 if(v.variant==='species-swap'){const copy=structuredClone(v.observable);if(copy.profile.type===b.observable.profile.type)fail(`Species not swapped ${v.id}`);copy.profile.type=b.observable.profile.type;if(!eq(copy,b.observable))fail(`Species variant changed evidence ${v.id}`);}
 if(v.variant==='paraphrase'){const copy=structuredClone(v.observable);copy.declaration=b.observable.declaration;copy.interview.answer=b.observable.interview.answer;if(!eq(copy,b.observable))fail(`Paraphrase changed non-language evidence ${v.id}`);}
}
if(sensitivity.length!==Object.keys(sensitivityGold).length||sensitivity.length<6)fail('Sensitivity records invalid');
const sensitivityTypes=Object.fromEntries(manifest.sensitivity.categories.map((t:string)=>[t,sensitivity.filter(v=>v.variant===t).length])); if(Object.values(sensitivityTypes).some(n=>n<2))fail('Sensitivity category lacks multiple families');
for(const v of sensitivity){const g=sensitivityGold[v.id];if(!g||inferred(g.expected)!==g.correctAction)fail(`Sensitivity action mismatch ${v.id}`);if(g.correctAction===gold[v.baseId].correctAction)fail(`Sensitivity did not change action ${v.id}`);}

const atomicDistribution=Object.fromEntries(expectedKeys.map(k=>[k,Object.fromEntries([...new Set(cases.map(c=>String(gold[c.id].expected[k])))].sort().map(v=>[v,cases.filter(c=>String(gold[c.id].expected[k])===v).length]))]));
const categories=Object.fromEntries([...new Set(Object.values(metadata).map((m:any)=>m.category))].sort().map(category=>[category,Object.values(metadata).filter((m:any)=>m.category===category).length]));
const flags=cases.filter(c=>gold[c.id].reviewFlags.length||gold[c.id].borderline).map(c=>({caseId:c.id,borderline:gold[c.id].borderline,scoringEligible:gold[c.id].scoringEligible,acceptableActions:gold[c.id].acceptableActions,reviewFlags:gold[c.id].reviewFlags}));
const summary={status:manifest.status,baseCases:cases.length,actionCounts,typeByAction,originByAction,purposeByAction,atomicDistribution,categories,scoringEligible:cases.filter(c=>gold[c.id].scoringEligible).length,reviewRequired:cases.filter(c=>!gold[c.id].scoringEligible).length,borderline:cases.filter(c=>gold[c.id].borderline).length,flags,repeatability:{caseIds:repeatIds,actionCounts:repeatActionCounts,atomicDistribution:Object.fromEntries(expectedKeys.map(k=>[k,Object.fromEntries([...new Set(repeatIds.map((id:string)=>String(gold[id].expected[k])))].sort().map(v=>[v,repeatIds.filter((id:string)=>String(gold[id].expected[k])===v).length]))]))},consistency:{baseCases:manifest.consistency.baseCaseIds.length,variants:variants.length,byType:variantCounts},sensitivity:{variants:sensitivity.length,byType:sensitivityTypes,transitions:Object.fromEntries(actions.map(a=>[a,Object.fromEntries(actions.map(b=>[b,sensitivity.filter(v=>gold[v.baseId].correctAction===a&&sensitivityGold[v.id].correctAction===b).length]))]))},leakageChecks:{observableAllowlist:true,goldSeparate:true,latentTruthSeparate:true,metadataSeparate:true,typeExactlyUniformWithinAction:true,originExactlyUniformWithinAction:true,purposeExactlyUniformWithinAction:true,closestPrototypeFourGramJaccard:closest},validation:'passed'};
await writeFile(`${dir}/summary.json`,JSON.stringify(summary,null,2)+'\n');

const review:string[]=['# MARS GATE Held-out Benchmark v1 — Human Review Record','',`Status: **${manifest.status}**`,`Review stage: pre-benchmark; model outputs observed: **no**.`,`Base cases: ${cases.length}; frozen distribution: ${actions.map(a=>`${a} ${actionCounts[a]}`).join(', ')}.`,`Scoring eligible: ${summary.scoringEligible}; unresolved review cases: ${summary.reviewRequired}; borderline analysis flags: ${summary.borderline}.`,'','## Final adjudication record','','- HB-067 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.','- HB-079 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.','- HB-090 → INSPECT: observable physical identity, contents, or capability remains unresolved; `physical_concern=true` maps to INSPECT.','- HB-113 → QUESTION: departure information is omitted; `answer_completeness=partial` maps to QUESTION.','- HB-056 remains QUESTION and scoringEligible=true; its borderline flag remains analysis metadata.','','## Prototype annotation inconsistency','','Pre-benchmark review found that Prototype MG-18 has `physical_concern=false`, while the frozen question definition says: “A confirmed prohibited item is still a physical concern.” Prototype files and results remain unchanged. Held-out altered-identity cases prioritize the frozen question definition and consistently use `physical_concern=true`.','','`latent-truth.json` remains separate and is not scoring evidence. All 120 cases now have one reviewed action.','','## Base cases',''];
for(const c of cases){const g=gold[c.id],m=metadata[c.id],l=latent[c.id];review.push(`### ${c.id} — ${m.title}`,'',`- Frozen action: **${g.correctAction}**; scoringEligible: ${g.scoringEligible}; borderline: ${g.borderline}` ,`- Type / origin / purpose: ${c.observable.profile.type} / ${c.observable.profile.origin} / ${c.observable.profile.purpose}`,`- Category (review metadata only): ${m.category}`,`- D1: ${c.observable.documents[0].text}`,`- Declaration: ${c.observable.declaration}`,`- S1: ${c.observable.scanner[0].text}`,`- Interview Q: ${c.observable.interview.question}`,`- Interview A: ${c.observable.interview.answer}`,`- Frozen rationale: ${g.rationaleJa}`,`- Atomic GT: \`${JSON.stringify(g.expected)}\``,`- Analysis flags: ${g.reviewFlags.length?g.reviewFlags.join(', '):'none'}`,`- Latent truth (not scoring evidence): ${l.worldTruth}`,'');}
review.push('## Consistency families','',`Pre-fixed bases: ${manifest.consistency.baseCaseIds.join(', ')}. Each has paraphrase, information-order, irrelevant-information, and species-swap variants. These reuse the base Ground Truth and are excluded from base accuracy.`,'','## Sensitivity variants','');
for(const v of sensitivity){const g=sensitivityGold[v.id];review.push(`- ${v.id}: ${v.variant}; ${gold[v.baseId].correctAction} → ${g.correctAction}; ${g.rationaleJa}`);}
await writeFile(`${dir}/case-review.md`,review.join('\n')+'\n');

const artifactNames=['cases.json','gold-proposed.json','latent-truth.json','case-metadata.json','consistency-variants.json','sensitivity-variants.json','sensitivity-gold-proposed.json','review-adjudication.json','manifest.json','summary.json','case-review.md'];
const prototypeNames=['data/cases.json','data/gold.json','data/variants.json']; const sha=async(path:string)=>createHash('sha256').update(await readFile(path)).digest('hex');
const hashJson=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const previousFreeze=JSON.parse(await readFile(`${dir}/freeze.json`,'utf8'));
const components={cases:await sha(`${dir}/cases.json`),gold:await sha(`${dir}/gold-proposed.json`),metadata:await sha(`${dir}/case-metadata.json`),repeatabilitySubset:hashJson(manifest.repeatability),consistencyVariants:await sha(`${dir}/consistency-variants.json`),consistencyDesign:hashJson(manifest.consistency),sensitivityVariants:await sha(`${dir}/sensitivity-variants.json`),sensitivityGold:await sha(`${dir}/sensitivity-gold-proposed.json`),questions:hashJson(QUESTIONS),policy:hashJson(POLICY),thresholds:hashJson(THRESHOLDS),decisionRules:hashJson(decide.toString()),judgmentsSource:await sha('src/judgments.ts'),modelSettings:hashJson(manifest.modelSettings),reviewAdjudication:await sha(`${dir}/review-adjudication.json`),benchmarkManifest:await sha(`${dir}/manifest.json`)};
const freeze={schemaVersion:2,dataset:'MARS GATE Held-out Benchmark',benchmarkVersion:'v1',status:'reviewed/frozen',groundTruthStatus:'reviewed/frozen',humanReviewStatus:'complete',frozenAt:'2026-09-22',modelApiRuns:0,modelApiRunsAtFreeze:0,components,overallFreezeHash:hashJson(components)};
await writeFile(`${dir}/freeze.json`,JSON.stringify(freeze,null,2)+'\n');
const oldOverall='341b3128158df5d608a6e10b70b0830170581467d85bc9634cceeebdce71ad2e';
let oldRecord=previousFreeze.overallFreezeHash===oldOverall?previousFreeze:null;
try{const existing=JSON.parse(await readFile(`${dir}/freeze-history.json`,'utf8'));oldRecord=oldRecord??existing.supersededFreeze;}catch{}
if(!oldRecord||oldRecord.overallFreezeHash!==oldOverall)fail('Superseded freeze record unavailable');
const oldKeys=Object.keys(oldRecord.components);const newKeys=Object.keys(components);
const componentComparison={unchanged:oldKeys.filter(k=>k in components&&oldRecord.components[k]===components[k]),added:newKeys.filter(k=>!(k in oldRecord.components)),removed:oldKeys.filter(k=>!(k in components)),changed:oldKeys.filter(k=>k in components&&oldRecord.components[k]!==components[k])};
if(componentComparison.changed.length||componentComparison.removed.length||componentComparison.added.join()!=='benchmarkManifest')fail(`Unexpected freeze component changes: ${JSON.stringify(componentComparison)}`);
const freezeHistory={schemaVersion:1,reason:'Pre-run integrity gate found that the benchmark manifest hash was not recorded as a freeze.json component. With model API runs still at 0, provenance metadata only was completed and the benchmark was re-frozen. Benchmark content did not change.',reasonJa:'Pre-run integrity gateでbenchmark manifest hashがfreeze.jsonのcomponentとして記録されていないことを発見。model API run 0件の状態でprovenance metadataのみ補完して再freezeした。Benchmark contentは変更していない。',supersededFreeze:oldRecord,currentFreeze:{overallFreezeHash:freeze.overallFreezeHash,benchmarkManifestHash:components.benchmarkManifest,status:freeze.status,modelApiRuns:0},componentComparison};
await writeFile(`${dir}/freeze-history.json`,JSON.stringify(freezeHistory,null,2)+'\n');
const integrity={generatedAt:'2026-09-22',prototypeDevelopmentSet:{role:'frozen development set; excluded from held-out accuracy',files:Object.fromEntries(await Promise.all(prototypeNames.map(async p=>[p,await sha(p)])))},heldOutArtifacts:Object.fromEntries(await Promise.all(artifactNames.concat('freeze.json','freeze-history.json').map(async p=>[p,await sha(`${dir}/${p}`)])))};
await writeFile(`${dir}/integrity.json`,JSON.stringify(integrity,null,2)+'\n');
console.log(JSON.stringify({validation:summary.validation,baseCases:summary.baseCases,actionCounts,scoringEligible:summary.scoringEligible,reviewRequired:summary.reviewRequired,borderline:summary.borderline,repeatability:repeatActionCounts,consistency:summary.consistency,sensitivity:summary.sensitivity,closestPrototype:closest},null,2));
