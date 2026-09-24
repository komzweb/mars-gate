import React from 'react';
import {decisionTrace} from '../lib/decisionPresentation.js';
import {getModel} from '../lib/benchmark.js';

export function DecisionTrace({result,model,compact=false}){
 const trace=decisionTrace(result,model);
 if(!trace)return null;
 const modelLabel=getModel(model).label;
 return <div className={`decision-trace ${compact?'trace-compact':''}`} aria-label={`${modelLabel} decision trace`}>
  <div className="trace-kicker">DECISION TRACE · {modelLabel} <span>DERIVED FROM SAVED RULE + ATOMIC OUTPUTS</span></div>
  <div className="trace-flow">
   <div className="trace-step trace-evidence"><small>01 / SIGNAL</small>
    {trace.signals.length?trace.signals.map(s=><div key={s.id} className="trace-signal"><strong>{s.label.toUpperCase()}</strong><span>{s.hard} · {s.detail}</span></div>):<strong>{trace.title}</strong>}
   </div>
   <span className="trace-arrow" aria-hidden="true">→</span>
   <div className="trace-step"><small>02 / SHARED RULE</small><strong>RULE {trace.ruleId}</strong><span>{trace.ruleText.toUpperCase()}</span></div>
   <span className="trace-arrow" aria-hidden="true">→</span>
   <div className="trace-step trace-outcome"><small>03 / ROUTE</small><strong>{trace.action}</strong><span>{trace.route.explanation.toUpperCase()}</span></div>
  </div>
 </div>;
}
