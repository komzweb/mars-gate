import React from 'react';

const emblems={Human:'H',Android:'A',Alien:'X',Cyborg:'C',Synthetic:'S',Uplift:'U'};

export function VisitorPortrait({type='Human',active=false}){
 return <div className={`portrait portrait-${type.toLowerCase()} ${active?'portrait-active':''}`} role="img" aria-label={`${type} visitor silhouette inside the entry scanner`}>
  <div className="portrait-grid" aria-hidden="true" />
  <div className="portrait-scan" aria-hidden="true" />
  <svg className="portrait-figure" viewBox="0 0 240 320" aria-hidden="true">
   <defs><linearGradient id="figure-fill" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#667c81"/><stop offset="1" stopColor="#283c43"/></linearGradient></defs>
   <circle cx="120" cy="74" r="39" fill="url(#figure-fill)" stroke="#91a8a6" strokeWidth="2"/>
   <path d="M55 277c2-65 18-111 39-123l12-8h28l12 8c21 12 37 58 39 123H55Z" fill="url(#figure-fill)" stroke="#91a8a6" strokeWidth="2"/>
   <path d="M86 111c11 11 57 11 68 0M120 150v127M72 225h96" fill="none" stroke="#849a9c" opacity=".5" strokeWidth="2"/>
   {type==='Android'||type==='Synthetic'?<path d="M99 73h42M107 83h26" stroke="#d8e4d8" strokeWidth="2" opacity=".8"/>:null}
   {type==='Alien'?<path d="M84 63Q120 20 156 63" fill="none" stroke="#b6c6bc" strokeWidth="4"/>:null}
   {type==='Cyborg'?<path d="M126 38v75m0-40h25" fill="none" stroke="#c2d2cc" strokeWidth="3"/>:null}
   {type==='Uplift'?<path d="m89 43-13-20 2 42m73-22 13-20-2 42" fill="none" stroke="#b6c6bc" strokeWidth="3"/>:null}
   <circle cx="120" cy="179" r="13" fill="#17272d" stroke="#a1b7b0" strokeWidth="2"/>
   <text x="120" y="184" textAnchor="middle" fill="#d7e7dc" fontSize="14" fontFamily="monospace">{emblems[type]??'V'}</text>
  </svg>
  <div className="portrait-corner top-left"/><div className="portrait-corner top-right"/>
  <div className="portrait-corner bottom-left"/><div className="portrait-corner bottom-right"/>
  <span className="portrait-axis axis-top">0 3 — 7 1</span>
  <span className="portrait-axis axis-bottom">BIOFORM / {type.toUpperCase()}</span>
 </div>;
}
