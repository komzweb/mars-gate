import React from 'react';
import {MODELS,modelMetric,publication,claims,limitations,formatCost,formatLatency} from '../lib/benchmark.js';
import {headlineFindings} from '../lib/decisionPresentation.js';

function BarMetric({title,getValue,total,subtext}){
 return <div className="research-metric">
  <div className="research-metric-head"><h3>{title}</h3><span>{subtext}</span></div>
  {MODELS.map(m=>{const value=getValue(modelMetric(m.id));const ratio=total?value/total:0;
   return <div className="bar-row" key={m.id}>
    <span className="bar-label">{m.label}</span>
    <div className="bar-track" aria-hidden="true"><div className={`bar-fill bar-${m.id}`} style={{width:`${Math.max(0,Math.min(100,ratio*100))}%`}}/></div>
    <strong>{value}/{total}</strong>
   </div>})}
 </div>;
}
function NumericMetric({title,getValue,format}){
 return <div className="research-metric">
  <div className="research-metric-head"><h3>{title}</h3><span>FROZEN BASE · 120 CASES</span></div>
  {MODELS.map(m=>{const value=getValue(modelMetric(m.id));const all=MODELS.map(x=>getValue(modelMetric(x.id)));const max=Math.max(...all);
   return <div className="bar-row" key={m.id}>
    <span className="bar-label">{m.label}</span>
    <div className="bar-track" aria-hidden="true"><div className={`bar-fill bar-${m.id}`} style={{width:`${100*value/max}%`}}/></div>
    <strong>{format(value)}</strong>
   </div>})}
 </div>;
}
export function ResearchScreen(){
 const [showLimitations,setShowLimitations]=React.useState(false);
 const reference=modelMetric('jev');
 return <main className="research-screen" id="main-content">
  <div className="screen-kicker"><span className="signal-dot"/> RESEARCH ARCHIVE / FROZEN V1</div>
  <div className="research-intro"><div><h1>What did the terminal find?</h1><p>Three systems. The same 120 observed cases. Eight semantic judgments and one shared routing policy.</p></div><span className="research-stamp">FROZEN DATA<br/>NO LIVE INFERENCE</span></div>
  <section className="headlines" aria-label="Headline findings"><div className="headline-heading">HEADLINE FINDINGS <span>OBSERVED · FROZEN WORKLOAD</span></div><div className="headline-grid">{headlineFindings().map(x=><div className="headline-card" key={x.eyebrow}><small>{x.eyebrow}</small><strong>{x.value}</strong><p>{x.label}</p></div>)}</div></section>
  <div className="research-layout">
   <section className="research-main" aria-labelledby="base-heading">
    <div className="section-heading"><span>01 / BASE BENCHMARK</span><h2 id="base-heading">Decision quality</h2></div>
    <div className="research-pair">
     <BarMetric title="Final Action Accuracy" total={reference.base.attempted} getValue={m=>m.base.finalCorrect} subtext="Gold-correct routing"/>
     <BarMetric title="Atomic Accuracy" total={reference.base.atomic.total} getValue={m=>m.base.atomic.correct} subtext="8 judgments × 120 cases"/>
    </div>
    <div className="section-heading"><span>02 / EFFICIENCY</span><h2>Response and cost</h2></div>
    <div className="research-pair">
     <NumericMetric title="p50 Latency" getValue={m=>m.base.performance.latencyP50Ms} format={formatLatency}/>
     <NumericMetric title="Estimated Total Cost" getValue={m=>m.base.performance.knownEstimatedCostUsd} format={formatCost}/>
    </div>
    <p className="method-note">Elapsed API time includes network and provider effects. Cost uses each provider’s recorded pricing assumptions; neither is a pure model-architecture measure.</p>
    <div className="section-heading"><span>03 / BEHAVIOR UNDER CHANGE</span><h2>Stability and response</h2></div>
    <div className="research-pair">
     <BarMetric title="Repeatability" total={reference.repeatability.attempted} getValue={m=>m.repeatability.finalCorrect} subtext="Same input · 20 cases × 5"/>
     <BarMetric title="Consistency" total={reference.consistency.variants} getValue={m=>m.consistency.actionAgreement} subtext="Meaning-preserving variants"/>
     <BarMetric title="Sensitivity" total={reference.sensitivity.variants} getValue={m=>m.sensitivity.correctActionChange} subtext="Correct action changes"/>
    </div>
    <div className="research-caution"><strong>INTERPRETATION NOTE / n={reference.sensitivity.variants}</strong><p>{publication.commonSensitivityMisses.length} sensitivity variants were missed by all three models. Post-hoc review found benchmark-design and interpretation questions. These scores describe this small fixed subset; they are not a general capability ranking.</p></div>
    <p className="method-note">Jev Repeatability includes one missing HTTP 520 response: 99/100 attempted, 99/99 successful semantic responses correct. Its recorded Repeatability cost is a lower bound.</p>
   </section>
   <aside className="research-aside" aria-label="Methodology and limitations">
    <section className="panel methodology"><div className="panel-label">METHOD / 01</div><h2>Controlled inspection</h2>
     <p>Frozen before GPT-6 Luna was evaluated. No held-out threshold tuning.</p>
     <ul><li>120 frozen Base cases</li><li>Same observable evidence</li><li>Same eight semantic judgments</li><li>Shared deterministic final-action rules</li><li>Hidden Ground Truth</li><li>Repeatability, Consistency, Sensitivity measured separately</li></ul>
    </section>
    <section className="panel methodology"><div className="panel-label">CLAIMS / 02</div><h2>Read with care</h2>
     {claims.filter(x=>x.classification==='Not supported').slice(0,3).map(x=><div className="claim-item" key={x.claim}><span>NOT SUPPORTED</span><p>{x.claim}</p></div>)}
    </section>
    <section className="panel methodology"><div className="panel-label">SCOPE / 03</div>
     <button className="text-button" onClick={()=>setShowLimitations(x=>!x)} aria-expanded={showLimitations} aria-controls="limitations">{showLimitations?'HIDE':'VIEW'} LIMITATIONS <span aria-hidden="true">{showLimitations?'−':'+'}</span></button>
     {showLimitations?<ul id="limitations" className="limitations-list">{limitations.map((x,i)=><li key={i}>{x}</li>)}</ul>:null}
    </section>
   </aside>
  </div>
  <footer className="research-footer">MARS GATE / FROZEN HELD-OUT BENCHMARK V1 · Distinct metrics are not combined into one score.</footer>
 </main>;
}
