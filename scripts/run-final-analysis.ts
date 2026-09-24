import { generateFinalAnalysis } from './generate-final-analysis.ts';
import { writeFinalReport } from './write-final-analysis-report.ts';
const r=await generateFinalAnalysis();
await writeFinalReport();
console.log(JSON.stringify({audit:r.auditSummary,
 models:r.metrics.map(x=>({model:x.model,base:x.base.finalCorrect,atomic:x.base.atomic.correct,
  repeatability:x.repeatability.finalCorrect,consistency:x.consistency.actionAgreement,
  sensitivity:x.sensitivity.variantGoldCorrect})),improvedCases:r.changed56to6.length},null,2));
if(r.auditSummary.status!=='PASS')process.exitCode=1;
