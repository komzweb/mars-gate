import React from 'react';
import humanPortrait from '../assets/visitors/human.png';
import androidPortrait from '../assets/visitors/android.png';
import alienPortrait from '../assets/visitors/alien.png';
import cyborgPortrait from '../assets/visitors/cyborg.png';
import syntheticPortrait from '../assets/visitors/synthetic.png';
import upliftPortrait from '../assets/visitors/uplift.png';

const portraits={Human:humanPortrait,Android:androidPortrait,Alien:alienPortrait,Cyborg:cyborgPortrait,Synthetic:syntheticPortrait,Uplift:upliftPortrait};

export function VisitorPortrait({type='Human',active=false}){
 return <div className={`portrait portrait-${type.toLowerCase()} ${active?'portrait-active':''}`} role="img" aria-label={`${type} visitor portrait inside the entry scanner`}>
  <div className="portrait-grid" aria-hidden="true" />
  <div className="portrait-scan" aria-hidden="true" />
  <img className="portrait-figure" src={portraits[type]} alt="" aria-hidden="true" draggable="false" />
  <div className="portrait-corner top-left"/><div className="portrait-corner top-right"/>
  <div className="portrait-corner bottom-left"/><div className="portrait-corner bottom-right"/>
  <span className="portrait-axis axis-top">0 3 — 7 1</span>
  <span className="portrait-axis axis-bottom">BIOFORM / {type.toUpperCase()}</span>
 </div>;
}
