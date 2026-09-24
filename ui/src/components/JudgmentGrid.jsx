import React from 'react';
import {JUDGMENTS,hardDecision,probabilities} from '../lib/benchmark.js';

function Judgment({id,label,category,answer,model,index,visible,triggered,disagreement}){
 const list=probabilities(answer,model);
 return <div className={`judgment ${visible?'judgment-visible':'judgment-pending'} ${triggered?'judgment-triggered':''} ${disagreement?'judgment-disagreement':''}`} aria-label={`${label}: ${visible?hardDecision(answer):'pending'}${triggered?', route trigger':''}${disagreement?', model disagreement':''}`}>
  <div className="judgment-index">{String(index+1).padStart(2,'0')}</div>
  <div className="judgment-main">
   <div className="judgment-label">{label}</div>
   <div className="judgment-category">{category}</div>
   {triggered||disagreement?<div className="judgment-indicators">{triggered?<span>↳ ROUTE TRIGGER</span>:null}{disagreement?<span>≠ MODEL DISAGREEMENT</span>:null}</div>:null}
   {visible&&answer?<div className="judgment-probabilities">
    {list.map(p=><span key={p.label}>{p.label} <strong>{Math.round(p.value*100)}%</strong></span>)}
    {model==='jev'&&answer.confidence!=null?<span>JEV CONFIDENCE <strong>{Math.round(answer.confidence*100)}%</strong></span>:null}
   </div>:null}
  </div>
  <strong className="judgment-hard">{visible?hardDecision(answer):'—'}</strong>
 </div>;
}
export function JudgmentGrid({result,model,stage=14,compact=false,triggerIds=[],disagreementIds=[]}){
 return <div className={`judgment-grid ${compact?'judgment-grid-compact':''}`}>
  {JUDGMENTS.map(([id,label,category],index)=><Judgment key={id} id={id} label={label} category={category}
   answer={result?.answers?.[id]} model={model} index={index} visible={stage>=5+index}
   triggered={stage>=13&&triggerIds.includes(id)} disagreement={stage>=13&&disagreementIds.includes(id)}/>)}
 </div>;
}
