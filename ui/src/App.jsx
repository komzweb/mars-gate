import React from 'react';
import {MODELS,ACTIONS,ROUTES,cases,freezeHash,getCase,getResult,getModel,filteredCases,adjacentCase,randomCase,formatCost,formatLatency} from './lib/benchmark.js';
import {VisitorPortrait} from './components/VisitorPortrait.jsx';
import {JudgmentGrid} from './components/JudgmentGrid.jsx';
import {DecisionTrace} from './components/DecisionTrace.jsx';
import {ResearchScreen} from './components/ResearchScreen.jsx';
import {decisionTrace,goldComparison,modelDisagreements} from './lib/decisionPresentation.js';

function Panel({name,tag,children,className=''}){return <section className={`panel ${className}`} aria-label={name}><div className="panel-top"><h2>{name}</h2><span>{tag}</span></div>{children}</section>}
function EvidenceList({items,empty='No records supplied'}){return items?.length?<div className="evidence-list">{items.map(x=><article className="evidence" key={x.id}><div className="evidence-meta"><strong>{x.id}</strong><span>{x.source}</span></div><p>{x.text}</p></article>)}</div>:<p className="empty-note">{empty}</p>}
function RouteLanes({action}){return <div className="route-lanes" aria-label="Entry routing destinations">{ACTIONS.map(a=><div key={a} className={`route-lane route-${a.toLowerCase()} ${action===a?'route-active':''}`} aria-current={action===a?'true':undefined}><span className="route-icon" aria-hidden="true">{ROUTES[a].icon}</span><span>{ROUTES[a].destination}</span><small>{action===a?'ROUTE ACTIVE':a}</small></div>)}</div>}
function RouteDecision({result,model,compact=false}){const action=result?.action;const route=action?ROUTES[action]:null;
 return <div className={`decision-card ${compact?'decision-compact':''} decision-${action?.toLowerCase()??'pending'}`}>
  <div className="decision-overline">ROUTE DECISION <span>{model==='jev'?'SYSTEM ONE':getModel(model).label}</span></div>
  <div className="decision-action">{action??'PENDING'}</div>
  <div className="decision-reason">{route?.explanation??'Awaiting inspection sequence'}</div>
  {result?<div className="decision-technical"><span>RULE {result.rule??'—'}</span><span>API {formatLatency(result.latencyMs)}</span><span>EST. {formatCost(result.costUsd)}</span></div>:null}
 </div>;
}
function SystemPanel({result,model,stage,compare,gold,reveal,traceModel,onTraceModel,headingRef}){
 const results=MODELS.map(m=>getResult(result.caseId,m.id));
 const disagreement=modelDisagreements(results);
 const activeResult=compare?getResult(result.caseId,traceModel):result;
 const trace=stage>=13?decisionTrace(activeResult,compare?traceModel:model):null;
 return <section className="system-panel" aria-label="AI decision system">
 <div className="system-heading"><div><span className="eyebrow">EVALUATION ARRAY / 08 SIGNALS</span><h2 ref={headingRef} tabIndex={-1}>AI Decision System</h2></div><span className="system-mode">{compare?'3-MODEL COMPARISON':getModel(model).label+' · FROZEN RESPONSE'}</span></div>
 {compare?<>
  <div className="compare-summary" aria-label="Model comparison summary"><div className="compare-summary-header"><strong>MODEL COMPARISON SUMMARY</strong><span>{disagreement.count} / 8 ATOMIC HARD LABELS DIFFER</span></div>
   <div className="compare-summary-grid">{MODELS.map((m,i)=><button key={m.id} className={traceModel===m.id?'summary-selected':''} onClick={()=>onTraceModel(m.id)} aria-pressed={traceModel===m.id} aria-label={`View ${m.label} decision trace`}><small>{m.label}</small><strong>{results[i]?.action??'ERROR'}</strong>{reveal?<span>{goldComparison(results[i],gold).finalMatch?'✓ MATCH':'× MISMATCH'}</span>:<span>VIEW TRACE ↘</span>}</button>)}</div>
   {disagreement.count?<p>DIFFERING JUDGMENTS / {disagreement.labels.join(' · ')}</p>:<p>All eight atomic hard labels agree across models.</p>}</div>
  <DecisionTrace result={activeResult} model={traceModel}/>
  <div className="compare-grid">{MODELS.map((m,i)=>{const r=results[i],trigger=decisionTrace(r,m.id)?.triggerIds??[];return <div className="compare-column" key={m.id}><div className="compare-title"><span className={`model-mark mark-${m.id}`}/><h3>{m.label}</h3><span>{m.detail}</span></div><RouteDecision result={r} model={m.id} compact/><JudgmentGrid result={r} model={m.id} compact triggerIds={trigger} disagreementIds={disagreement.ids}/></div>})}</div>
 </>:<><RouteDecision result={stage>=13?result:null} model={model}/>{trace?<DecisionTrace result={result} model={model}/>:null}<JudgmentGrid result={result} model={model} stage={stage} triggerIds={trace?.triggerIds??[]}/></>}
 <p className="system-footnote">Frozen result · Display sequence is presentation only. API latency above is measured independently. Jev P(YES) and model-reported LLM probabilities are different quantities; score is diagnostic, not risk probability.</p>
 </section>}

function GroundComparison({result,gold,model}){
 const comparison=goldComparison(result,gold);
 return <div className="gold-content" id="gold-content">
  <div className="gold-compare-heading"><span>FROZEN EVALUATION / {getModel(model).label}</span><strong className={comparison.finalMatch?'match':'mismatch'}>{comparison.finalMatch?'✓ MATCH':'× MISMATCH'}</strong></div>
  <div className="gold-final-grid"><div><small>PREDICTION</small><strong>{result?.action??'ERROR'}</strong></div><div><small>FROZEN GOLD</small><strong>{gold.action}</strong></div></div>
  <p className="gold-summary">{comparison.summary}</p>
  <div className="gold-atomic-heading"><strong>ATOMIC MATCH {comparison.matches} / {comparison.total}</strong><span>PREDICTION ↔ FROZEN GOLD</span></div>
  <p className="gold-equivalence">For binary judgments, prediction YES / NO corresponds to Gold TRUE / FALSE.</p>
  <div className="gold-compare-list" role="table" aria-label="Atomic prediction versus Frozen Gold">
   <div className="gold-compare-row gold-compare-header" role="row"><span role="columnheader">JUDGMENT</span><span role="columnheader">PREDICTION</span><span role="columnheader">GOLD</span><span role="columnheader">RESULT</span></div>
   {comparison.rows.map(x=><div key={x.id} role="row" className={`gold-compare-row ${x.match?'gold-row-match':'gold-row-mismatch'}`}><span role="cell">{x.label}</span><strong role="cell">{x.predictionLabel}</strong><strong role="cell">{x.goldLabel}</strong><span role="cell">{x.match?'✓ MATCH':'× MISMATCH'}</span></div>)}
  </div>
  <p className="gold-rationale">{gold.rationale}</p><small>For research interpretation only. This record was not sent to providers.</small>
 </div>;
}

export default function App(){
 const [page,setPage]=React.useState('inspection');
 const [caseId,setCaseId]=React.useState(cases[0].id);
 const [model,setModel]=React.useState('jev');
 const [traceModel,setTraceModel]=React.useState('jev');
 const [compare,setCompare]=React.useState(false);
 const [stage,setStage]=React.useState(0);
 const [reveal,setReveal]=React.useState(false);
 const [goldFilter,setGoldFilter]=React.useState('ALL');
 const [typeFilter,setTypeFilter]=React.useState('ALL');
 const timer=React.useRef(null);
 const resultHeading=React.useRef(null);
 const autoNavigate=React.useRef(false);
 React.useEffect(()=>()=>clearInterval(timer.current),[]);
 React.useEffect(()=>{
  if(stage<=0||stage>=13)return;
  const interrupt=()=>{autoNavigate.current=false};
  for(const event of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(event,interrupt,{passive:true});
  return()=>{for(const event of ['wheel','touchstart','pointerdown','keydown'])window.removeEventListener(event,interrupt)};
 },[stage]);
 React.useEffect(()=>{
  if(stage!==13||!autoNavigate.current||page!=='inspection')return;
  autoNavigate.current=false;
  const target=resultHeading.current;
  const frame=requestAnimationFrame(()=>{
   target?.focus({preventScroll:true});
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   target?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'});
  });
  return()=>cancelAnimationFrame(frame);
 },[stage,page]);
 const allFiltered=filteredCases({goldAction:goldFilter,visitorType:typeFilter});
 const ids=allFiltered.map(x=>x.id),visitor=getCase(caseId),result=getResult(visitor.id,model);
 const selectCase=(id)=>{clearInterval(timer.current);autoNavigate.current=false;setCaseId(id);setStage(0);setReveal(false)};
 const setFilter=(kind,value)=>{const next=filteredCases({goldAction:kind==='gold'?value:goldFilter,visitorType:kind==='type'?value:typeFilter});
  if(kind==='gold')setGoldFilter(value);else setTypeFilter(value);
  if(next.length&&!next.some(x=>x.id===caseId))selectCase(next[0].id);
 };
 const start=()=>{clearInterval(timer.current);autoNavigate.current=true;setStage(1);let next=1;timer.current=setInterval(()=>{next++;setStage(next);if(next>=13)clearInterval(timer.current)},105)};
 const ready=stage>=13;
 const activeModel=compare?traceModel:model;
 const activeResult=getResult(visitor.id,activeModel);
 const jumpToDecision=()=>{resultHeading.current?.focus({preventScroll:true});resultHeading.current?.scrollIntoView?.({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
 return <div className="app-shell">
  <a className="skip-link" href="#main-content">Skip to main content</a>
  <header className="site-header"><div className="brand"><div className="brand-emblem" aria-hidden="true">M<span>✦</span></div><div><strong>MARS GATE</strong><small>COLONY ENTRY CONTROL <span>/</span> SECTOR A-17</small></div></div>
   <nav className="top-nav" aria-label="Primary navigation"><button className={page==='inspection'?'nav-active':''} onClick={()=>setPage('inspection')}>INSPECTION</button><button className={page==='research'?'nav-active':''} onClick={()=>setPage('research')}>RESEARCH RESULTS</button></nav>
   <div className="header-status"><span className="online-indicator"><span className="signal-dot"/> SYSTEM ONLINE</span><span className="header-case">{page==='inspection'?caseId:'FROZEN V1'}</span></div>
  </header>
  {page==='research'?<ResearchScreen/>:<main id="main-content" className="inspection-screen">
   <div className="topline"><div><span className="eyebrow">ARRIVAL PROCESSING / FROZEN RESULT</span><h1>Entry inspection <span>{caseId}</span></h1></div><div className="topline-note">RESULT SOURCE <strong>FROZEN BASE</strong><span>NO API REQUEST</span></div></div>
   <div className="controls-panel"><div className="case-nav" aria-label="Case navigation">
    <button onClick={()=>selectCase(adjacentCase(caseId,ids,-1))} disabled={!ids.length} aria-label="Previous case">← <span>PREVIOUS</span></button>
    <label className="case-select-label">CASE <select value={caseId} onChange={e=>selectCase(e.target.value)} aria-label="Select case">{allFiltered.map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label>
    <button onClick={()=>selectCase(adjacentCase(caseId,ids,1))} disabled={!ids.length} aria-label="Next case"><span>NEXT</span> →</button>
    <button onClick={()=>selectCase(randomCase(caseId,ids))} disabled={ids.length<2} aria-label="Random case">⤨ <span>RANDOM</span></button>
   </div><div className="filter-group"><label>GOLD ACTION <select value={goldFilter} onChange={e=>setFilter('gold',e.target.value)} aria-label="Filter cases by Gold action"><option>ALL</option>{ACTIONS.map(a=><option key={a}>{a}</option>)}</select></label><label>VISITOR TYPE <select value={typeFilter} onChange={e=>setFilter('type',e.target.value)} aria-label="Filter cases by visitor type"><option>ALL</option>{['Human','Android','Alien','Cyborg','Synthetic','Uplift'].map(t=><option key={t}>{t}</option>)}</select></label><span className="filter-count">{ids.length} / 120</span></div></div>
   <div className="model-controls"><div className="model-switch" role="group" aria-label="Selected AI model"><span>SELECTED AI</span>{MODELS.map(m=><button key={m.id} className={model===m.id&&!compare?'selected':''} onClick={()=>{setModel(m.id);setTraceModel(m.id);setCompare(false)}} aria-pressed={model===m.id&&!compare}>{m.label}</button>)}</div>
    <button className={`compare-toggle ${compare?'selected':''}`} onClick={()=>setCompare(v=>!v)} aria-pressed={compare}>▦ <span>COMPARE MODE</span></button></div>
   <div className="inspection-grid">
    <div className="side-column">
     <Panel name="PROFILE" tag="01 / IDENTITY" className={stage>=1?'panel-active':''}><dl className="profile-list"><div><dt>VISITOR TYPE</dt><dd>{visitor.observable.profile.type}</dd></div><div><dt>ORIGIN</dt><dd>{visitor.observable.profile.origin}</dd></div><div><dt>ENTRY PURPOSE</dt><dd>{visitor.observable.profile.purpose}</dd></div></dl><div className="panel-subhead">DECLARATION</div><p className="declaration">“{visitor.observable.declaration}”</p></Panel>
     <Panel name="DOCUMENTS" tag={`${String(visitor.observable.documents.length).padStart(2,'0')} RECORDS`} className={stage>=2?'panel-active':''}><EvidenceList items={visitor.observable.documents}/></Panel>
    </div>
    <section className="visitor-column" aria-label="Visitor at entry gate"><div className="gate-header"><span>ENTRY GATE / A-17</span><span>{stage>=13?'ROUTED':stage?'SCAN ACTIVE':'STANDBY'}</span></div><VisitorPortrait type={visitor.observable.profile.type} active={stage>0&&stage<13}/><div className="visitor-id"><span>VISITOR / {caseId}</span><strong>{visitor.observable.profile.type.toUpperCase()}</strong><span>OBSERVABLE STATE ONLY</span></div>
     <div className="sequence" aria-label="Inspection sequence">{['PROFILE ACTIVE','DOCUMENTS VERIFIED','SCANNER INGESTED','INTERVIEW INGESTED'].map((x,i)=><div key={x} className={stage>=i+1?'sequence-done':''}><span>{stage>=i+1?'✓':String(i+1).padStart(2,'0')}</span>{x}</div>)}</div>
     <button className="start-button" onClick={start} disabled={stage>0&&stage<13}>{stage>0&&stage<13?'PROCESSING…':ready?'REPLAY INSPECTION':'START INSPECTION'} <span aria-hidden="true">↗</span></button>
     {ready?<div className="compact-route" aria-live="polite"><div><small>ROUTE DECISION · {getModel(activeModel).label}</small><strong>{activeResult?.action??'ERROR'}</strong></div><button onClick={jumpToDecision}>VIEW DECISION TRACE ↓</button></div>:null}
     <small className="presentation-note">Sequence animation ≈1.4 s · API latency shown separately</small>
    </section>
    <div className="side-column">
     <Panel name="SCANNER" tag={`${String(visitor.observable.scanner.length).padStart(2,'0')} OBSERVATIONS`} className={stage>=3?'panel-active':''}><EvidenceList items={visitor.observable.scanner} empty="No scanner observation supplied"/></Panel>
     <Panel name="INTERVIEW" tag="DIRECT RESPONSE" className={stage>=4?'panel-active':''}><div className="interview-block"><span>OFFICER QUESTION</span><p>{visitor.observable.interview.question}</p></div><div className="interview-block answer"><span>VISITOR ANSWER</span><p>“{visitor.observable.interview.answer}”</p></div></Panel>
    </div>
   </div>
   <SystemPanel result={result} model={model} stage={ready?14:stage} compare={compare&&ready} gold={visitor.gold} reveal={reveal} traceModel={traceModel} onTraceModel={setTraceModel} headingRef={resultHeading}/>
   {ready?<RouteLanes action={compare?null:result?.action}/>:<RouteLanes action={null}/>}
   <section className="gold-panel" aria-label="Ground Truth"><div><span className="eyebrow">EVALUATION RECORD / HIDDEN UNTIL REVEALED</span><h2>Ground Truth</h2></div><button onClick={()=>setReveal(v=>!v)} aria-expanded={reveal} aria-controls="gold-content">{reveal?'HIDE':'REVEAL'} GROUND TRUTH {reveal?'−':'+'}</button>
    {reveal?<GroundComparison result={activeResult} gold={visitor.gold} model={activeModel}/>:null}
   </section>
   <footer className="inspection-footer"><span>FROZEN V1 / {freezeHash.slice(0,16)}…</span><span>LIVE INSPECTION / NOT ENABLED</span><span>MARS GATE — COLONY ENTRY CONTROL</span></footer>
  </main>}
 </div>;
}
