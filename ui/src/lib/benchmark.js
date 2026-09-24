import frozen from '../data/frozen.json';

export const MODELS=[
 {id:'jev',label:'JEV',detail:'SYSTEM ONE',full:'Jev'},
 {id:'gpt56',label:'GPT-5.6 LUNA',detail:'MEDIUM',full:'GPT-5.6 Luna Medium'},
 {id:'gpt6',label:'GPT-6 LUNA',detail:'MEDIUM',full:'GPT-6 Luna Medium'},
];
export const JUDGMENTS=[
 ['material_contradiction','Material contradiction','SEMANTIC'],
 ['explanation_supported','Explanation supported','EVIDENCE'],
 ['physical_concern','Physical concern','PHYSICAL'],
 ['prohibited_shutdown','Prohibited shutdown capability','PROHIBITED'],
 ['prohibited_pathogen','Prohibited pathogen','PROHIBITED'],
 ['altered_identity','Altered identity','IDENTITY'],
 ['answer_completeness','Answer completeness','INTERVIEW'],
 ['anomaly_severity','Anomaly severity','DIAGNOSTIC'],
];
export const ACTIONS=['CLEAR','QUESTION','INSPECT','DENY'];
export const ROUTES={
 CLEAR:{destination:'GREEN LANE',explanation:'No unresolved concern',icon:'↗',code:'C'},
 QUESTION:{destination:'INTERVIEW DESK',explanation:'Semantic clarification required',icon:'?',code:'Q'},
 INSPECT:{destination:'INSPECTION BAY',explanation:'Physical verification required',icon:'◇',code:'I'},
 DENY:{destination:'HOLD AREA',explanation:'Confirmed prohibited condition',icon:'×',code:'D'},
};
export const cases=frozen.cases;
export const publication=frozen.publication;
export const thresholds=frozen.thresholds;
export const claims=frozen.claims;
export const limitations=frozen.limitations;
export const freezeHash=frozen.freezeHash;
export const getCase=(id)=>cases.find(c=>c.id===id)??cases[0];
export const getResult=(caseId,model)=>frozen.results[`${caseId}:${model}`]??null;
export const getModel=(id)=>MODELS.find(m=>m.id===id)??MODELS[0];
export const resultMode='FROZEN RESULT';

export function filteredCases({goldAction='ALL',visitorType='ALL'}={}){
 return cases.filter(c=>(goldAction==='ALL'||c.gold.action===goldAction)&&
  (visitorType==='ALL'||c.observable.profile.type===visitorType));
}
export function adjacentCase(id,ids,direction){
 if(!ids.length)return null;
 const at=ids.indexOf(id);
 if(at<0)return ids[0];
 return ids[(at+direction+ids.length)%ids.length];
}
export function randomCase(id,ids,random=Math.random){
 if(!ids.length)return null;
 if(ids.length===1)return ids[0];
 const other=ids.filter(x=>x!==id);
 return other[Math.floor(random()*other.length)];
}
export function hardValue(a){
 if(!a)return null;
 if(a.type==='noul')return a.noul>=.5;
 if(a.type==='choice')return a.choice??null;
 const scores=Object.entries(a.probabilities??{});
 return scores.length?Number(scores.reduce((best,current)=>current[1]>best[1]?current:best)[0]):null;
}
export function formatHard(value){
 if(value===null||value===undefined)return '—';
 if(typeof value==='boolean')return value?'YES':'NO';
 if(typeof value==='number')return `LEVEL ${value}`;
 return String(value).toUpperCase();
}
export function hardDecision(a){
 return formatHard(hardValue(a));
}
export function probabilities(a,model){
 if(!a)return[];
 const prefix=model==='jev'?'P':'MODEL-REPORTED P';
 if(a.type==='noul')return[{label:`${prefix}(YES)`,value:a.noul}];
 return Object.entries(a.probabilities??{}).map(([key,value])=>({label:`${prefix}(${key.toUpperCase()})`,value}));
}
export function formatCost(value){return value==null?'—':`$${value.toFixed(6)}`;}
export function formatLatency(value){return value==null?'—':`${Math.round(value).toLocaleString()} ms`;}
export function modelMetric(id){return publication.models.find(m=>m.model===getModel(id).full);}
