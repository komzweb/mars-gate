import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR='results/benchmark-v1/final-analysis';
const read=async(name:string)=>JSON.parse(await readFile(join(DIR,name),'utf8'));
const pct=(n:number,d:number)=>(100*n/d).toFixed(1)+'%';
const ms=(x:number)=>Math.round(x).toLocaleString('en-US');
const money=(x:number)=>'$'+x.toFixed(6);
const labels=['Jev','GPT-5.6 Luna Medium','GPT-6 Luna Medium'];
const short=['Jev','GPT-5.6 Luna','GPT-6 Luna'];
const claims=[
 {claim:'Jev is faster on this workload',classification:'Strongly supported',recommended:'Frozen Base の観測p50は Jev 296 ms、GPT-5.6 Luna 6,572 ms、GPT-6 Luna 3,457 ms。',avoid:'Jev のモデルアーキテクチャ自体が22倍高速。'},
 {claim:'Jev is cheaper on this workload',classification:'Strongly supported',recommended:'今回の料金前提で、Base 120件の推定API費用は Jev $0.00882、GPT-5.6 $0.10725、GPT-6 $0.05170。',avoid:'あらゆる運用条件で Jev が安い。'},
 {claim:'Jev is more accurate than GPT-5.6 Luna on Base',classification:'Supported with caveats',recommended:'この120件では Jev 119/120、GPT-5.6 Luna 109/120。',avoid:'Jev は一般的に GPT-5.6 より正確。'},
 {claim:'Jev is more accurate than GPT-6 Luna',classification:'Not supported',recommended:'Base Final Action は GPT-6 120/120、Jev 119/120。',avoid:'Jev は GPT-6 より正確。'},
 {claim:'Jev has higher Base atomic accuracy than GPT-6 Luna',classification:'Strongly supported',recommended:'Base atomic Gold 一致は Jev 910/960、GPT-6 888/960。',avoid:'atomic accuracy が高いので Final Action も必ず高い。'},
 {claim:'GPT-6 has the highest observed Base Final Action accuracy',classification:'Strongly supported',recommended:'Frozen Base では GPT-6 が120/120で、3モデル中最多。',avoid:'GPT-6 はどんな審査でも誤らない。'},
 {claim:'Jev is generally better than LLMs',classification:'Not supported',recommended:'この固定された架空ドメインと条件の範囲で記述する。',avoid:'Jev は一般的な LLM より優秀。'},
 {claim:'GPT-6 is generally better than Jev',classification:'Not supported',recommended:'GPT-6 は Base Final Action で1件多く正解し、Jev は atomic、速度、推定費用で優位だった。',avoid:'GPT-6 は Jev を全面的に上回る。'},
 {claim:'Jev is more consistent than GPT-5.6 on these variants',classification:'Supported with caveats',recommended:'事前固定の48 variantsでは Base→Variant action一致が Jev 48/48、GPT-5.6 36/48。',avoid:'transformの影響だけで12件差が生じた。'},
 {claim:'Jev and GPT-6 both achieved perfect observed Final Action consistency on the frozen consistency set',classification:'Strongly supported',recommended:'この48 variantsでは両者とも48/48 action一致、48/48 Gold一致。',avoid:'どんなparaphraseでも絶対に安定。'},
 {claim:'species causes GPT-5.6 decisions to change',classification:'Not supported',recommended:'species-swap 12件中5件で Base から action が異なったが、same-input変動との切り分けはできない。',avoid:'種族属性が GPT-5.6 の判断変化を引き起こした。'},
 {claim:'observed species-swap responses differed more for GPT-5.6',classification:'Supported with caveats',recommended:'species-swap のaction変化は GPT-5.6 5/12、JevとGPT-6は0/12。',avoid:'この差はモデルの偏見を証明する。'},
 {claim:'all three models have a general sensitivity problem',classification:'Not supported',recommended:'この9件の sensitivity subset で各モデルは4～6件を外した。',avoid:'3モデルには一般的な感度欠陥がある。'},
 {claim:'sensitivity subset suggests a potential shared weakness / benchmark-design issue',classification:'Supported with caveats',recommended:'9 variantsのうち4件で全モデルがGoldを外し、事後レビューではGold/item解釈の論点も見つかった。',avoid:'4件の共通失敗はモデル能力だけに起因する。'},
];
const limitations=[
 '火星入境審査という単一の架空ドメインで、Baseは手作業設計の120件。外部ベンチマークへの一般化は未確認。',
 'policy、8つのatomic judgment、閾値、決定ルールはこの用途向けに固定された。モデル単体の汎用能力を測ったものではない。',
 'Jevは1バージョン、OpenAIは各世代1つのmodel/reasoning configurationで、世代間にリリース時期とAPI条件の差がある。',
 'API構成、provider infrastructure、network、cache、output/reasoning token accounting が異なる。latency/cost差をモデルアーキテクチャの因果効果に還元できない。料金は変更され得る推定値。',
 'JevのconfidenceとLLMが生成したprobabilityは同一の較正指標ではない。直接的な確率性能比較は行っていない。',
 'Repeatabilityは20ケース×5回、Consistencyは12 family×4 variants、Sensitivityは9 variantsのみ。特にSensitivityの比率は不安定。',
 'Sensitivity 9件中4件は3モデル共通でFrozen Goldから外れ、Gold/itemの曖昧さを含む可能性がある。Frozen v1の採点は維持した。',
 'human baselineがなく、独立した外部データセットもない。held-out上のthreshold tuningは行っていない。',
 '事後のcounterfactual replay、4件review、claims解釈は事前固定されたmetricとは異なる。探索的分析として区別する。',
 'Jev RepeatabilityのHTTP 520ではusageが返らず、当該suiteの推定costは成功応答subtotalであり総費用の下限。',
];

export async function writeFinalReport(){
 const d=await read('publication-data.json'),audit=await read('audit-summary.json'),inventory=await read('source-inventory.json');
 const replay=await read('atomic-final-action-replay.json'),review=await read('sensitivity-four-case-review-data.json');
 const models=d.models;
 await writeFile(join(DIR,'claims-audit.json'),JSON.stringify(claims,null,2)+'\n');
 await writeFile(join(DIR,'limitations.json'),JSON.stringify(limitations,null,2)+'\n');
 const out:string[]=[];const add=(...x:string[])=>out.push(...x);
 add('# MARS GATE Frozen Held-out Benchmark v1 — Final Analysis','',
  '> Frozen v1 の実験結果に対する独立再集計と事後解釈。新しい inference は実行していない。Accuracy と post-hoc item review は区別する。','',
  '## Executive Summary','',
  `Frozen v1 の8 run・${audit.rawRequestCount} request recordをraw JSONLから再集計した。freeze hash ${audit.freezeHash}、manifest hash ${audit.benchmarkManifestHash}を確認し、既存summaryとの${audit.checks}照合項目は全件MATCH（MISMATCH ${audit.mismatches}）。`,
  'Base Final Action は Jev 119/120、GPT-5.6 Luna 109/120、GPT-6 Luna 120/120。Jev は最も低いp50 latencyと推定費用、最も高いBase atomic Gold一致を示した。GPT-6 は最も高いBase Final Action一致を示した。Sensitivityは9件中、Jev 5件、GPT-5.6 3件、GPT-6 4件のみGoldに沿って変化した。4件の共通失敗にはitem/annotationの解釈上の論点がある。','',
  '## Research Question and Experimental Design','',
  '問いは、深い多段推論を必要としない小さな意味判断において、Jev が一般的なLLMと比べて精度、安定性、速度、費用で実用的な差を持つかである。120件の観測可能Stateと、事前固定の8 atomic judgments、shared deterministic final-action rules、Goldを用いた。Base、同一入力のRepeatability、意味保存のConsistency、意味変更のSensitivityは別の測定であり、合成スコアは作らない。','',
  '## Freeze, Provenance, Models','',
  `Execution freeze: \`${audit.freezeHash}\`。benchmark manifest: \`${audit.benchmarkManifestHash}\`。component mismatch 0。GPT-6 post-freeze external config: \`${audit.gpt6ConfigHash}\`（Base/Repeatability/Consistency/Sensitivityで同一）。GPT-6追加に際してFrozen v1を再freezeしていない。`,
  '初期Frozen v1の実装・実行はCodex GPT-5.6 Sol Medium、Consistency以降の作業はCodex GPT-6 Sol Medium。これはdevelopment toolingの記録であり、評価対象のJev 1.13.0、GPT-5.6 Luna Medium、post-freeze追加のGPT-6 Luna Mediumとは別。詳細は [development history](../../../docs/development-history.md) と [source inventory](source-inventory.json)。','',
  '| Suite | Result run | Raw requests | Provider/model |','|---|---|---:|---|');
 for(const r of inventory.runs)add(`| ${r.suite} | [${r.runKey}](../${r.path.split('/').pop()}/manifest.json) | ${r.requestCount} | ${r.requestedModels.join(', ')} |`);
 add('','各runのtimestamp、manifest path、raw record hash、model settings、freeze/config hashは [source-inventory.json](source-inventory.json) に保存した。既存runのraw responseは変更していない。','',
  '## Independent Audit','',
  `Freeze検証とdataset validationはPASS。Baseのclass recall、confusion matrix、atomic判断、tokens/cost/error、Repeatabilityの5/5、Consistencyのfamily/transformation、Sensitivityのatomic change等を再集計した。${audit.checks}項目すべてMATCH、MISMATCH 0。全照合値は [independent-audit.json](independent-audit.json) / [CSV](audit-comparison.csv)。`,
  'この照合は既存summaryとの算術的一致を示すもので、Goldの意味的妥当性を証明しない。','',
  '## Base Benchmark','',
  '| Model | Final Action | Atomic | p50 / mean / p95 latency | Estimated cost | Cost/case | Cost/correct |',
  '|---|---:|---:|---:|---:|---:|---:|');
 for(const m of models)add(`| ${m.model} | ${m.base.finalCorrect}/120 (${pct(m.base.finalCorrect,120)}) | ${m.base.atomic.correct}/960 (${pct(m.base.atomic.correct,960)}) | ${ms(m.base.performance.latencyP50Ms)} / ${ms(m.base.performance.latencyMeanMs)} / ${ms(m.base.performance.latencyP95Ms)} ms | ${money(m.base.performance.knownEstimatedCostUsd)} | ${money(m.base.performance.costPerCaseUsd)} | ${money(m.base.performance.costPerCorrectUsd)} |`);
 add('','Class recall (CLEAR / QUESTION / INSPECT / DENY):');
 for(const m of models)add(`- ${m.model}: ${(['CLEAR','QUESTION','INSPECT','DENY'] as const).map(a=>`${m.base.recall[a].correct}/30`).join(' / ')}。Confusion matrixは [publication-data.json](publication-data.json) に収録。`);
 add('','Judgment別 Base Gold 一致（各120件）:','','| Judgment | Jev | GPT-5.6 | GPT-6 |','|---|---:|---:|---:|');
 for(const q of Object.keys(models[0].base.atomic.byJudgment))add(`| ${q} | ${models.map((m:any)=>m.base.atomic.byJudgment[q].correct+'/120').join(' | ')} |`);
 add('','## Atomic Judgments versus Final Action','',
  'Final Actionは8つのhard labelの単純な多数決ではない。確率分布と優先順位つき閾値をshared ruleに通すため、hard labelがGoldと異なってもFinal Actionは同じ場合があり、hard labelが合っていても閾値をまたがずactionが異なる場合がある。次の反実仮想は**モデル回答中の誤ったatomic出力をGold one-hotに置換し、同じdecision codeで再実行**した探索的なreplayであり、モデル内部の因果機構ではない。','',
  '| Model | Final error | 正しいFinalでもatomic errorあり | 誤答で1 judgment置換がGold actionに十分 | 誤答で全atomic error置換がGold actionに十分 |',
  '|---|---:|---:|---:|---:|');
 for(const x of replay)add(`| ${x.model} | ${x.counts.finalErrors} | ${x.counts.correctFinalWithAtomicErrors} | ${x.counts.finalErrorsWithSingleCorrectionSufficient} | ${x.counts.finalErrorsCorrectedByAllAtomicGold} |`);
 add('','GPT-5.6の11 Final errorでは、prohibited 3 judgmentのhard-label誤りが各7件、explanation_supportedが8件、physical_concernが4件に併存した。単一Gold置換でGold actionに到達したのはHB-034/HB-060のexplanation_supported、HB-104のanswer_completenessの3件。残りでは複数出力とrule優先順位が関わる。',
  'HB-068のJevは8 hard labelがGoldと一致しても、altered_identity等のD1閾値0.85へ届かずINSPECTとなった（最寄りのdeny閾値まで0.12）。この例はhard-label accuracyだけではactionを説明できないことを示す。GPT-5.6のFinal errorのうち最寄り閾値まで0.1以下はHB-021、HB-034、HB-104。距離は観測上の関連であり、それ自体は原因の証明ではない。ケース別replayは [atomic-final-action-replay.json](atomic-final-action-replay.json)。','',
  '## Repeatability: same input','',
  '| Model | Successful requests | Final Gold | 5/5 action agreement | Mean modal agreement | p50 latency | Known estimated cost |',
  '|---|---:|---:|---:|---:|---:|---:|');
 for(const m of models)add(`| ${m.model} | ${m.repeatability.successful}/100 | ${m.repeatability.finalCorrect}/100 | ${m.repeatability.all5Cases}/20 | ${pct(m.repeatability.meanModalAgreement*100,100)} | ${ms(m.repeatability.performance.latencyP50Ms)} ms | ${money(m.repeatability.performance.knownEstimatedCostUsd)}${m.repeatability.performance.costComplete?'':'*'} |`);
 add('','* Jev HB-073 repeat index 1はHTTP 520で応答欠測。99件の成功応答はすべてFinal Goldと一致。99/100は失敗requestを分母に残した値で、意味判断99/99とは区別する。usage不明のためJev Repeatability costは既知応答の小計・下限。','',
  '## Consistency: meaning-preserving variants','',
  '| Model | Base→Variant action | Variant Gold | Atomic agreement | All-family-correct |',
  '|---|---:|---:|---:|---:|');
 for(const m of models)add(`| ${m.model} | ${m.consistency.actionAgreement}/48 | ${m.consistency.goldCorrect}/48 | ${m.consistency.atomicAgreement}/384 | ${m.consistency.allFamilyCorrect}/12 |`);
 add('','Transformation別 action agreement / variant Gold / atomic agreement:','',
  '| Transformation | Jev | GPT-5.6 | GPT-6 |','|---|---|---|---|');
 for(const t of ['paraphrase','information-order','irrelevant-information','species-swap'])add(`| ${t} | ${models.map((m:any)=>{const z=m.consistency.transformations[t];return `${z.actionAgreement}/12 · ${z.goldCorrect}/12 · ${z.atomicAgreement}/96`;}).join(' | ')} |`);
 add('','これはobserved consistencyであり、variantの変化をtransformationの因果効果と直結しない。same-input repeatabilityとは別データで、GPT-5.6には同一入力でもactionの変動が観測された。','',
  '## Species-swap','',
  'Frozen variantsではprofile.typeだけを変更し、decision-relevant observable evidenceを維持した。ActionがBaseから変わったvariantは Jev 0/12、GPT-5.6 5/12、GPT-6 0/12。GPT-5.6の5 IDs: '+models[1].consistency.speciesSwap.actionChanged.join(', ')+'。Atomic変更はJev 2 variants、GPT-5.6 8 variants、GPT-6 7 variants。これは観測された属性置換感度であり、内的な偏見や属性変更の単独因果効果を証明しない。','',
  '## Sensitivity: decision-relevant evidence changes','',
  '| Model | Variant Gold /9 | Any action change /9 | Correct required change /9 | Expected atomic exact /20 | Missed | Wrong direction | Unexpected stable-Gold atomic changes |',
  '|---|---:|---:|---:|---:|---:|---:|---:|');
 for(const m of models)add(`| ${m.model} | ${m.sensitivity.variantGoldCorrect} | ${m.sensitivity.actionChanged} | ${m.sensitivity.correctActionChange} | ${m.sensitivity.correctExpectedAtomic} | ${m.sensitivity.missedExpectedAtomic} | ${m.sensitivity.wrongDirectionAtomic} | ${m.sensitivity.unexpectedAtomic} |`);
 add('','正しい方向へのaction変化のみ成功とした。9件中4件（HB-002、HB-013、HB-040、HB-073）は3モデルともFrozen Goldを外した。Stability（Consistency action維持）とResponsiveness（Sensitivity Goldへの正しいaction変更）は、それぞれ Jev 48/48・5/9、GPT-5.6 36/48・3/9、GPT-6 48/48・4/9。合成スコアは作らない。','',
  '## Four shared Sensitivity misses: post-hoc review','',
  '| Source | Frozen transition | Jev | GPT-5.6 | GPT-6 | Review finding |','|---|---|---|---|---|---|');
 for(const x of review){const p=x.providers;const findings:Record<string,string>={
  'HB-002':'署名済み訂正は説明を支持するが、支払有無への面接回答は依然部分的。Gold CLEARとanswer_completenessに曖昧さ（high）。',
  'HB-013':'文書を削除しても回避的回答は同一。variant Goldがevasive→completeへ変わる点は定義と緊張（high）。',
  'HB-040':'identityの確証は消えたが残存の申告・面接に意味的不一致がありQUESTIONも合理的（medium）。',
  'HB-073':'確証除去でDENYは解消。未解決のcredential像差異がphysical_concernかどうかでQUESTION/INSPECTが分かれる（medium）。'};
  add(`| ${x.caseId} | ${x.baseGold.correctAction}→${x.variantGold.correctAction} | ${p[0].baseAction}→${p[0].variantAction} | ${p[1].baseAction}→${p[1].variantAction} | ${p[2].baseAction}→${p[2].variantAction} | ${findings[x.caseId]} |`);
 }
 add('','[4-case詳細](sensitivity-four-case-posthoc-review.md)にはbase/variant observable、Frozen atomic Gold、3モデルの生確率・rule、A.本当に難しい意味変化、B.atomic分解、C.final rule、D.Gold/item曖昧さについて賛否双方を収録した。結論は事後解釈であり、Frozen Gold・既存accuracyを変更しない。','',
  '## Efficiency on Base','',
  '| Comparison (A / B) | p50 latency A/B | Mean latency A/B | Total estimated cost A/B |','|---|---:|---:|---:|');
 for(const x of d.efficiencyRatios)add(`| ${x.pair} | ${x.latencyP50RatioAOverB.toFixed(3)} (${(1/x.latencyP50RatioAOverB).toFixed(1)}× B/A) | ${x.latencyMeanRatioAOverB.toFixed(3)} | ${x.totalCostRatioAOverB.toFixed(3)} (${(1/x.totalCostRatioAOverB).toFixed(1)}× B/A) |`);
 add('','各費用/件・費用/正答はBase表に記載。Jev/LLMではAPI architecture、provider infrastructure、cache挙動、reasoning/output token accounting、料金体系が違う。比較値はこのworkloadとrun環境の観測値であり、モデル内部の速度・コスト差としては解釈しない。','',
  '## GPT-5.6 → GPT-6: observed difference','',
  `GPT-5.6のBase誤答11件はGPT-6ですべて正答となり、新規Final errorは0件。case IDs: ${d.gpt56ErrorsResolvedByGpt6.map((x:any)=>x.caseId).join(', ')}。`,
  `この11件でのhard-label改善は explanation_supported ${d.judgmentImprovement.explanation_supported.improved}件、physical_concern ${d.judgmentImprovement.physical_concern.improved}件、3つのprohibited/identity judgmentが各7件。material_contradictionは2件で逆にGoldから離れた。詳細は [improvements JSON](gpt56-to-gpt6-improvements.json)。`,
  `Base p50 latency は ${ms(models[1].base.performance.latencyP50Ms)}→${ms(models[2].base.performance.latencyP50Ms)} ms、推定費用は ${money(models[1].base.performance.knownEstimatedCostUsd)}→${money(models[2].base.performance.knownEstimatedCostUsd)}。Repeatability Final Gold は93/100→100/100、5/5同一actionは13/20→20/20。Consistency action一致は36/48→48/48、species-swap action変化は5/12→0/12。このFrozen workloadで観測された差であり、「世代だけ」が原因との主張ではない。`,'',
  '## Claims audit: what results support','',
  '| Claim | Classification | Recommended wording | Avoid |','|---|---|---|---|');
 for(const x of claims)add(`| ${x.claim} | ${x.classification} | ${x.recommended} | ${x.avoid} |`);
 add('','分類の根拠となる数値と、より短い再利用形式は [claims-audit.json](claims-audit.json)。','',
  '## Limitations','');
 for(const x of limitations)add(`- ${x}`);
 add('','## Reproducibility and publication package','',
  '`npm run benchmark:final-analysis` は保存済みraw recordsを読み、freeze検証と独立集計・照合を行い、このディレクトリの派生ファイルを再生成する。Jev/OpenAIへのinference requestは送らない。Source manifestとraw hashは [inventory](source-inventory.json)、主要値は [publication-data.json](publication-data.json) / [CSV](publication-data.csv)、chart用long-formは [chart-data.json](chart-data.json) / [CSV](chart-data.csv)。Judgment、transformation、Sensitivityは別CSVを収録。','',
  '## Publication-ready headline findings','',
  `1. Frozen BaseでGPT-6 Luna MediumはFinal Action 120/120、Jevは119/120、GPT-5.6 Luna Mediumは109/120だった。`,
  `2. JevのBase atomic Gold一致は910/960で、GPT-6の888/960を上回ったが、Final Actionは1件少なかった。`,
  `3. JevのBase p50は296 ms、推定総費用$0.00882で、3モデル中最小だった。`,
  `4. 同一入力RepeatabilityではGPT-6は100/100正答・20/20 familyで5/5同一action、GPT-5.6は93/100・13/20だった。`,
  `5. 意味保存ConsistencyではJevとGPT-6が48/48 action維持、GPT-5.6は36/48だった。`,
  `6. Species-swapのBaseからのaction変化はGPT-5.6で5/12、JevとGPT-6で0/12観測された。変化の原因は断定しない。`,
  `7. Decision-changing SensitivityでGoldへの正しいaction変更はJev 5/9、GPT-5.6 3/9、GPT-6 4/9だった。`,
  `8. Sensitivityの4件は3モデル共通でGoldを外し、事後レビューでitem/annotationの曖昧さも確認された。`,
  `9. GPT-5.6のBase誤答11件はすべてGPT-6で正答となり、GPT-6の新規誤答は0件だった。`,
  '');
 await writeFile(join(DIR,'frozen-v1-final-analysis.md'),out.join('\n')+'\n');
}
