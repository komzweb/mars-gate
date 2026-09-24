import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { QUESTIONS, POLICY, THRESHOLDS, decide } from '../src/judgments.ts';

const dir='benchmark/v1';
const read=async(name:string)=>JSON.parse(await readFile(`${dir}/${name}`,'utf8'));
const sha=async(path:string)=>createHash('sha256').update(await readFile(path)).digest('hex');
const hashJson=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const [freeze,history,manifest]=await Promise.all([read('freeze.json'),read('freeze-history.json'),read('manifest.json')]);
const actual:Record<string,string>={cases:await sha(`${dir}/cases.json`),gold:await sha(`${dir}/gold-proposed.json`),metadata:await sha(`${dir}/case-metadata.json`),repeatabilitySubset:hashJson(manifest.repeatability),consistencyVariants:await sha(`${dir}/consistency-variants.json`),consistencyDesign:hashJson(manifest.consistency),sensitivityVariants:await sha(`${dir}/sensitivity-variants.json`),sensitivityGold:await sha(`${dir}/sensitivity-gold-proposed.json`),questions:hashJson(QUESTIONS),policy:hashJson(POLICY),thresholds:hashJson(THRESHOLDS),decisionRules:hashJson(decide.toString()),judgmentsSource:await sha('src/judgments.ts'),modelSettings:hashJson(manifest.modelSettings),reviewAdjudication:await sha(`${dir}/review-adjudication.json`),benchmarkManifest:await sha(`${dir}/manifest.json`)};
const mismatches=Object.entries(freeze.components).filter(([name,value])=>actual[name]!==value).map(([name,expected])=>({name,expected,actual:actual[name]??null}));
for(const name of Object.keys(actual))if(!(name in freeze.components))mismatches.push({name,expected:'present in freeze components',actual:null});
const recomputedOverall=hashJson(freeze.components);
if(recomputedOverall!==freeze.overallFreezeHash)mismatches.push({name:'overallFreezeHash',expected:freeze.overallFreezeHash,actual:recomputedOverall});
if(freeze.modelApiRuns!==0||manifest.modelApiRuns!==0)mismatches.push({name:'modelApiRuns',expected:0,actual:freeze.modelApiRuns});
if(history.supersededFreeze.overallFreezeHash!=='341b3128158df5d608a6e10b70b0830170581467d85bc9634cceeebdce71ad2e')mismatches.push({name:'supersededFreeze',expected:'341b3128158df5d608a6e10b70b0830170581467d85bc9634cceeebdce71ad2e',actual:history.supersededFreeze.overallFreezeHash});
const report={verified:mismatches.length===0,benchmarkVersion:freeze.benchmarkVersion,status:freeze.status,modelApiRuns:freeze.modelApiRuns,overallFreezeHash:freeze.overallFreezeHash,benchmarkManifestHash:freeze.components.benchmarkManifest,componentCount:Object.keys(freeze.components).length,mismatches};
console.log(JSON.stringify(report,null,2));
if(mismatches.length)process.exitCode=2;
