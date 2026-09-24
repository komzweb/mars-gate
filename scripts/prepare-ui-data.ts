import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { verifyExecutionFreeze } from '../src/frozen-benchmark.ts';

const root='results/benchmark-v1';
const read=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const readRows=async(dir:string)=>(await readFile(join(root,dir,'records.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x));
const main=async()=>{
 const gate=await verifyExecutionFreeze();if(!gate.pass)throw new Error('Frozen benchmark integrity failed');
 const [cases,gold,benchmarkManifest,oldRows,newRows,publication,claims,limitations]=await Promise.all([
  read('benchmark/v1/cases.json'),read('benchmark/v1/gold-proposed.json'),read('benchmark/v1/manifest.json'),
  readRows('2026-09-23T02-04-26-591Z-frozen-benchmark-v1-live'),
  readRows('2026-09-23T03-32-46-030Z-postfreeze-gpt6-luna-base-live'),
  read(join(root,'final-analysis/publication-data.json')),
  read(join(root,'final-analysis/claims-audit.json')),
  read(join(root,'final-analysis/limitations.json'))]);
 if(cases.length!==120||oldRows.length!==240||newRows.length!==120||publication.auditStatus!=='PASS')throw new Error('UI source count or audit mismatch');
 const model=(r:any)=>r.provider==='jev'?'jev':r.modelRequested==='gpt-6-luna'?'gpt6':'gpt56';
 const results=Object.fromEntries([...oldRows,...newRows].map(r=>[`${r.caseId}:${model(r)}`,{
  caseId:r.caseId,model:model(r),status:r.status,requestedModel:r.modelRequested,resolvedModel:r.modelResolved,
  answers:r.answers,action:r.decision?.action??null,rule:r.decision?.rule??null,
  latencyMs:r.latencyMs,costUsd:r.estimatedCostUsd,usage:r.usage,error:r.error,
 }]));
 if(Object.keys(results).length!==360)throw new Error('UI results must contain exactly three responses per case');
 const output={schemaVersion:1,mode:'FROZEN RESULT',freezeHash:gate.freeze.overallFreezeHash,
  thresholds:benchmarkManifest.thresholds,
  cases:cases.map((c:any)=>({id:c.id,observable:c.observable,gold:{action:gold[c.id].correctAction,
   expected:gold[c.id].expected,rationale:gold[c.id].rationaleJa,borderline:gold[c.id].borderline}})),
  results,publication:{models:publication.models.map((m:any)=>({model:m.model,base:m.base,
   repeatability:{attempted:m.repeatability.attempted,successful:m.repeatability.successful,finalCorrect:m.repeatability.finalCorrect,
    all5Cases:m.repeatability.all5Cases,meanModalAgreement:m.repeatability.meanModalAgreement},
   consistency:{variants:m.consistency.variants,actionAgreement:m.consistency.actionAgreement,goldCorrect:m.consistency.goldCorrect,
    atomicAgreement:m.consistency.atomicAgreement,allFamilyCorrect:m.consistency.allFamilyCorrect},
   sensitivity:{variants:m.sensitivity.variants,variantGoldCorrect:m.sensitivity.variantGoldCorrect,correctActionChange:m.sensitivity.correctActionChange}})),
   commonSensitivityMisses:publication.allThreeSensitivityMissIds},claims,limitations};
 await mkdir('ui/src/data',{recursive:true});
 await writeFile('ui/src/data/frozen.json',JSON.stringify(output));
 console.log(JSON.stringify({cases:output.cases.length,responses:Object.keys(results).length,freezeHash:output.freezeHash}));
};
await main();
