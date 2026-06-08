import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ================================================================
//  MERIDIAN  â€”  Final Release
// ================================================================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body{height:100%;background:#0a0a0a;overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{display:none;}scrollbar-width:none;
  input,textarea,button{font-family:inherit;}
  button{cursor:pointer;border:none;background:none;}
  button:active{opacity:0.7;transition:opacity 0.08s;}
  @keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @keyframes in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
  @keyframes ripple{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
  @keyframes checkpop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
  @keyframes fadeup{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes toast-in{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:none}}
  @keyframes toast-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(10px) scale(0.95)}}
  @keyframes streakpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
  .streak7{animation:streakpulse 2s ease-in-out infinite}
  .streak14{animation:streakpulse 1.5s ease-in-out infinite}
  .streak30{animation:streakpulse 1s ease-in-out infinite}
  .up{animation:up 0.32s cubic-bezier(0.16,1,0.3,1) both}
  .d1{animation-delay:.05s}.d2{animation-delay:.10s}.d3{animation-delay:.15s}
  .in{animation:in 0.22s cubic-bezier(0.16,1,0.3,1) both}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:4px;background:transparent;outline:none;border:none;cursor:pointer;}
  input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:#222;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;margin-top:-9px;border-radius:50%;background:var(--c,#c8c8d4);cursor:pointer;border:2px solid #0a0a0a;box-shadow:0 0 4px rgba(0,0,0,0.4);}
  input[type=range]::-moz-range-track{height:4px;border-radius:2px;background:#222;}
  input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--c,#c8c8d4);border:2px solid #0a0a0a;cursor:pointer;}
`;

// â”€â”€ TOKENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Z={
  bg:"#0a0a0a",s1:"#111111",s2:"#1a1a1a",s3:"#222222",
  b:"#2a2a2a",b2:"#333333",
  t:"#f0f0f0",t2:"#999999",t3:"#888888",
};
const SILVER="rgba(210,210,220,0.55)";
const SILVER_BRIGHT="rgba(230,230,240,0.85)";
const ERR_LIGHT="#fca5a5"; // rosso chiaro per task urgenti

// Tab accent â€” argento uniforme, elegante

// Colori area â€” ben distinti
const AREA_C={
  salute:"#00e5a0",   // verde acqua
  lavoro:"#ff7b54",   // arancio caldo
  relazioni:"#c084fc",// viola
  gioia:"#38bdf8",    // azzurro
};

const STATUS={
  red:   {l:"Critico", c:"#f87171"},
  orange:{l:"Scarso",  c:"#fb923c"},
  yellow:{l:"Buono",   c:"#facc15"},
  green: {l:"Ottimo",  c:"#4ade80"},
};

// Vita aree â€” colori piÃ¹ distinti
const VITA_AREE=[
  {id:"salute",   nome:"Salute",   color:"#00e5a0", cat:[
    {id:"v-mente", nome:"Mente",     desc:"Chiarezza, concentrazione, stress"},
    {id:"v-fisico",nome:"Fisico",    desc:"Energia, forma, allenamento, sonno"},
    {id:"v-vita",  nome:"Benessere", desc:"Alimentazione, prevenzione"},
  ]},
  {id:"lavoro",   nome:"Ingegno",  color:"#ff7b54", cat:[
    {id:"v-ricch", nome:"Ricchezza",    desc:"Reddito, risparmi, sicurezza"},
    {id:"v-carr",  nome:"Carriera",     desc:"Crescita, ruolo, riconoscimento"},
    {id:"v-proj",  nome:"Progetti",     desc:"Realizzazioni, impatto"},
  ]},
  {id:"relazioni",nome:"Legami",   color:"#c084fc", cat:[
    {id:"v-amore", nome:"Amore",        desc:"Coppia, intimitÃ , connessione"},
    {id:"v-fam",   nome:"Famiglia",     desc:"Rapporti familiari, presenza"},
    {id:"v-amici", nome:"Amici",        desc:"Vita sociale, comunitÃ "},
  ]},
  {id:"gioia",    nome:"Armonia",  color:"#38bdf8", cat:[
    {id:"v-amb",   nome:"Ambiente",     desc:"Casa, spazio, ordine"},
    {id:"v-pass",  nome:"Passioni",     desc:"Hobby, creativitÃ , tempo per sÃ©"},
    {id:"v-svil",  nome:"Crescita",     desc:"Apprendimento, sviluppo personale"},
  ]},
];

// â”€â”€ UTILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pad=n=>String(n).padStart(2,"0");
function tod(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function ago(n){const d=new Date();d.setDate(d.getDate()-n);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
const d7 =()=>Array.from({length:7}, (_,i)=>ago(6-i));
const d30=()=>Array.from({length:30},(_,i)=>ago(29-i));
const d84=()=>Array.from({length:84},(_,i)=>ago(83-i));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const noE=s=>s.replace(/\p{Emoji_Presentation}/gu,"").trim();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

function fmtDate(s){
  if(!s)return "";
  const d=new Date(s+"T00:00:00");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}
function fmtDL(s){
  if(!s)return null;
  const d=new Date(s+"T00:00:00"),t=new Date();t.setHours(0,0,0,0);
  const diff=Math.round((d-t)/86400000);
  if(diff<0) return{txt:`Scaduta ${Math.abs(diff)}g fa`,c:"#f87171",u:true};
  if(diff===0)return{txt:"Oggi",c:"#facc15",u:false};
  if(diff<=3) return{txt:`Tra ${diff}g`,c:"#fb923c",u:false};
  return{txt:fmtDate(s),c:Z.t3,u:false};
}
function greet(){const h=new Date().getHours();return h<5?"Buonanotte":h<12?"Buongiorno":h<17?"Buon pomeriggio":h<21?"Buonasera":"Buonanotte";}
function flatH(aree){const r=[];(aree||[]).forEach(a=>(a.cat||[]).forEach(c=>(c.h||[]).forEach(h=>r.push({...h,aId:a.id,aN:a.nome,cN:c.nome}))));return r;}

function isExpected(h,dateStr){
  const freq=h.freq||{type:"daily"};
  if(freq.type==="daily")return true;
  const dow=new Date(dateStr+"T00:00:00").getDay();
  if(freq.type==="days")return(freq.d||[]).includes(dow);
  return true;
}
function strkF(h,tr){
  const freq=h.freq||{type:"daily"};
  let n=0,d=new Date();
  const ts=tod();
  if(!tr[h.id]?.[ts])d.setDate(d.getDate()-1);
  let safe=0;
  while(safe++<400){
    const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const exp=isExpected(h,k),done=!!(tr[h.id]?.[k]);
    if(exp&&!done)break;
    if(exp&&done)n++;
    d.setDate(d.getDate()-1);
  }
  return n;
}
function wScr(habits,tr,off=0){
  const days=Array.from({length:7},(_,i)=>ago(off*7+6-i));
  if(!habits.length)return 0;
  const exp=habits.reduce((s,h)=>s+(h.freq?.type==="days"?days.filter(d=>(h.freq.d||[]).includes(new Date(d+"T00:00:00").getDay())).length:h.freq?.type==="weekly"?Math.min(h.freq.n||1,7):7),0);
  if(!exp)return 0;
  return Math.round(habits.reduce((s,h)=>s+days.filter(d=>tr[h.id]?.[d]).length,0)/exp*100);
}

// â”€â”€ INIT DATA â€” dati fittizi realistici â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TODAY=tod();
const INIT={
  tasks:[
    {id:"t1",text:"Preparare presentazione Q3",done:false,deadline:ago(-2),aId:"lavoro",cId:"proj"},
    {id:"t2",text:"Chiamare il medico per visita",done:false,deadline:ago(-1),aId:"salute",cId:"v-vita"},
    {id:"t3",text:"Prenotare ristorante anniversario",done:false,deadline:ago(3),aId:"relazioni",cId:"v-amore"},
    {id:"t4",text:"Leggere capitoli 3-4 di Sapiens",done:false,deadline:ago(5),aId:"gioia",cId:"v-pass"},
    {id:"t5",text:"Aggiornare LinkedIn",done:true,deadline:"",aId:"lavoro",cId:"v-carr"},
  ],
  vita:{
    "v-mente":6,"v-fisico":7,"v-vita":5,
    "v-ricch":4,"v-carr":6,"v-proj":7,
    "v-amore":8,"v-fam":6,"v-amici":5,
    "v-amb":6,"v-pass":4,"v-svil":5,
  },
  goals:[
    {id:"g1",text:"ðŸ’ª Massa grassa al 15%",s:"red",note:"Target entro dicembre 2026",pct:18,tasks:[
      {id:"g1t1",text:"Visita medica baseline",done:true},
      {id:"g1t2",text:"Piano alimentare con nutrizionista",done:true},
      {id:"g1t3",text:"Allenamento 4x settimana",done:false},
      {id:"g1t4",text:"Pesarsi ogni lunedÃ¬ mattina",done:false},
      {id:"g1t5",text:"Target: -1% BF ogni mese",done:false},
    ]},
    {id:"g2",text:"ðŸš€ Top #3 Senior Manager",s:"orange",note:"Entro giugno 2027",pct:30,tasks:[
      {id:"g2t1",text:"Aggiornare CV e LinkedIn",done:true},
      {id:"g2t2",text:"3 colloqui interni entro Q3",done:false},
      {id:"g2t3",text:"Trovare un mentore dirigente",done:false},
      {id:"g2t4",text:"Completare corso leadership",done:false},
    ]},
    {id:"g3",text:"ðŸ’ Matrimonio con Costanza",s:"yellow",note:"Estate 2027",pct:45,tasks:[
      {id:"g3t1",text:"Scegliere la location",done:true},
      {id:"g3t2",text:"Definire lista invitati",done:true},
      {id:"g3t3",text:"Fotografo e catering",done:false},
      {id:"g3t4",text:"Abiti e accessori",done:false},
      {id:"g3t5",text:"Destinazione luna di miele",done:false},
    ]},
    {id:"g4",text:"ðŸ¦ Risparmio 30.000â‚¬ CD",s:"red",note:"Obiettivo 2026",pct:22,tasks:[
      {id:"g4t1",text:"Aprire conto deposito",done:true},
      {id:"g4t2",text:"Bonifico mensile automatico",done:false},
      {id:"g4t3",text:"Eliminare 2 spese fisse",done:false},
    ]},
    {id:"g5",text:"ðŸ“– Lettura 10 libri",s:"green",note:"Un libro al mese",pct:60,tasks:[
      {id:"g5t1",text:"La lezione del Giappone",done:true},
      {id:"g5t2",text:"Il nome della rosa",done:true},
      {id:"g5t3",text:"Siddharta",done:true},
      {id:"g5t4",text:"L'arte della guerra",done:true},
      {id:"g5t5",text:"Il conte di Montecristo",done:true},
      {id:"g5t6",text:"Sapiens",done:true},
      {id:"g5t7",text:"La fattoria degli animali",done:false},
      {id:"g5t8",text:"Dune",done:false},
      {id:"g5t9",text:"Cent'anni di solitudine",done:false},
      {id:"g5t10",text:"Il Signore degli Anelli",done:false},
    ]},
  ],
  aree:[
    {id:"salute",   nome:"Salute",  color:"#00e5a0",cat:[
      {id:"mente",  nome:"Mente",      h:[
        {id:"h1",nome:"Meditazione 10min",s:"green", note:"Ogni mattina",freq:{type:"daily"},logType:"nessuno"},
        {id:"h2",nome:"Journaling",     s:"yellow",note:"Sera",         freq:{type:"weekly",n:4},logType:"nessuno"},
      ]},
      {id:"fisico", nome:"Fisico",     h:[
        {id:"h3",nome:"Palestra",      s:"green", note:"",freq:{type:"days",d:[1,3,5]},logType:"nessuno"},
        {id:"h4",nome:"Sveglia 6:30",  s:"orange",note:"",freq:{type:"daily"},logType:"sveglia"},
        {id:"h5",nome:"10.000 passi",  s:"yellow",note:"",freq:{type:"daily"},logType:"nessuno"},
      ]},
      {id:"vita2",  nome:"Benessere", h:[
        {id:"h6",nome:"No alcol",      s:"green", note:"",freq:{type:"daily"},logType:"nessuno"},
        {id:"h7",nome:"Integratori",   s:"green", note:"Mattina",freq:{type:"daily"},logType:"nessuno"},
      ]},
    ]},
    {id:"lavoro",   nome:"Ingegno", color:"#ff7b54",cat:[
      {id:"ricch",  nome:"Ricchezza",  h:[
        {id:"h8",nome:"Traccia spese", s:"yellow",note:"",freq:{type:"weekly",n:1},logType:"nessuno"},
      ]},
      {id:"carr",   nome:"Carriera",   h:[
        {id:"h9",nome:"Deep work 2h",  s:"orange",note:"Mattina presto",freq:{type:"days",d:[1,2,3,4,5]},logType:"nessuno"},
        {id:"h10",nome:"LinkedIn",     s:"red",   note:"",freq:{type:"weekly",n:2},logType:"nessuno"},
      ]},
      {id:"proj",   nome:"Progetti",   h:[
        {id:"h11",nome:"Side project", s:"red",   note:"",freq:{type:"weekly",n:3},logType:"nessuno"},
      ]},
    ]},
    {id:"relazioni",nome:"Legami", color:"#c084fc",cat:[
      {id:"amore",  nome:"Amore",      h:[
        {id:"h12",nome:"Cena con Costanza",s:"green",note:"",freq:{type:"weekly",n:2},logType:"nessuno"},
      ]},
      {id:"fam",    nome:"Famiglia",   h:[
        {id:"h13",nome:"Chiama i genitori",s:"yellow",note:"",freq:{type:"weekly",n:2},logType:"nessuno"},
      ]},
      {id:"amici",  nome:"Amici",      h:[
        {id:"h14",nome:"Serata amici",    s:"orange",note:"",freq:{type:"weekly",n:1},logType:"nessuno"},
      ]},
    ]},
    {id:"gioia",    nome:"Armonia", color:"#38bdf8",cat:[
      {id:"amb",    nome:"Ambiente",   h:[
        {id:"h15",nome:"Riordina scrivania",s:"red",note:"",freq:{type:"weekly",n:1},logType:"nessuno"},
      ]},
      {id:"pass",   nome:"Passioni",   h:[
        {id:"h16",nome:"Lettura 30min",    s:"green",note:"",freq:{type:"daily"},logType:"pagine"},
        {id:"h17",nome:"Chitarra",         s:"yellow",note:"",freq:{type:"weekly",n:3},logType:"nessuno"},
      ]},
      {id:"svil",   nome:"Crescita",   h:[
        {id:"h18",nome:"Podcast/corso",    s:"orange",note:"",freq:{type:"weekly",n:3},logType:"nessuno"},
      ]},
    ]},
  ],
};


// â”€â”€ ATOMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Ring({pct,size=56,sw=4,color,children}){
  const r=(size-sw*2)/2,ci=2*Math.PI*r,p=clamp(pct||0,0,100);
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute",inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={ci} strokeDashoffset={ci*(1-p/100)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>
    </div>
  );
}

function Dot({c,size=7}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:c,flexShrink:0}}/>;
}

function Pill({label,color}){
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"1px 7px",
      borderRadius:20,fontSize:10,fontWeight:600,
      color,background:`${color}18`,border:`1px solid ${color}30`,
      fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

// â”€â”€ DATE PICKER SCROLL (stile cassaforte) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScrollPicker({value,items,onChange,width=60}){
  const ref=useRef(null);
  const ITEM_H=40;
  const idx=items.findIndex(x=>x.val===value);
  useEffect(()=>{
    if(ref.current)ref.current.scrollTop=(idx>=0?idx:0)*ITEM_H;
  },[]);
  const onScroll=()=>{
    if(!ref.current)return;
    const i=Math.round(ref.current.scrollTop/ITEM_H);
    const item=items[clamp(i,0,items.length-1)];
    if(item&&item.val!==value)onChange(item.val);
  };
  return(
    <div style={{position:"relative",width,height:ITEM_H*3,overflow:"hidden",borderRadius:10,background:Z.s2}}>
      {/* Gradiente top/bottom */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:ITEM_H,
        background:"linear-gradient(to bottom,#1a1a1a,transparent)",zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:ITEM_H,
        background:"linear-gradient(to top,#1a1a1a,transparent)",zIndex:2,pointerEvents:"none"}}/>
      {/* Linee selezione */}
      <div style={{position:"absolute",top:ITEM_H,left:6,right:6,height:ITEM_H,
        borderTop:"1px solid rgba(255,255,255,0.15)",
        borderBottom:"1px solid rgba(255,255,255,0.15)",zIndex:2,pointerEvents:"none"}}/>
      <div ref={ref} onScroll={onScroll}
        style={{height:"100%",overflowY:"scroll",scrollSnapType:"y mandatory",
          scrollbarWidth:"none",paddingTop:ITEM_H,paddingBottom:ITEM_H}}>
        {items.map(item=>(
          <div key={item.val} style={{height:ITEM_H,display:"flex",alignItems:"center",
            justifyContent:"center",scrollSnapAlign:"center",
            fontSize:17,fontWeight:600,color:item.val===value?Z.t:Z.t3,
            fontFamily:"'JetBrains Mono',monospace",transition:"color 0.15s",
            flexShrink:0}}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DatePicker({value,onChange,onClose,accent}){
  const col=accent||SILVER;
  const parseDate=s=>{
    if(!s){const t=new Date();return{y:t.getFullYear(),m:t.getMonth()+1,d:t.getDate()};}
    const [y,m,d]=s.split("-").map(Number);return{y,m,d};
  };
  const {y,m,d}=parseDate(value);
  const [cy,setCy]=useState(y);
  const [cm,setCm]=useState(m);
  const [cd,setCd]=useState(d);

  const daysInMonth=new Date(cy,cm,0).getDate();
  const days=Array.from({length:daysInMonth},(_,i)=>({val:i+1,label:pad(i+1)}));
  const months=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"].map((l,i)=>({val:i+1,label:l}));
  const years=Array.from({length:10},(_,i)=>({val:2024+i,label:String(2024+i)}));

  const confirm=()=>{
    const dd=Math.min(cd,new Date(cy,cm,0).getDate());
    onChange(`${cy}-${pad(cm)}-${pad(dd)}`);
    onClose();
  };
  const clear=()=>{onChange("");onClose();};

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:900,
      background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="in"
        style={{width:"100%",maxWidth:480,background:Z.s1,
          borderRadius:"18px 18px 0 0",borderTop:`2px solid ${col}`,
          paddingBottom:"env(safe-area-inset-bottom,12px)"}}>
        <div style={{width:36,height:4,background:Z.b2,borderRadius:2,margin:"12px auto 0"}}/>
        <div style={{padding:"16px 20px 20px"}}>
          <div style={{fontSize:14,fontWeight:700,color:Z.t,marginBottom:16,textAlign:"center"}}>
            Seleziona data
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
            <ScrollPicker value={cd} items={days}   onChange={setCd} width={64}/>
            <ScrollPicker value={cm} items={months} onChange={setCm} width={72}/>
            <ScrollPicker value={cy} items={years}  onChange={setCy} width={86}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={clear}
              style={{flex:1,padding:13,background:Z.s2,borderRadius:10,color:Z.t3,fontSize:14}}>
              Rimuovi
            </button>
            <button onClick={onClose}
              style={{flex:1,padding:13,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>
              Annulla
            </button>
            <button onClick={confirm}
              style={{flex:2,padding:13,background:col,borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>
              Conferma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ BOTTOM SHEET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Sheet({onClose,title,accent,children}){
  useEffect(()=>{const p=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=p||""};},[]);
  const col=accent||SILVER;
  const [dragY,setDragY]=useState(0);
  const startY=useRef(0);
  const onTS=e=>{startY.current=e.touches[0].clientY;};
  const onTM=e=>{
    const dy=Math.max(0,e.touches[0].clientY-startY.current);
    setDragY(dy);
  };
  const onTE=()=>{
    if(dragY>80)onClose();
    setDragY(0);
  };
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:800,
      background:`rgba(0,0,0,${Math.max(0.2,0.8-dragY/200)})`,
      backdropFilter:"blur(8px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="in"
        style={{width:"100%",maxWidth:480,background:Z.s1,
          borderRadius:"18px 18px 0 0",borderTop:`2px solid ${col}`,
          paddingBottom:"env(safe-area-inset-bottom,8px)",
          maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",
          transform:`translateY(${dragY}px)`,
          transition:dragY===0?"transform 0.3s cubic-bezier(0.16,1,0.3,1)":"none"}}>
        {/* Handle â€” draggabile */}
        <div
          onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
          style={{padding:"12px 0 4px",display:"flex",justifyContent:"center",
            alignItems:"center",cursor:"grab",flexShrink:0}}>
          <div style={{width:36,height:4,background:Z.b2,borderRadius:2}}/>
        </div>
        {title&&<div style={{padding:"4px 20px 0",fontSize:14,fontWeight:700,color:Z.t,flexShrink:0}}>{title}</div>}
        <div style={{padding:"12px 20px 20px",overflowY:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

// â”€â”€ WAKE LOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function WakeLog({h,logs,onLog,onClose}){
  const ts=tod();
  const ex=logs[h.id]?.[ts]?.wakeTime||"";
  const [time,setTime]=useState(ex);
  const col=AREA_C[h.aId]||SILVER;
  const hist=d7().map(d=>({d,t:logs[h.id]?.[d]?.wakeTime})).filter(x=>x.t);
  return(
    <Sheet onClose={onClose} title={`Sveglia â€” ${h.nome}`} accent={col}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)}
          style={{background:Z.s2,border:`1.5px solid ${col}55`,borderRadius:12,
            padding:"14px 20px",color:Z.t,fontSize:24,fontWeight:700,
            fontFamily:"'JetBrains Mono',monospace",width:"100%",outline:"none",
            textAlign:"center",boxSizing:"border-box"}}/>
      </div>
      {hist.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>
            Ultimi giorni
          </div>
          {hist.slice(-5).reverse().map(({d,t})=>{
            const date=new Date(d+"T00:00:00");
            const label=date.toLocaleDateString("it-IT",{weekday:"short",day:"numeric"});
            return(
              <div key={d} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${Z.b}`}}>
                <span style={{fontSize:13,color:Z.t2,textTransform:"capitalize"}}>{label}</span>
                <span style={{fontSize:14,fontWeight:600,color:Z.t,
                  fontFamily:"'JetBrains Mono',monospace"}}>{t}</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        <button onClick={onClose}
          style={{flex:1,padding:13,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>
          Annulla
        </button>
        <button onClick={()=>{if(time)onLog(h.id,{wakeTime:time});onClose();}}
          style={{flex:2,padding:13,background:col,border:"none",
            borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>
          Salva
        </button>
      </div>
    </Sheet>
  );
}

// â”€â”€ EDIT HABIT SHEET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditHabit({item,onSave,onDel,onClose}){
  const [st,setSt]=useState(item.s||"red");
  const [note,setNote]=useState(item.note||"");
  const [freq,setFreq]=useState(item.freq||{type:"daily"});
  const [conf,setConf]=useState(false);
  const nameRef=useRef(null);
  const col=AREA_C[item.aId]||SILVER;
  return(
    <Sheet onClose={onClose} title="Abitudine" accent={col}>
      <input ref={nameRef} defaultValue={item.nome||""} placeholder="Nome..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
          padding:"12px 13px",color:Z.t,fontSize:16,fontWeight:600,
          boxSizing:"border-box",marginBottom:14}}/>
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:9,fontFamily:"'JetBrains Mono',monospace"}}>Livello</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:16}}>
        {Object.entries(STATUS).map(([k,v])=>{const sel=st===k;return(
          <button key={k} onClick={()=>setSt(k)}
            style={{padding:"10px 4px",borderRadius:10,
              background:sel?`${v.c}18`:Z.s2,border:`1.5px solid ${sel?v.c:Z.b}`,
              display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:v.c}}/>
            <span style={{fontSize:10,color:sel?v.c:Z.t3,fontWeight:sel?700:400}}>{v.l}</span>
          </button>
        );})}
      </div>
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:9,fontFamily:"'JetBrains Mono',monospace"}}>Frequenza</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[{v:"daily",l:"Ogni giorno"},{v:"weekly",l:"N volte"},{v:"days",l:"Giorni fissi"}].map(({v,l})=>{
          const sel=freq.type===v;
          return(
            <button key={v} onClick={()=>setFreq(v==="daily"?{type:"daily"}:v==="weekly"?{type:"weekly",n:freq.n||3}:{type:"days",d:freq.d||[1,2,3,4,5]})}
              style={{flex:1,padding:"8px 4px",borderRadius:9,fontSize:11,fontWeight:sel?600:400,
                background:sel?`${col}20`:Z.s2,border:`1.5px solid ${sel?col:Z.b}`,
                color:sel?col:Z.t2}}>
              {l}
            </button>
          );
        })}
      </div>
      {freq.type==="weekly"&&(
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          {[1,2,3,4,5,6].map(n=>(
            <button key={n} onClick={()=>setFreq({type:"weekly",n})}
              style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:13,fontWeight:freq.n===n?700:400,
                background:freq.n===n?col:Z.s2,border:`1px solid ${freq.n===n?col:Z.b}`,
                color:freq.n===n?"white":Z.t2}}>
              {n}
            </button>
          ))}
        </div>
      )}
      {freq.type==="days"&&(
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          {["D","L","M","M","G","V","S"].map((label,dow)=>{
            const sel=(freq.d||[]).includes(dow);
            return(
              <button key={dow} onClick={()=>{const cur=freq.d||[];setFreq({type:"days",d:sel?cur.filter(x=>x!==dow):[...cur,dow].sort()});}}
                style={{flex:1,padding:"9px 0",borderRadius:9,fontSize:12,fontWeight:sel?700:400,
                  background:sel?col:Z.s2,border:`1px solid ${sel?col:Z.b}`,
                  color:sel?"white":Z.t2}}>
                {label}
              </button>
            );
          })}
        </div>
      )}
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Nota</div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Aggiungi nota..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
          padding:"11px 13px",color:Z.t,fontSize:14,resize:"none",height:64,
          boxSizing:"border-box",lineHeight:1.5,marginBottom:14}}/>
      <div style={{display:"flex",gap:8}}>
        {conf?(
          <>
            <button onClick={()=>setConf(false)} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={onDel} style={{flex:1,padding:12,background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,color:"#f87171",fontSize:14,fontWeight:600}}>Elimina</button>
          </>
        ):(
          <>
            <button onClick={()=>setConf(true)} style={{padding:"10px 14px",background:Z.s2,borderRadius:10,color:Z.t3,fontSize:12,fontWeight:500}}>Elimina</button>
            <button onClick={onClose} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>{const nome=nameRef.current?.value.trim()||item.nome;onSave({s:st,note,freq,nome});}}
              style={{flex:2,padding:12,background:col,borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>Salva</button>
          </>
        )}
      </div>
    </Sheet>
  );
}

// â”€â”€ EDIT GOAL SHEET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditGoal({item,onSave,onDel,onClose,isNew}){
  const [text,setText]=useState(item.text||"");
  const [note,setNote]=useState(item.note||"");
  const [s,setS]=useState(item.s||"red");
  const [conf,setConf]=useState(false);
  return(
    <Sheet onClose={onClose} title={isNew?"Nuovo obiettivo":"Obiettivo"} accent="#facc15">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Descrivi l'obiettivo..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
          padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:600,boxSizing:"border-box",marginBottom:12}}/>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Note, contesto, scadenza..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
          padding:"11px 13px",color:Z.t,fontSize:14,resize:"none",height:64,
          boxSizing:"border-box",lineHeight:1.5,marginBottom:14}}/>
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:9,fontFamily:"'JetBrains Mono',monospace"}}>Livello</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:16}}>
        {Object.entries(STATUS).map(([k,v])=>{const sel=s===k;return(
          <button key={k} onClick={()=>setS(k)}
            style={{padding:"10px 4px",borderRadius:10,background:sel?`${v.c}18`:Z.s2,
              border:`1.5px solid ${sel?v.c:Z.b}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:v.c}}/>
            <span style={{fontSize:10,color:sel?v.c:Z.t3,fontWeight:sel?700:400}}>{v.l}</span>
          </button>
        );})}
      </div>
      <div style={{display:"flex",gap:8}}>
        {!isNew&&conf?(
          <>
            <button onClick={()=>setConf(false)} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={onDel} style={{flex:1,padding:12,background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,color:"#f87171",fontSize:14,fontWeight:600}}>Elimina</button>
          </>
        ):(
          <>
            {!isNew&&<button onClick={()=>setConf(true)} style={{padding:"10px 14px",background:Z.s2,borderRadius:10,color:Z.t3,fontSize:12,fontWeight:500}}>Elimina</button>}
            <button onClick={onClose} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>onSave({text:text.trim()||item.text,note,s})}
              style={{flex:2,padding:12,background:"#facc15",borderRadius:10,color:"#0a0a0a",fontSize:14,fontWeight:700}}>
              {isNew?"Crea":"Salva"}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

// â”€â”€ EDIT TASK SHEET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditTask({task,onSave,onDel,onClose,aree}){
  const [txt,setTxt]=useState(task.text||"");
  const [dl,setDl]=useState(task.deadline||"");
  const [aId,setAId]=useState(task.aId||"");
  const [cId,setCId]=useState(task.cId||"");
  const [showDP,setShowDP]=useState(false);
  const [conf,setConf]=useState(false);
  const col="#c8c8d4";
  const selArea=aree.find(a=>a.id===aId);
  const cats=selArea?.cat||[];
  return(
    <Sheet onClose={onClose} title={task.id?"Modifica task":"Nuova task"} accent={col}>
      {showDP&&<DatePicker value={dl} onChange={v=>{setDl(v);setShowDP(false);}} onClose={()=>setShowDP(false)} accent={col}/>}
      <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Descrivi il task..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
          padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:500,boxSizing:"border-box",marginBottom:14}}/>
      {/* Scadenza */}
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Scadenza</div>
      <button onClick={()=>setShowDP(true)}
        style={{width:"100%",padding:"12px 13px",background:Z.s2,border:`1px solid ${dl?col+"55":Z.b}`,
          borderRadius:9,color:dl?Z.t:Z.t3,fontSize:14,textAlign:"left",marginBottom:14,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span>{dl?fmtDate(dl):"Nessuna scadenza"}</span>
        <span style={{fontSize:12,color:Z.t3}}>ðŸ“…</span>
      </button>
      {/* Area */}
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Area (opzionale)</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {aree.map(a=>(
          <button key={a.id} onClick={()=>{setAId(a.id===aId?"":a.id);setCId("");}}
            style={{padding:"5px 11px",borderRadius:20,fontSize:12,fontWeight:aId===a.id?600:400,
              background:aId===a.id?`${a.color}22`:Z.s2,border:`1px solid ${aId===a.id?a.color:Z.b}`,
              color:aId===a.id?a.color:Z.t2}}>
            {a.nome}
          </button>
        ))}
      </div>
      {cats.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {cats.map(cat=>(
            <button key={cat.id} onClick={()=>setCId(cat.id===cId?"":cat.id)}
              style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:cId===cat.id?600:400,
                background:cId===cat.id?`${selArea.color}18`:Z.s2,
                border:`1px solid ${cId===cat.id?selArea.color:Z.b}`,
                color:cId===cat.id?selArea.color:Z.t3}}>
              {cat.nome}
            </button>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {task.id&&conf?(
          <>
            <button onClick={()=>setConf(false)} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={onDel} style={{flex:1,padding:12,background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,color:"#f87171",fontSize:14,fontWeight:600}}>Elimina</button>
          </>
        ):(
          <>
            {task.id&&<button onClick={()=>setConf(true)} style={{padding:"10px 14px",background:Z.s2,borderRadius:10,color:Z.t3,fontSize:12,fontWeight:500}}>Elimina</button>}
            <button onClick={onClose} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>{if(txt.trim())onSave({text:txt.trim(),deadline:dl,aId,cId});}}
              style={{flex:2,padding:12,background:col,borderRadius:10,color:"#0a0a0a",fontSize:14,fontWeight:700}}>
              {task.id?"Salva":"Aggiungi"}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

// â”€â”€ HABIT ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HRow({h,tr,logs,onToggle,onEdit,onLog,onDel,compact,showArea}){
  const ts=tod(),done=!!(tr[h.id]?.[ts]);
  const sk=!compact?strkF(h,tr):0;
  const sc=STATUS[h.s]||STATUS.red;
  const col=AREA_C[h.aId]||SILVER;
  const swX=useRef(0),swS=useRef(0),[tx,setTx]=useState(0),[sw,setSw]=useState(false);
  const prog=Math.min(1,Math.abs(tx)/60);
  const goLeft=tx<0;
  const todayWake=(logs||{})[h.id]?.[ts]?.wakeTime;
  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:10,marginBottom:5}}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",paddingLeft:14,pointerEvents:"none",
        background:tx<0?`rgba(248,113,113,${prog*0.25})`:`rgba(0,229,160,${prog*0.25})`}}>
        <div style={{width:26,height:26,borderRadius:"50%",
          background:tx<0?"#f87171":"#00e5a0",
          display:"flex",alignItems:"center",justifyContent:"center",
          transform:`scale(${0.3+prog*0.7})`,opacity:prog}}>
          <span style={{color:"white",fontSize:13,fontWeight:800}}>{done?"âœ•":"âœ“"}</span>
        </div>
      </div>
      <div
        onTouchStart={e=>{swS.current=e.touches[0].clientX;swX.current=0;setSw(true);}}
        onTouchMove={e=>{if(!sw)return;const dx=Math.max(-80,Math.min(80,e.touches[0].clientX-swS.current));swX.current=dx;setTx(dx);}}
        onTouchEnd={()=>{setSw(false);if(swX.current>60){onToggle(h.id);if(navigator.vibrate)navigator.vibrate([6,3,6]);}else if(swX.current<-60&&onDel){onDel(h.id);if(navigator.vibrate)navigator.vibrate([10]);}swX.current=0;setTx(0);}}
        style={{display:"flex",alignItems:"center",gap:10,
          padding:compact?"10px 13px":"12px 14px",
          background:done?"rgba(0,229,160,0.06)":Z.s1,
          border:`1px solid ${done?"rgba(0,229,160,0.18)":Z.b}`,
          borderLeft:`2.5px solid ${done?"rgba(0,229,160,0.5)":col}`,
          borderRadius:10,transform:`translateX(${tx}px)`,
          transition:sw?"none":"transform 0.28s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{position:"relative",width:26,height:26,flexShrink:0}}>
          {/* Ripple al completamento */}
          {done&&<div style={{position:"absolute",inset:0,borderRadius:"50%",
            background:"#00e5a0",
            animation:"ripple 0.5s ease-out forwards",
            pointerEvents:"none"}}/>}
          <button onClick={e=>{e.stopPropagation();onToggle(h.id);}}
            style={{width:26,height:26,borderRadius:"50%",padding:0,
              background:done?"#00e5a0":"transparent",
              border:`1.5px solid ${done?"#00e5a0":Z.b2}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#0a0a0a",fontSize:13,fontWeight:700,
              animation:done?"checkpop 0.3s cubic-bezier(0.34,1.56,0.64,1) both":"none",
              transition:"background 0.18s,border-color 0.18s",
              position:"relative",zIndex:1}}>
            {done&&"âœ“"}
          </button>
        </div>
        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>swX.current<8&&onEdit(h)}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:showArea||h.freq?.type!=="daily"?2:0}}>
            <div style={{fontSize:15,fontWeight:done?400:500,color:done?Z.t3:Z.t,
              textDecoration:done?"line-through":"none",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {h.nome}
            </div>
          </div>
          {showArea&&(
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:col,flexShrink:0}}/>
              <span style={{fontSize:10,color:col,fontWeight:500}}>{h.aN} Â· {h.cN}</span>
            </div>
          )}
          {!compact&&h.freq?.type!=="daily"&&(
            <div style={{fontSize:10,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>
              {h.freq.type==="weekly"?`${h.freq.n}x sett.`:["D","L","M","M","G","V","S"].filter((_,i)=>(h.freq.d||[]).includes(i)).join(" ")}
            </div>
          )}
          {!compact&&(
            <div style={{display:"flex",gap:2,marginTop:5,alignItems:"center"}}>
              {d7().map(d=>{
                const exp=isExpected(h,d),dn=!!(tr[h.id]?.[d]);
                return <div key={d} style={{width:7,height:7,borderRadius:2,
                  background:dn?col:exp?Z.b:"transparent",
                  border:exp?"none":`1px dashed ${Z.b}`,opacity:exp?1:0.3}}/>;
              })}
              {sk>0&&(
              <span className={sk>=30?"streak30":sk>=14?"streak14":sk>=7?"streak7":""}
                style={{fontSize:11,color:sk>=30?"#ff6b35":sk>=14?"#fb923c":"#fb923c",
                  marginLeft:5,fontWeight:600,display:"inline-block"}}>
                ðŸ”¥{sk}
              </span>
            )}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {onLog&&h.logType==="sveglia"&&(
            <button onClick={e=>{e.stopPropagation();onLog(h);}}
              style={{fontSize:11,padding:"2px 7px",
                background:todayWake?`${col}22`:Z.s2,
                border:`1px solid ${todayWake?col+"55":Z.b}`,
                borderRadius:6,color:todayWake?col:Z.t2,
                fontFamily:"'JetBrains Mono',monospace",fontWeight:todayWake?700:400}}>
              {todayWake||"â°"}
            </button>
          )}
          {onLog&&h.logType&&h.logType!=="nessuno"&&h.logType!=="sveglia"&&(
            <button onClick={e=>{e.stopPropagation();onLog(h);}}
              style={{fontSize:13,padding:0,lineHeight:1,opacity:0.7}}>ðŸ“Š</button>
          )}
          <Dot c={sc.c} size={7}/>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ AREA SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AreaSection({area,tr,logs,onToggle,onEdit,onLog,onAdd,onDel}){
  const [open,setOpen]=useState(false);
  const [adding,setAdding]=useState(null);
  const [newName,setNewName]=useState("");
  const inputRef=useRef(null);
  const col=area.color||SILVER;
  const ts=tod();
  const habits=flatH([area]);
  const todayH=habits.filter(h=>isExpected(h,ts));
  const dn=todayH.filter(h=>tr[h.id]?.[ts]).length;
  const pct=todayH.length?Math.round(dn/todayH.length*100):100;

  const doAdd=()=>{
    if(newName.trim()&&adding){onAdd(adding,newName.trim());}
    setAdding(null);setNewName("");
  };
  const startAdd=catId=>{setAdding(catId);setNewName("");setTimeout(()=>inputRef.current?.focus(),60);};

  return(
    <div style={{marginBottom:8}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",display:"flex",alignItems:"center",gap:12,
          padding:"13px 16px",background:Z.s1,
          border:`1px solid ${open?col+"55":Z.b}`,
          borderRadius:open?"14px 14px 0 0":14,textAlign:"left",
          transition:"border-color 0.2s,border-radius 0.2s",
          boxShadow:open?`inset 3px 0 0 ${col}`:"none"}}>
        <Ring pct={pct} size={36} sw={3} color={col}>
          <span style={{fontSize:9,fontWeight:700,color:col,fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</span>
        </Ring>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:600,color:Z.t}}>{area.nome}</div>
          <div style={{fontSize:11,color:Z.t2,marginTop:1}}>{habits.length} abitudini Â· {dn}/{todayH.length} oggi</div>
        </div>
        <span style={{color:Z.t3,fontSize:16,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>âŒ„</span>
      </button>

      {open&&(
        <div style={{background:Z.s1,border:`1px solid ${col}55`,borderTop:"none",
          borderRadius:"0 0 14px 14px",padding:"6px 14px 14px"}}>
          {area.cat.map(cat=>{
            const catH=cat.h||[];
            return(
              <div key={cat.id} style={{marginTop:12}}>
                <div style={{fontSize:10,fontWeight:600,color:col,letterSpacing:"0.08em",
                  textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>
                  {cat.nome}
                </div>
                {catH.map(h=>(
                  <HRow key={h.id} h={{...h,aId:area.id,aN:area.nome,cN:cat.nome}}
                    tr={tr} logs={logs}
                    onToggle={onToggle}
                    onEdit={()=>onEdit({...h,aId:area.id,aN:area.nome,cN:cat.nome})}
                    onLog={h2=>onLog&&onLog({...h2,aId:area.id})}
                    onDel={onDel}/>
                ))}
                {adding===cat.id?(
                  <div className="in" style={{background:Z.s2,borderRadius:10,
                    border:`1.5px solid ${col}60`,padding:"10px 12px",marginTop:4}}>
                    <input ref={inputRef} value={newName} onChange={e=>setNewName(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")doAdd();if(e.key==="Escape"){setAdding(null);setNewName("");}}}
                      placeholder="Nome abitudine..."
                      style={{width:"100%",background:"transparent",border:"none",
                        color:Z.t,fontSize:16,outline:"none",marginBottom:10,
                        WebkitTextSizeAdjust:"100%"}}/>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setAdding(null);setNewName("");}}
                        style={{flex:1,padding:"9px",background:Z.b,borderRadius:8,color:Z.t2,fontSize:13}}>Annulla</button>
                      <button onClick={doAdd}
                        style={{flex:2,padding:"9px",background:newName.trim()?col:Z.b,
                          borderRadius:8,color:newName.trim()?"white":Z.t3,fontSize:13,fontWeight:600}}>Aggiungi</button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>startAdd(cat.id)}
                    style={{width:"100%",padding:"8px 0",marginTop:4,background:"transparent",
                      border:`1px dashed ${Z.b2}`,borderRadius:9,color:Z.t3,fontSize:13,
                      display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    <span style={{color:col,fontSize:15,lineHeight:1}}>+</span>
                    Aggiungi abitudine
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// â”€â”€ SLIDER CUSTOM â€” cross-platform â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SliderCustom({value,onChange,color,min=0,max=10,step=1}){
  const pct=((value-min)/(max-min))*100;
  const trackRef=useRef(null);

  const getVal=(clientX)=>{
    if(!trackRef.current)return value;
    const rect=trackRef.current.getBoundingClientRect();
    return Math.round(Math.max(min,Math.min(max,
      min+(clientX-rect.left)/rect.width*(max-min)))/step)*step;
  };

  return(
    <div ref={trackRef}
      style={{position:"relative",height:28,display:"flex",
        alignItems:"center",touchAction:"none",userSelect:"none"}}
      onTouchStart={e=>{e.stopPropagation();onChange(getVal(e.touches[0].clientX));}}
      onTouchMove={e=>{e.stopPropagation();onChange(getVal(e.touches[0].clientX));}}
      onMouseDown={e=>{
        e.stopPropagation();
        onChange(getVal(e.clientX));
        const mm=e2=>{onChange(getVal(e2.clientX));};
        const mu=()=>{window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
        window.addEventListener('mousemove',mm);
        window.addEventListener('mouseup',mu);
      }}>
      {/* Track */}
      <div style={{position:"absolute",left:0,right:0,height:4,borderRadius:2,
        background:"rgba(255,255,255,0.1)"}}>
        <div style={{position:"absolute",left:0,width:`${pct}%`,height:"100%",
          borderRadius:2,background:color}}/>
      </div>
      {/* Thumb */}
      <div style={{position:"absolute",
        left:`max(0px, min(calc(100% - 14px), calc(${pct}% - 7px)))`,
        width:14,height:14,borderRadius:"50%",
        background:"white",
        boxShadow:`0 0 0 2.5px ${color}, 0 2px 4px rgba(0,0,0,0.5)`,
        pointerEvents:"none"}}/>
    </div>
  );
}


// â”€â”€ LABEL ROW per Radar Vita â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LabelRow({left,right,top,openArea,areaPcts,setOpenArea}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",
      alignItems:top?"flex-end":"flex-start",
      marginBottom:top?6:0,marginTop:top?0:6,
      paddingLeft:4,paddingRight:4}}>
      {[left,right].map((idx,li)=>{
        const area=VITA_AREE[idx];
        const score=areaPcts[idx];
        const sel=openArea===area.id;
        return(
          <button key={area.id}
            onClick={()=>setOpenArea(sel?null:area.id)}
            style={{background:"transparent",padding:0,
              textAlign:li===0?"left":"right",
              display:"flex",flexDirection:"column",
              alignItems:li===0?"flex-start":"flex-end"}}>
            <span style={{fontSize:12,fontWeight:700,
              color:sel?area.color:area.color+"aa",
              whiteSpace:"nowrap",lineHeight:1.3,
              transition:"color 0.2s"}}>
              {area.nome}
            </span>
            <span style={{fontSize:13,fontWeight:800,
              color:sel?area.color:area.color+"55",
              fontFamily:"'JetBrains Mono',monospace",
              lineHeight:1.2,transition:"color 0.2s"}}>
              {score}
            </span>
          </button>
        );
      })}
    </div>
  );
}


// â”€â”€ VITA SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Vita({data,setData}){
  const scores   = data.vita||{};
  const setScore = (id,v)=>setData(d=>({...d,vita:{...d.vita,[id]:v}}));
  const [openArea,setOpenArea]=useState(null);
  const [activeDot,setActiveDot]=useState(null);
  const handleOpenArea=(id)=>{setOpenArea(id);setActiveDot(null);};

  const areaScore=a=>{
    const vals=a.cat.map(c=>scores[c.id]||0);
    return Math.round(vals.reduce((s,v)=>s+v,0)/vals.length*10)/10;
  };
  const areaPcts  = VITA_AREE.map(a=>areaScore(a));
  const globalAvg = Math.round(areaPcts.reduce((s,v)=>s+v,0)/VITA_AREE.length*10)/10;

  // Geometria: 4 spicchi 90Â°, 3 cat per area, gap 8Â°
  const CX=210, CY=180, R=118;
  const GAP=(8*Math.PI)/180, SPAN=Math.PI/2, CSPAN=(SPAN-GAP)/3;

  const areaA=VITA_AREE.map((_,ai)=>{
    const s0=-Math.PI/2+ai*SPAN;
    const s=s0+GAP/2, e=s0+SPAN-GAP/2;
    return{s,e,catA:[0,1,2].map(ci=>s+CSPAN*(ci+0.5))};
  });

  const ALL=VITA_AREE.flatMap((area,ai)=>
    area.cat.map((cat,ci)=>({...cat,aColor:area.color,ang:areaA[ai].catA[ci]}))
  );
  const vals=ALL.map(x=>scores[x.id]||0);
  const f2=n=>n.toFixed(2);
  const px=(a,v)=>CX+(v/10)*R*Math.cos(a);
  const py=(a,v)=>CY+(v/10)*R*Math.sin(a);
  // Per visualizzazione: se valore Ã¨ 0 usa 0.5 cosÃ¬ il poligono Ã¨ visibile
  const displayVals=vals.map(v=>v===0?0.3:v);
  const poly=ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,displayVals[i]))},${f2(py(x.ang,displayVals[i]))}`).join(" ")+"Z";
  const ring=v=>ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,v))},${f2(py(x.ang,v))}`).join(" ")+"Z";

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,
          margin:0,letterSpacing:"-0.4px"}}>La tua Vita</h1>
        <span style={{fontSize:15,fontWeight:700,color:SILVER,
          fontFamily:"'JetBrains Mono',monospace"}}>
          {globalAvg}<span style={{fontSize:11,fontWeight:400,color:Z.t3}}>/10</span>
        </span>
      </div>

      {/* Radar card â€” altezza limitata */}
      <div className="up" style={{background:"#0d0d0d",
        border:"1px solid #1e1e1e",borderRadius:20,
        padding:"14px",marginBottom:12}}>

        {/* Label riga TOP: Armonia(3=sx) Salute(0=dx) */}
        <LabelRow left={3} right={0} top={true}
          openArea={openArea} areaPcts={areaPcts} setOpenArea={setOpenArea}/>

        {/* SVG â€” altezza fissa 260px max */}
        <svg viewBox="0 0 420 360"
          style={{display:"block",width:"100%",maxHeight:260}}>
          <defs>
            <radialGradient id="pfill" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="white" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="white" stopOpacity="0.02"/>
            </radialGradient>
          </defs>

          {/* Spicchi */}
          {VITA_AREE.map((area,ai)=>{
            const{s,e}=areaA[ai];
            const x1=f2(CX+R*Math.cos(s)),y1=f2(CY+R*Math.sin(s));
            const x2=f2(CX+R*Math.cos(e)),y2=f2(CY+R*Math.sin(e));
            return(
              <path key={ai}
                d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`}
                fill={area.color} opacity={openArea===area.id?0.22:0.08}
                onClick={()=>setOpenArea(openArea===area.id?null:area.id)}
                style={{cursor:"pointer",transition:"opacity 0.2s"}}/>
            );
          })}

          {/* Separatori */}
          {VITA_AREE.map((_,ai)=>(
            <line key={`s${ai}`}
              x1={f2(CX+7*Math.cos(areaA[ai].s))} y1={f2(CY+7*Math.sin(areaA[ai].s))}
              x2={f2(CX+R*Math.cos(areaA[ai].s))} y2={f2(CY+R*Math.sin(areaA[ai].s))}
              stroke="#111" strokeWidth={2}/>
          ))}

          {/* Griglia */}
          {[5,10].map(v=>(
            <path key={v} d={ring(v)} fill="none"
              stroke={v===10?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)"}
              strokeWidth={v===10?1:0.6}/>
          ))}

          {/* Assi */}
          {ALL.map((x,i)=>(
            <line key={`a${i}`} x1={f2(CX)} y1={f2(CY)}
              x2={f2(CX+R*Math.cos(x.ang))} y2={f2(CY+R*Math.sin(x.ang))}
              stroke={x.aColor+"22"} strokeWidth={0.8}/>
          ))}

          {/* Poligono */}
          <path d={poly} fill="url(#pfill)"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={2} strokeLinejoin="round"/>

          {/* Dot interattivi con score al tocco */}
          {ALL.map((x,i)=>{
            const isActive=activeDot===x.id;
            const cx=f2(px(x.ang,vals[i])), cy=f2(py(x.ang,vals[i]));
            return(
              <g key={`d${i}`}
                onClick={()=>setActiveDot(isActive?null:x.id)}
                style={{cursor:"pointer"}}>
                <circle cx={cx} cy={cy}
                  r={isActive?10:6} fill={x.aColor}
                  opacity={isActive?0.3:0.2}
                  style={{transition:"r 0.15s,opacity 0.15s"}}/>
                <circle cx={cx} cy={cy}
                  r={isActive?5:3.5} fill={x.aColor}
                  stroke="#0d0d0d" strokeWidth={1.5}
                  style={{transition:"r 0.15s"}}/>
                {isActive&&(()=>{
                  const lx=parseFloat(cx), ly=parseFloat(cy);
                  // Posiziona tooltip sopra se spazio, sotto se vicino al bordo top
                  const above = ly > 30;
                  const ty = above ? ly-18 : ly+8;
                  // Clamp x per non uscire dal viewBox (340px)
                  const tx = Math.min(Math.max(lx-12, 2), 314);
                  return(
                    <g>
                      <rect x={f2(tx)} y={f2(ty)}
                        width={26} height={16} rx={4}
                        fill="#0d0d0d" stroke={x.aColor} strokeWidth={1}
                        opacity={0.95}/>
                      <text x={f2(tx+13)} y={f2(ty+11)}
                        textAnchor="middle" fontSize={10} fontWeight={700}
                        fill={x.aColor} fontFamily="'JetBrains Mono',monospace">
                        {vals[i]}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* Label categorie â€” nomi completi, font piccolo, fuori dal cerchio */}
          {ALL.map((x,i)=>{
            const lr=R+20;
            const lx=CX+lr*Math.cos(x.ang);
            const ly=CY+lr*Math.sin(x.ang);
            const cosA=Math.cos(x.ang), sinA=Math.sin(x.ang);
            const anchor=cosA>0.2?"start":cosA<-0.2?"end":"middle";
            const dy=sinA>0.2?10:sinA<-0.2?-3:4;
            return(
              <text key={`lc${i}`}
                x={f2(lx)} y={f2(ly+dy)}
                textAnchor={anchor}
                fontSize={10.5} fontWeight={600}
                fill={x.aColor+"ee"}
                fontFamily="Inter,sans-serif">
                {x.nome}
              </text>
            );
          })}

          {/* Centro */}
          <circle cx={CX} cy={CY} r={26} fill="#0d0d0d"
            stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>
          <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle"
            fontSize={16} fontWeight={800} fill="white"
            fontFamily="'JetBrains Mono',monospace">{globalAvg}</text>
          <text x={CX} y={CY+15} textAnchor="middle"
            fontSize={7} fill="rgba(255,255,255,0.3)"
            fontFamily="Inter,sans-serif">/ 10</text>
        </svg>

        {/* Label riga BOTTOM: Legami(2=sx) Ingegno(1=dx) */}
        <LabelRow left={2} right={1} top={false}
          openArea={openArea} areaPcts={areaPcts} setOpenArea={setOpenArea}/>
      </div>

      {/* Card aree 2Ã—2 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {VITA_AREE.map((area,i)=>{
          const score=areaPcts[i];
          const sel=openArea===area.id;
          return(
            <div key={area.id}
              onClick={()=>setOpenArea(sel?null:area.id)}
              style={{background:Z.s1,
                border:`1.5px solid ${sel?area.color+"66":Z.b}`,
                borderRadius:14,overflow:"hidden",
                transition:"border-color 0.2s",cursor:"pointer"}}>
              <div style={{padding:"10px 12px 8px",borderBottom:`1px solid ${Z.b}`}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",
                    background:area.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,
                    color:sel?area.color:area.color+"cc",flex:1}}>{area.nome}</span>
                  <span style={{fontSize:14,fontWeight:800,
                    color:sel?area.color:Z.t2,
                    fontFamily:"'JetBrains Mono',monospace"}}>{score}</span>
                  <span style={{fontSize:12,color:sel?area.color:Z.t3,
                    transform:sel?"rotate(180deg)":"rotate(0deg)",
                    transition:"transform 0.2s",marginLeft:2,
                    display:"inline-block"}}>âŒ„</span>
                </div>
                <div style={{height:2,background:Z.b,borderRadius:1,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${score*10}%`,
                    background:area.color,borderRadius:1,transition:"width 0.3s"}}/>
                </div>
              </div>
              <div style={{padding:"8px 12px"}}>
                {area.cat.map((cat,ci)=>{
                  const v=scores[cat.id]||0;
                  const bc=v>=7?area.color:v>=4?"#facc15":"#f87171";
                  return(
                    <div key={cat.id} style={{display:"flex",alignItems:"center",
                      gap:6,marginBottom:ci<area.cat.length-1?5:0}}>
                      <span style={{fontSize:11,color:Z.t2,flex:1,
                        overflow:"hidden",textOverflow:"ellipsis",
                        whiteSpace:"nowrap"}}>{cat.nome}</span>
                      <div style={{width:28,height:2,background:Z.b2,
                        borderRadius:1,overflow:"hidden",flexShrink:0}}>
                        <div style={{height:"100%",width:`${v*10}%`,
                          background:bc,borderRadius:1}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:bc,
                        fontFamily:"'JetBrains Mono',monospace",
                        width:12,textAlign:"right",flexShrink:0}}>{v}</span>
                    </div>
                  );
                })}
              </div>
              {sel&&(
                <div style={{borderTop:`1px solid ${Z.b}`,padding:"8px 12px 10px"}}>
                  {area.cat.map(cat=>{
                    const v=scores[cat.id]||0;
                    return(
                      <div key={cat.id} style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:Z.t3,marginBottom:3}}>{cat.nome}</div>
                        <SliderCustom value={v} min={0} max={10} step={1}
                          color={area.color}
                          onChange={v=>setScore(cat.id,v)}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// â”€â”€ ADD IN AREA â€” mini form inline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AddInArea({area,onAdd,color}){
  const [catId,setCatId]=useState(area.cat[0]?.id||"");
  const [name,setName]=useState("");
  const ref=useRef(null);
  const go=()=>{if(name.trim()&&catId){onAdd(catId,name.trim());setName("");}};
  return(
    <div>
      {/* Selector categoria */}
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {area.cat.map(cat=>(
          <button key={cat.id} onClick={()=>setCatId(cat.id)}
            style={{flex:1,padding:"5px 4px",borderRadius:8,fontSize:11,
              fontWeight:catId===cat.id?600:400,
              background:catId===cat.id?`${color}20`:Z.s2,
              border:`1px solid ${catId===cat.id?color:Z.b}`,
              color:catId===cat.id?color:Z.t3}}>
            {cat.nome}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input ref={ref} value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&go()}
          placeholder="Nome abitudine..."
          style={{flex:1,background:Z.s2,border:`1px solid ${name?color:Z.b}`,
            borderRadius:9,padding:"9px 12px",color:Z.t,fontSize:14,
            outline:"none",WebkitTextSizeAdjust:"100%"}}/>
        <button onClick={go}
          style={{padding:"9px 14px",background:name.trim()?color:Z.b,
            borderRadius:9,color:name.trim()?"white":Z.t3,
            fontSize:14,fontWeight:600,transition:"all 0.15s",
            flexShrink:0}}>
          +
        </button>
      </div>
    </div>
  );
}

// â”€â”€ ABITUDINI SCREEN â€” Card aree + lista filtrata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Abitudini({data,tr,logs,onToggle,onEdit,onLog,onAdd,onDel}){
  const ts=tod();
  const [filterArea,setFilterArea]=useState(null); // null = mostra tutte
  const allH=flatH(data.aree);
  const todayH=allH.filter(h=>isExpected(h,ts));
  const doneN=todayH.filter(h=>tr[h.id]?.[ts]).length;
  const pct=todayH.length?Math.round(doneN/todayH.length*100):100;

  // Lista abitudini visibile (filtrata per area se selezionata)
  const visibleH = useMemo(()=>{
    const base = data.aree.flatMap(area=>
      area.cat.flatMap(cat=>
        (cat.h||[]).map(h=>({...h,aId:area.id,aN:area.nome,
          cN:cat.nome,color:area.color}))
      )
    );
    if(!filterArea) return base;
    return base.filter(h=>h.aId===filterArea);
  },[data.aree,filterArea]);

  // Stats per area
  const areaStats = data.aree.map(area=>{
    const habits=flatH([area]);
    const todH=habits.filter(h=>isExpected(h,ts));
    const dn=todH.filter(h=>tr[h.id]?.[ts]).length;
    const p=todH.length?Math.round(dn/todH.length*100):100;
    return{...area,dn,total:todH.length,pct:p};
  });

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,
          margin:0,letterSpacing:"-0.4px"}}>Abitudini</h1>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:16,fontWeight:700,
            color:pct===100?"#00e5a0":SILVER_BRIGHT,
            fontFamily:"'JetBrains Mono',monospace"}}>
            {pct}%
          </div>
          <div style={{fontSize:10,color:Z.t3}}>
            {doneN}/{todayH.length} oggi
          </div>
        </div>
      </div>

      {/* Card aree â€” "Tutte" riga intera + 4 aree griglia 2x2 */}
      <div style={{marginBottom:14}}>
        {/* Tutte â€” riga intera */}
        <button onClick={()=>setFilterArea(null)}
          style={{width:"100%",padding:"10px 14px",borderRadius:14,textAlign:"left",
            background:!filterArea?"rgba(210,210,220,0.1)":"rgba(255,255,255,0.03)",
            border:`1px solid ${!filterArea?"rgba(210,210,220,0.35)":"rgba(255,255,255,0.07)"}`,
            display:"flex",alignItems:"center",gap:12,marginBottom:8,
            transition:"all 0.2s"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,
              color:!filterArea?SILVER_BRIGHT:Z.t3,marginBottom:5}}>Tutte le aree</div>
            <div style={{height:2,background:"rgba(255,255,255,0.08)",
              borderRadius:1,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,
                background:pct===100?"#00e5a0":SILVER,
                borderRadius:1,transition:"width 0.3s"}}/>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:22,fontWeight:800,lineHeight:1,
              color:pct===100?"#00e5a0":!filterArea?SILVER_BRIGHT:Z.t3,
              fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</div>
            <div style={{fontSize:10,color:Z.t3,marginTop:2}}>{doneN}/{todayH.length} oggi</div>
          </div>
        </button>

        {/* 4 aree â€” griglia 2x2 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {areaStats.map(area=>{
            const sel=filterArea===area.id;
            return(
              <button key={area.id} onClick={()=>setFilterArea(sel?null:area.id)}
                style={{padding:"11px 14px",borderRadius:14,textAlign:"left",
                  background:sel?`${area.color}20`:"rgba(255,255,255,0.03)",
                  border:`2px solid ${sel?area.color:"rgba(255,255,255,0.06)"}`,
                  transition:"all 0.18s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",
                    background:area.pct===100?"#00e5a0":area.color,
                    flexShrink:0,
                    boxShadow:sel?`0 0 6px ${area.color}`:"none"}}/>
                  <span style={{fontSize:11,fontWeight:700,
                    color:sel?area.color:Z.t2,flex:1,
                    whiteSpace:"nowrap",overflow:"hidden",
                    textOverflow:"ellipsis"}}>{area.nome}</span>
                  {area.pct===100&&
                    <span style={{fontSize:11,color:"#00e5a0",fontWeight:700}}>âœ“</span>}
                </div>
                <div style={{height:2,background:"rgba(255,255,255,0.08)",
                  borderRadius:1,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${area.pct}%`,
                    background:area.pct===100?"#00e5a0":area.color,
                    borderRadius:1,transition:"width 0.3s"}}/>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontSize:20,fontWeight:800,
                    color:area.pct===100?"#00e5a0":sel?area.color:Z.t2,
                    fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>
                    {area.pct}%
                  </span>
                  <span style={{fontSize:10,color:Z.t3}}>
                    {area.dn}/{area.total}
                  </span>
                </div>
                {sel&&(
                  <div style={{marginTop:5,fontSize:9,fontWeight:600,
                    color:area.color,letterSpacing:"0.08em",
                    textTransform:"uppercase",
                    fontFamily:"'JetBrains Mono',monospace"}}>
                    â— filtro attivo
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista abitudini â€” piatta, diretta */}
      {visibleH.length===0?(
        <div style={{textAlign:"center",padding:"32px 20px",
          background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14}}>
          <div style={{fontSize:14,color:Z.t2}}>
            {filterArea?"Nessuna abitudine in questa area":"Nessuna abitudine"}
          </div>
        </div>
      ):(
        <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
          borderRadius:14,overflow:"hidden"}}>
          {visibleH.map((h,i)=>(
            <div key={h.id}
              style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
              {/* Area/cat label se mostra tutte */}
              {!filterArea&&(i===0||visibleH[i-1].aId!==h.aId)&&(
                <div style={{padding:"8px 14px 4px",
                  display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:5,height:5,borderRadius:"50%",
                    background:h.color,flexShrink:0}}/>
                  <span style={{fontSize:10,fontWeight:600,
                    color:h.color,letterSpacing:"0.06em",
                    textTransform:"uppercase",
                    fontFamily:"'JetBrains Mono',monospace"}}>
                    {h.aN}
                  </span>
                </div>
              )}
              <HRow h={h} tr={tr} logs={logs}
                onToggle={onToggle}
                onEdit={()=>onEdit({...h})}
                onLog={h2=>onLog&&onLog({...h2,aId:h.aId})}
                onDel={onDel}
                compact showArea={false}/>
            </div>
          ))}

          {/* Add â€” inline per area selezionata */}
          {filterArea&&(()=>{
            const area=data.aree.find(a=>a.id===filterArea);
            if(!area)return null;
            return(
              <div style={{borderTop:`1px solid ${Z.b}`,
                padding:"10px 14px"}}>
                <AddInArea area={area} onAdd={onAdd} color={area.color}/>
              </div>
            );
          })()}
          {!filterArea&&(
            <button onClick={()=>{
              // Seleziona prima area disponibile
              const firstArea=data.aree[0];
              if(firstArea)setFilterArea(firstArea.id);
            }}
              style={{width:"100%",padding:"12px 14px",textAlign:"left",
                display:"flex",alignItems:"center",gap:8,
                color:SILVER,fontSize:13,fontWeight:500}}>
              <span style={{fontSize:18,lineHeight:1,color:SILVER}}>+</span>
              Nuova abitudine
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// â”€â”€ TASK SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TaskScreen({data,setData,onAdd,showToast}){
  const [editT,setEditT]=useState(null);
  const tog=id=>setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const del=id=>{
    const backup=(data.tasks||[]).find(t=>t.id===id);
    setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));
    setEditT(null);
    if(showToast)showToast('Task eliminato',
      backup?()=>setData(d=>({...d,tasks:[...(d.tasks||[]),backup]})):null);
  };
  const upd=ch=>{setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===editT.id?{...t,...ch}:t)}));setEditT(null);};
  const tasks=data.tasks||[];
  const pend=[...tasks.filter(t=>!t.done)].sort((a,b)=>{
    if(!a.deadline&&!b.deadline)return 0;
    if(!a.deadline)return 1;if(!b.deadline)return -1;
    return a.deadline.localeCompare(b.deadline);
  });
  const dn=tasks.filter(t=>t.done);
  const urg=pend.filter(t=>fmtDL(t.deadline)?.u);

  return(
    <div>
      {editT&&<EditTask task={editT} onSave={upd} onDel={()=>del(editT.id)} onClose={()=>setEditT(null)} aree={data.aree}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,letterSpacing:"-0.4px"}}>Task</h1>
        <button onClick={onAdd}
          style={{padding:"9px 18px",background:SILVER,border:"none",borderRadius:20,
            color:"#0a0a0a",fontSize:13,fontWeight:700}}>+ Aggiungi</button>
      </div>

      {tasks.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:Z.s1,
          borderRadius:14,border:`1px solid ${Z.b}`}}>
          <div style={{fontSize:18,fontWeight:700,color:Z.t,marginBottom:6}}>Nessun task</div>
          <div style={{fontSize:14,color:Z.t2}}>Tocca + per aggiungerne una</div>
        </div>
      )}

      {urg.length>0&&(
        <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)",
          borderRadius:12,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px 4px",fontSize:11,color:"#f87171",fontWeight:600,
            letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>
            Scadute Â· {urg.length}
          </div>
          {urg.map((t,i)=>{
            const d2=fmtDL(t.deadline);
            const aCol=data.aree.find(a=>a.id===t.aId)?.color;
            return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,
                padding:"10px 14px",borderTop:"1px solid rgba(248,113,113,0.12)"}}>
                <button onClick={()=>tog(t.id)} style={{width:22,height:22,borderRadius:"50%",
                  border:"1.5px solid rgba(248,113,113,0.4)",background:"transparent",flexShrink:0,padding:0}}/>
                <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditT(t)}>
                  <div style={{fontSize:14,color:ERR_LIGHT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{t.text}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginTop:1}}>
                    {d2&&<span style={{fontSize:11,color:d2.c,fontFamily:"'JetBrains Mono',monospace"}}>{d2.txt}</span>}
                    {aCol&&<span style={{fontSize:10,color:aCol+"99"}}>{data.aree.find(a=>a.id===t.aId)?.nome}</span>}
                  </div>
                </div>
                <button onClick={()=>del(t.id)} style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.5,padding:"4px 8px",margin:"-4px -8px"}}>Ã—</button>
              </div>
            );
          })}
        </div>
      )}

      {pend.filter(t=>!urg.includes(t)).length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600,color:Z.t2,marginBottom:8}}>
            Da fare Â· {pend.filter(t=>!urg.includes(t)).length}
          </div>
          {pend.filter(t=>!urg.includes(t)).map(t=>{
            const d2=fmtDL(t.deadline);
            const aCol=data.aree.find(a=>a.id===t.aId)?.color;
            return(
              <div key={t.id} style={{borderRadius:12,overflow:"hidden",marginBottom:6,
                border:`1px solid ${Z.b}`}}>
                <SwipeTask t={t}
                  onToggle={tog} onEdit={setEditT} onDelete={del}
                  aree={data.aree}/>
              </div>
            );
          })}
        </div>
      )}

      {dn.length>0&&(
        <div>
          <div style={{fontSize:13,fontWeight:600,color:Z.t3,marginBottom:8}}>Completate Â· {dn.length}</div>
          {dn.map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"10px 14px",borderRadius:10,marginBottom:4,
              background:"rgba(0,229,160,0.04)",border:"1px solid rgba(0,229,160,0.12)",opacity:0.65}}>
              <button onClick={()=>tog(t.id)} style={{width:22,height:22,borderRadius:"50%",
                background:"#00e5a0",border:"none",flexShrink:0,padding:0,
                display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0a",fontSize:12,fontWeight:700}}>âœ“</button>
              <span style={{flex:1,fontSize:14,color:Z.t3,textDecoration:"line-through",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
              <button onClick={()=>del(t.id)} style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.4,padding:"4px 8px",margin:"-4px -8px"}}>Ã—</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€ OBIETTIVI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Obiettivi({data,setData,showToast}){
  const [openG,setOpenG]=useState(null);
  const [editG,setEditG]=useState(null);
  const [newG,setNewG]=useState(false);
  const [addTo,setAddTo]=useState(null);
  const [newT,setNewT]=useState("");
  const inputRef=useRef(null);

  const togT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>{
    if(g.id!==gId)return g;
    const tasks=(g.tasks||[]).map(t=>t.id===tId?{...t,done:!t.done}:t);
    return{...g,tasks,pct:tasks.length?Math.round(tasks.filter(t=>t.done).length/tasks.length*100):g.pct||0};
  })}));
  const delT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>g.id!==gId?g:{...g,tasks:(g.tasks||[]).filter(t=>t.id!==tId)})}));
  const addT=gId=>{
    if(!newT.trim())return;
    setData(d=>({...d,goals:d.goals.map(g=>g.id!==gId?g:{...g,tasks:[...(g.tasks||[]),{id:uid(),text:newT.trim(),done:false}]})}));
    setNewT("");setAddTo(null);
  };
  const saveGoal=(ch,isNew)=>{
    if(isNew){
      setData(d=>({...d,goals:[...d.goals,{id:uid(),...ch,pct:0,tasks:[]}]}));
    }else{
      setData(d=>({...d,goals:d.goals.map(g=>g.id===editG.id?{...g,...ch}:g)}));
    }
    setEditG(null);setNewG(false);
  };
  const delGoal=()=>{
    setData(d=>({...d,goals:d.goals.filter(g=>g.id!==editG.id)}));
    setEditG(null);
  };

  return(
    <div>
      {(editG||newG)&&(
        <EditGoal
          item={editG||{}}
          isNew={newG}
          onSave={ch=>saveGoal(ch,newG)}
          onDel={delGoal}
          onClose={()=>{setEditG(null);setNewG(false);}}/>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,letterSpacing:"-0.4px"}}>Obiettivi</h1>
        <button onClick={()=>setNewG(true)}
          style={{padding:"9px 16px",background:"rgba(250,204,21,0.12)",
            border:"1px solid rgba(250,204,21,0.3)",borderRadius:20,
            color:"#facc15",fontSize:13,fontWeight:700}}>+ Nuovo</button>
      </div>

      {data.goals.length===0&&(
        <div className="up" style={{background:Z.s1,border:`1px solid ${Z.b}`,
          borderRadius:16,padding:"40px 24px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>ðŸŽ¯</div>
          <h2 style={{fontSize:18,fontWeight:700,color:Z.t,marginBottom:8}}>
            Nessun obiettivo
          </h2>
          <p style={{fontSize:14,color:Z.t2,lineHeight:1.6,marginBottom:20}}>
            Aggiungi il tuo primo obiettivo e inizia a tracciare i progressi
          </p>
          <button onClick={()=>setNewG(true)}
            style={{padding:"12px 28px",background:"#facc15",border:"none",
              borderRadius:12,color:"#0a0a0a",fontSize:14,fontWeight:700}}>
            + Crea obiettivo
          </button>
        </div>
      )}
      {data.goals.map((g,gi)=>{
        const st=STATUS[g.s]||STATUS.red;
        const isOpen=openG===g.id;
        const gt=g.tasks||[];
        const dn=gt.filter(t=>t.done).length;
        const tp=gt.length?Math.round(dn/gt.length*100):g.pct||0;
        const isComplete=tp>=100;

        return(
          <div key={g.id} style={{marginBottom:8}}>
            {isComplete?(
              // Visual speciale per obiettivi completati
              <div onClick={()=>setOpenG(isOpen?null:g.id)}
                style={{padding:"14px 16px",borderRadius:isOpen?"14px 14px 0 0":14,
                  background:"linear-gradient(135deg,rgba(0,229,160,0.12),rgba(0,229,160,0.04))",
                  border:"1px solid rgba(0,229,160,0.3)",cursor:"pointer",
                  position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"#00e5a0"}}/>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:20}}>ðŸ†</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,color:"#00e5a0",fontWeight:700}}>{g.text}</div>
                    {g.note&&<div style={{fontSize:12,color:"rgba(0,229,160,0.6)",marginTop:2}}>{g.note}</div>}
                  </div>
                  <button onClick={e=>{e.stopPropagation();setEditG(g);}}
                    style={{fontSize:11,color:"rgba(0,229,160,0.5)",padding:"3px 8px",
                      background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.2)",
                      borderRadius:20}}>Modifica</button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:3,background:"rgba(0,229,160,0.2)",borderRadius:2}}>
                    <div style={{height:"100%",width:"100%",background:"#00e5a0",borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:11,color:"#00e5a0",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>
                    {dn}/{gt.length} âœ“
                  </span>
                </div>
              </div>
            ):(
              <div onClick={()=>setOpenG(isOpen?null:g.id)}
                style={{padding:"14px 16px",borderRadius:isOpen?"14px 14px 0 0":14,
                  background:Z.s1,border:`1px solid ${isOpen?"rgba(255,255,255,0.15)":Z.b}`,
                  cursor:"pointer",position:"relative",overflow:"hidden",
                  transition:"border-color 0.2s"}}>
                <div style={{position:"absolute",top:0,left:0,height:2,
                  background:"rgba(255,255,255,0.15)",width:`${tp}%`,transition:"width 0.5s"}}/>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,color:Z.t,fontWeight:600,lineHeight:1.3}}>{g.text}</div>
                    {g.note&&<div style={{fontSize:12,color:Z.t3,marginTop:3}}>{g.note}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                    {/* Mini ring progress */}
                    <div style={{position:"relative",width:36,height:36,flexShrink:0}}>
                      <svg width={36} height={36}
                        style={{transform:"rotate(-90deg)",display:"block"}}>
                        <circle cx={18} cy={18} r={13} fill="none"
                          stroke={`${st.c}22`} strokeWidth={3.5}/>
                        <circle cx={18} cy={18} r={13} fill="none"
                          stroke={st.c} strokeWidth={3.5}
                          strokeDasharray={2*Math.PI*13}
                          strokeDashoffset={2*Math.PI*13*(1-(tp/100))}
                          strokeLinecap="round"
                          style={{transition:"stroke-dashoffset 0.5s"}}/>
                      </svg>
                      <div style={{position:"absolute",inset:0,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:9,fontWeight:700,color:st.c,
                          fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>
                          {tp}
                        </span>
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setEditG(g);}}
                      style={{fontSize:11,color:Z.t3,padding:"3px 8px",
                        background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:20}}>
                      Modifica
                    </button>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:3,background:Z.s3,borderRadius:2}}>
                    <div style={{height:"100%",width:`${tp}%`,
                      background:st.c,borderRadius:2,transition:"width 0.5s",
                      boxShadow:tp>80?`0 0 6px ${st.c}88`:"none"}}/>
                  </div>
                  <span style={{fontSize:11,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>{dn}/{gt.length}</span>
                </div>
              </div>
            )}

            {isOpen&&(
              <div style={{background:Z.s1,
                border:`1px solid ${isComplete?"rgba(0,229,160,0.3)":"rgba(255,255,255,0.1)"}`,
                borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
                {gt.map((t,ti)=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,
                    padding:"10px 16px",
                    borderBottom:ti<gt.length-1?`1px solid ${Z.b}`:"none",
                    opacity:t.done?0.5:1}}>
                    <button onClick={()=>togT(g.id,t.id)}
                      style={{width:22,height:22,borderRadius:"50%",flexShrink:0,padding:0,
                        background:t.done?"#00e5a0":"transparent",
                        border:`1.5px solid ${t.done?"#00e5a0":Z.b2}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        color:"#0a0a0a",fontSize:12,fontWeight:700}}>
                      {t.done&&"âœ“"}
                    </button>
                    <span style={{flex:1,fontSize:14,color:t.done?Z.t3:Z.t,
                      textDecoration:t.done?"line-through":"none",fontWeight:t.done?400:500}}>
                      {t.text}
                    </span>
                    <button onClick={()=>delT(g.id,t.id)}
                      style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.4,padding:"4px 8px",margin:"-4px -8px"}}>Ã—</button>
                  </div>
                ))}
                {addTo===g.id?(
                  <div style={{padding:"10px 16px",background:Z.s2,borderTop:`1px solid ${Z.b}`}}>
                    <input ref={inputRef} value={newT} onChange={e=>setNewT(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")addT(g.id);if(e.key==="Escape"){setAddTo(null);setNewT("");}}}
                      autoFocus placeholder="Nuovo traguardo..."
                      style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,
                        borderRadius:8,padding:"9px 12px",color:Z.t,fontSize:14,
                        boxSizing:"border-box",marginBottom:8}}/>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setAddTo(null);setNewT("");}}
                        style={{flex:1,padding:"8px",background:Z.b,borderRadius:8,color:Z.t2,fontSize:13}}>
                        Annulla
                      </button>
                      <button onClick={()=>addT(g.id)}
                        style={{flex:2,padding:"8px",background:"rgba(255,255,255,0.15)",
                          borderRadius:8,color:Z.t,fontSize:13,fontWeight:600}}>
                        Aggiungi
                      </button>
                    </div>
                  </div>
                ):(
                  <button onClick={e=>{e.stopPropagation();setAddTo(g.id);setNewT("");setTimeout(()=>inputRef.current?.focus(),50);}}
                    style={{width:"100%",padding:"11px 16px",
                      borderTop:`1px solid ${Z.b}`,background:"transparent",
                      color:Z.t3,fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:15,lineHeight:1,color:"rgba(255,255,255,0.3)"}}>+</span>
                    Aggiungi traguardo
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// â”€â”€ LUCIUS (ex Analisi) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Lucius({data,tr}){
  const [loading,setLoading]=useState(false);
  const [reply,setReply]=useState("");
  const [asked,setAsked]=useState(false);

  const habits=flatH(data.aree);
  const ts=tod();
  const todayH=habits.filter(h=>isExpected(h,ts));
  const doneN=todayH.filter(h=>tr[h.id]?.[ts]).length;
  const pct=todayH.length?Math.round(doneN/todayH.length*100):100;
  const ws=wScr(habits,tr,0);
  const topStreak=habits.map(h=>({...h,sk:strkF(h,tr)})).sort((a,b)=>b.sk-a.sk).slice(0,3);
  const pending=(data.tasks||[]).filter(t=>!t.done);
  const goals=data.goals||[];
  const avgGoal=goals.length?Math.round(goals.reduce((s,g)=>s+(g.pct||0),0)/goals.length):0;

  const context=`
Sono Davide. Ecco i miei dati Meridian:
- Abitudini oggi: ${doneN}/${todayH.length} completate (${pct}%)
- Score settimana: ${ws}%
- Streak piÃ¹ lunghe: ${topStreak.filter(h=>h.sk>0).map(h=>`${h.nome} (${h.sk}gg)`).join(", ")||"nessuna"}
- Task aperte: ${pending.length}${pending.filter(t=>t.deadline&&new Date(t.deadline)<new Date()).length>0?` (${pending.filter(t=>t.deadline&&new Date(t.deadline)<new Date()).length} scadute)`:""}
- Obiettivi: ${avgGoal}% avanzamento medio
- Obiettivi: ${goals.map(g=>`${g.text} ${g.pct||0}%`).join(", ")}
`;

  const askLucius=async()=>{
    setLoading(true);setAsked(true);setReply("");
    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:`${context}\n\nSei Lucius, il mio life coach saggio e diretto. Dammi una riflessione personale sui miei dati di questa settimana: cosa sta andando bene, cosa migliorare, e un'azione concreta per i prossimi 3 giorni. Sii conciso, diretto, caldo ma non retorico. Rispondi in italiano.`}]
        })
      });
      const d=await resp.json();
      setReply(d.content?.[0]?.text||"Nessuna risposta.");
    }catch(e){setReply("Errore di connessione. Riprova.");}
    setLoading(false);
  };

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:"0 0 4px",letterSpacing:"-0.4px"}}>Lucius</h1>
        <p style={{fontSize:14,color:Z.t2,margin:0}}>Il tuo coach personale</p>
      </div>

      {/* Snapshot dati */}
      <div className="up" style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:16,
        padding:"16px",marginBottom:14}}>
        <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
          textTransform:"uppercase",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>
          I tuoi dati oggi
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {l:"Abitudini",v:`${pct}%`,c:pct>=80?"#00e5a0":pct>=50?"#facc15":"#f87171"},
            {l:"Settimana",v:`${ws}%`,c:ws>=70?"#00e5a0":ws>=40?"#facc15":"#f87171"},
            {l:"Task aperte",v:pending.length,c:SILVER},
            {l:"Obiettivi",v:`${avgGoal}%`,c:SILVER},
          ].map(({l,v,c})=>(
            <div key={l} style={{background:Z.s2,borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"'JetBrains Mono',monospace",lineHeight:1,marginBottom:4}}>{v}</div>
              <div style={{fontSize:12,color:Z.t3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottone chiedi a Lucius */}
      {!asked?(
        <div className="up d1" style={{textAlign:"center",padding:"32px 20px",
          background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:16}}>
          <div style={{fontSize:24,marginBottom:12}}>ðŸ§ </div>
          <h2 style={{fontSize:17,fontWeight:700,color:Z.t,marginBottom:8}}>Parla con Lucius</h2>
          <p style={{fontSize:14,color:Z.t2,lineHeight:1.6,marginBottom:20}}>
            Lucius analizza i tuoi dati e ti dÃ  una riflessione personalizzata sulla tua settimana.
          </p>
          <button onClick={askLucius} disabled={loading}
            style={{padding:"13px 28px",
              background:loading?"rgba(200,200,212,0.3)":SILVER,
              border:"none",borderRadius:12,
              color:loading?"rgba(0,0,0,0.4)":"#0a0a0a",
              fontSize:15,fontWeight:700,
              cursor:loading?"not-allowed":"pointer",
              transition:"all 0.2s"}}>
            {loading?"In corso...":"Chiedi a Lucius"}
          </button>
        </div>
      ):(
        <div className="up d1" style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:16,padding:"18px"}}>
          {loading?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:13,color:Z.t2,marginBottom:8}}>Lucius sta riflettendo...</div>
              <div style={{width:40,height:4,background:Z.b,borderRadius:2,margin:"0 auto",overflow:"hidden"}}>
                <div style={{width:"60%",height:"100%",background:SILVER,animation:"pulse 1.2s infinite"}}/>
              </div>
            </div>
          ):(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:18}}>ðŸ§ </span>
                <span style={{fontSize:13,fontWeight:600,color:Z.t2}}>Lucius</span>
              </div>
              <div style={{fontSize:15,color:Z.t,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{reply}</div>
              <button onClick={()=>{setAsked(false);setReply("");}}
                style={{marginTop:16,fontSize:12,color:Z.t3,padding:"8px 14px",
                  background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:20}}>
                Chiedi ancora
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€ SWIPE TASK ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SwipeTask({t,onToggle,onEdit,onDelete,aree}){
  const [tx,setTx]=useState(0),[sw,setSw]=useState(false);
  const swX=useRef(0),swS=useRef(0);
  const prog=Math.min(1,Math.abs(tx)/60);
  const goingRight=tx>0; // right=complete, left=delete
  const d2=fmtDL(t.deadline);
  const aCol=aree?.find(a=>a.id===t.aId)?.color;
  const aName=aree?.find(a=>a.id===t.aId)?.nome;
  return(
    <div style={{position:"relative",overflow:"hidden"}}>
      {/* BG feedback */}
      <div style={{position:"absolute",inset:0,display:"flex",
        alignItems:"center",
        justifyContent:goingRight?"flex-start":"flex-end",
        padding:"0 16px",
        background:goingRight
          ?`rgba(0,229,160,${prog*0.25})`
          :`rgba(248,113,113,${prog*0.25})`}}>
        <span style={{fontSize:16,opacity:prog}}>
          {goingRight?"âœ“":"ðŸ—‘"}
        </span>
      </div>
      <div
        onTouchStart={e=>{swS.current=e.touches[0].clientX;setSw(true);}}
        onTouchMove={e=>{
          if(!sw)return;
          const dx=clamp(e.touches[0].clientX-swS.current,-80,80);
          swX.current=dx;setTx(dx);
        }}
        onTouchEnd={()=>{
          setSw(false);
          if(swX.current>60){onToggle(t.id);if(navigator.vibrate)navigator.vibrate([6,3,6]);}
          else if(swX.current<-60){onDelete(t.id);if(navigator.vibrate)navigator.vibrate([8]);}
          swX.current=0;setTx(0);
        }}
        style={{display:"flex",alignItems:"center",gap:10,
          padding:"11px 14px",
          background:t.done?"rgba(0,229,160,0.04)":Z.s1,
          transform:`translateX(${tx}px)`,
          transition:sw?"none":"transform 0.28s cubic-bezier(0.16,1,0.3,1)"}}>
        <button onClick={()=>onToggle(t.id)}
          style={{width:22,height:22,borderRadius:"50%",flexShrink:0,padding:0,
            background:t.done?"#00e5a0":"transparent",
            border:`1.5px solid ${t.done?"#00e5a0":Z.b2}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#0a0a0a",fontSize:12,fontWeight:700}}>
          {t.done&&"âœ“"}
        </button>
        <div style={{flex:1,minWidth:0,cursor:"pointer"}}
          onClick={()=>swX.current===0&&onEdit(t)}>
          <div style={{fontSize:14,color:t.done?Z.t3:Z.t,
            fontWeight:t.done?400:500,
            textDecoration:t.done?"line-through":"none",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {t.text}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:1}}>
            {d2&&<span style={{fontSize:11,color:d2.c,
              fontFamily:"'JetBrains Mono',monospace"}}>{d2.txt}</span>}
            {aCol&&<div style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:aCol}}/>
              <span style={{fontSize:10,color:aCol+"99"}}>{aName}</span>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}


// â”€â”€ HOME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Home({data,tr,logs,onToggle,onEditHabit,onLog,setScreen,setData,onAddTask,showToast}){
  const ts=tod();
  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const todayH=habits.filter(h=>isExpected(h,ts));
  const done=habits.filter(h=>tr[h.id]?.[ts]);
  const rem=todayH.filter(h=>!tr[h.id]?.[ts]);
  const pct=todayH.length?Math.round(done.filter(h=>isExpected(h,ts)).length/todayH.length*100):100;
  const pending=(data.tasks||[]).filter(t=>!t.done);
  const urg=pending.filter(t=>fmtDL(t.deadline)?.u);
  const [editT,setEditT]=useState(null);
  const togT=id=>setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const delT=id=>{setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));if(showToast)showToast('Task eliminato');};
  const saveT=ch=>{setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===editT.id?{...t,...ch}:t)}));setEditT(null);};
  const ac=pct===100?"#00e5a0":SILVER_BRIGHT;
  const dateStr=new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"});
  return(
    <div>
      {editT&&<EditTask task={editT} onSave={saveT}
        onDel={()=>{delT(editT.id);setEditT(null);}}
        onClose={()=>setEditT(null)} aree={data.aree}/>}
      <div className="up" style={{marginBottom:20}}>
        <div style={{fontSize:11,color:Z.t3,marginBottom:3,textTransform:"capitalize",fontFamily:"'JetBrains Mono',monospace"}}>{dateStr}</div>
        <h1 style={{fontSize:22,fontWeight:800,color:Z.t,lineHeight:1.2,letterSpacing:"-0.3px",margin:0}}>
          {greet()}, <span style={{color:ac,transition:"color 0.4s"}}>Davide</span>
        </h1>
      </div>
      <div className="up d1" style={{marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,fontWeight:700,color:Z.t}}>Abitudini</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{height:3,width:50,background:Z.s3,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#00e5a0":SILVER,borderRadius:2,transition:"width 0.6s"}}/>
              </div>
              <span style={{fontSize:11,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</span>
            </div>
          </div>
          <button onClick={()=>setScreen("abitudini")} style={{fontSize:12,color:Z.t3}}>Tutte â†’</button>
        </div>
        {todayH.length===0?(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:12,padding:"18px",textAlign:"center",color:Z.t3,fontSize:13}}>Nessuna abitudine prevista oggi</div>
        ):pct===100?(
          <div style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.18)",borderRadius:12,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#00e5a0",marginBottom:2}}>Tutto completato! ðŸŽ‰</div>
            <div style={{fontSize:12,color:Z.t3}}>Ottima giornata, Davide</div>
          </div>
        ):(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:12,overflow:"hidden"}}>
            {rem.slice(0,5).map((h,i)=>(
              <div key={h.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
                <HRow h={h} tr={tr} logs={logs} onToggle={onToggle} onEdit={onEditHabit} onLog={onLog} compact showArea/>
              </div>
            ))}
            {rem.length>5&&<button onClick={()=>setScreen("abitudini")} style={{width:"100%",padding:"10px",borderTop:`1px solid ${Z.b}`,background:"transparent",color:Z.t3,fontSize:13}}>+ altre {rem.length-5} â†’</button>}
          </div>
        )}
      </div>
      <div className="up d2">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:700,color:Z.t}}>Task</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onAddTask} style={{fontSize:12,color:SILVER,fontWeight:600,padding:"4px 10px",background:"rgba(200,200,212,0.08)",border:"1px solid rgba(200,200,212,0.2)",borderRadius:20}}>+ Aggiungi</button>
            {pending.length>0&&<button onClick={()=>setScreen("task")} style={{fontSize:12,color:Z.t3}}>Tutte â†’</button>}
          </div>
        </div>
        {pending.length===0?(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:12,padding:"16px",textAlign:"center",color:Z.t3,fontSize:13}}>Nessun task aperta âœ“</div>
        ):(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:12,overflow:"hidden"}}>
            {[...urg,...pending.filter(t=>!urg.includes(t))].slice(0,4).map((t,i)=>(
              <div key={t.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
                <SwipeTask t={t}
                  onToggle={togT}
                  onEdit={setEditT}
                  onDelete={id=>{const backup=(data.tasks||[]).find(t=>t.id===id);delT(id);if(showToast)showToast("Task eliminato",backup?()=>setData(d=>({...d,tasks:[...(d.tasks||[]),backup]})):null);}}
                  aree={data.aree}/>
              </div>
            ))}
            {pending.length>4&&<button onClick={()=>setScreen("task")} style={{width:"100%",padding:"10px",borderTop:`1px solid ${Z.b}`,background:"transparent",color:Z.t3,fontSize:13}}>+ altre {pending.length-4}</button>}
          </div>
        )}
      </div>


    </div>
  );
}


// â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Toast({msg,onDone,onUndo}){
  useEffect(()=>{
    const t=setTimeout(onDone,onUndo?3500:2500);
    return()=>clearTimeout(t);
  },[]);
  return(
    <div style={{
      position:"fixed",bottom:88,left:"50%",
      transform:"translateX(-50%)",
      zIndex:999,
      background:"rgba(30,30,30,0.96)",
      border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:20,
      padding:"10px 8px 10px 18px",
      fontSize:13,fontWeight:500,
      color:Z.t,
      whiteSpace:"nowrap",
      backdropFilter:"blur(12px)",
      WebkitBackdropFilter:"blur(12px)",
      boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
      display:"flex",alignItems:"center",gap:10,
      animation:"toast-in 0.25s cubic-bezier(0.16,1,0.3,1) both"}}>
      <span>{msg}</span>
      {onUndo&&(
        <button onClick={()=>{onUndo();onDone();}}
          style={{padding:"4px 10px",background:"rgba(255,255,255,0.15)",
            border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,
            color:Z.t,fontSize:12,fontWeight:600,flexShrink:0}}>
          Annulla
        </button>
      )}
    </div>
  );
}


// â”€â”€ APP ROOT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App(){
  const [data,setData]=useState(()=>{
    try{
      const raw=localStorage.getItem("m8");
      if(!raw)return INIT;
      const p=JSON.parse(raw);
      if(!p.tasks)p.tasks=[];
      if(!p.goals)p.goals=INIT.goals;
      if(!p.vita||Object.keys(p.vita).length<12)p.vita={...INIT.vita,...(p.vita||{})};
      if(!p.aree)p.aree=INIT.aree;
      p.goals=p.goals.map(g=>({tasks:[],...g,pct:g.pct||0,s:g.s||"red",note:g.note||""}));
      p.goals=p.goals.map(g=>{if(g.tasks?.length){const dn=g.tasks.filter(t=>t.done).length;return{...g,pct:Math.round(dn/g.tasks.length*100)};}return g;});
      p.aree=p.aree.map(a=>({...a,color:AREA_C[a.id]||a.color,
        cat:(a.cat||[]).map(c=>({...c,h:(c.h||[]).map(h=>({freq:{type:"daily"},...h}))}))}));
      return p;
    }catch{return INIT;}
  });

  const [tr,setTr]=useState(()=>{try{const s=localStorage.getItem("m-tr");if(s)return JSON.parse(s);return {"h1":{"2026-05-24":true,"2026-05-25":true,"2026-05-26":true,"2026-05-27":true,"2026-05-28":true,"2026-05-29":true,"2026-05-30":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true,"2026-06-05":true,"2026-06-06":true},"h2":{"2026-05-25":true,"2026-05-27":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true},"h3":{"2026-05-25":true,"2026-05-27":true,"2026-05-29":true,"2026-06-03":true,"2026-06-05":true},"h4":{"2026-05-24":true,"2026-05-25":true,"2026-05-26":true,"2026-05-28":true,"2026-05-29":true,"2026-05-30":true,"2026-05-31":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true,"2026-06-05":true,"2026-06-06":true},"h5":{"2026-05-24":true,"2026-05-25":true,"2026-05-27":true,"2026-05-28":true,"2026-05-29":true,"2026-05-30":true,"2026-05-31":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true,"2026-06-05":true,"2026-06-06":true},"h6":{"2026-05-24":true,"2026-05-25":true,"2026-05-26":true,"2026-05-27":true,"2026-05-28":true,"2026-05-29":true,"2026-05-30":true,"2026-05-31":true,"2026-06-01":true,"2026-06-03":true,"2026-06-04":true,"2026-06-05":true,"2026-06-06":true},"h7":{"2026-05-25":true,"2026-05-26":true,"2026-05-27":true,"2026-05-28":true,"2026-05-29":true,"2026-05-30":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-06":true},"h8":{"2026-05-25":true,"2026-06-01":true},"h9":{"2026-05-25":true,"2026-05-26":true,"2026-05-27":true,"2026-05-28":true,"2026-05-29":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true},"h10":{"2026-06-01":true},"h11":{"2026-05-25":true,"2026-05-26":true,"2026-05-27":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true},"h12":{"2026-05-26":true,"2026-06-01":true,"2026-06-02":true},"h13":{"2026-05-25":true,"2026-05-26":true,"2026-06-01":true},"h15":{"2026-05-25":true,"2026-06-01":true},"h16":{"2026-05-24":true,"2026-05-25":true,"2026-05-26":true,"2026-05-29":true,"2026-05-30":true,"2026-05-31":true,"2026-06-01":true,"2026-06-02":true,"2026-06-03":true,"2026-06-04":true,"2026-06-05":true,"2026-06-06":true},"h17":{"2026-05-26":true,"2026-05-27":true,"2026-06-01":true},"h18":{"2026-05-26":true,"2026-05-27":true,"2026-06-01":true,"2026-06-02":true}};}catch{return {};}});
  const [logs,setLogs]=useState(()=>{try{const s=localStorage.getItem("m-lg");return s?JSON.parse(s):{};}catch{return {};}});
  const [screen,setScreen]=useState("home");
  const [editH,setEditH]=useState(null);
  const [wakeH,setWakeH]=useState(null);
  const [addingTask,setAddingTask]=useState(false);
  const [toast,setToast]=useState(null); // {msg, onUndo}



  const showToast=(msg,onUndo=null)=>{
    setToast({msg,onUndo});
    setTimeout(()=>setToast(null),onUndo?3600:2600);
  };

  useEffect(()=>{try{localStorage.setItem("m8",JSON.stringify(data));}catch{}},[data]);
  useEffect(()=>{try{localStorage.setItem("m-tr",JSON.stringify(tr));}catch{}},[tr]);
  useEffect(()=>{try{localStorage.setItem("m-lg",JSON.stringify(logs));}catch{}},[logs]);
  useEffect(()=>{document.body.style.background=Z.bg;},[]);
  useEffect(()=>{if(document.getElementById("mss"))return;const el=document.createElement("style");el.id="mss";el.textContent=CSS;document.head.appendChild(el);},[]);

  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const ts=tod();
  const todayH=habits.filter(h=>isExpected(h,ts));
  const tdone=todayH.filter(h=>tr[h.id]?.[ts]).length;
  const tpct=todayH.length?Math.round(tdone/todayH.length*100):100;

  const toggle=useCallback(id=>{const t=tod();setTr(prev=>{const l=prev[id]||{};return{...prev,[id]:{...l,[t]:!l[t]}};});},[]);

  const saveHabit=({s,note,freq,nome})=>{
    if(!editH)return;
    setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>({...c,h:c.h.map(h=>h.id===editH.id?{...h,s,note,freq:freq||h.freq,nome:nome||h.nome}:h)}))}))}));
    setEditH(null);
  };
  const delHabit=(hId)=>{
    const id=hId||editH?.id;
    if(!id)return;
    setData(d=>({...d,aree:d.aree.map(a=>({...a,
      cat:a.cat.map(cat=>({...cat,
        h:(cat.h||[]).filter(h=>h.id!==id)
      }))
    }))}));
    if(!hId)setEditH(null);
  };
  const addHabit=(catId,nome)=>{
    setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>c.id!==catId?c:{...c,h:[...c.h,{id:uid(),nome,s:"red",note:"",freq:{type:"daily"},logType:"nessuno"}]})}))}));
  };
  const saveWake=(hId,entry)=>{
    const t=tod();
    setLogs(prev=>({...prev,[hId]:{...(prev[hId]||{}),[t]:{...(prev[hId]?.[t]||{}),...entry}}}));
    setTr(prev=>{const l=prev[hId]||{};return{...prev,[hId]:{...l,[t]:true}};});
    setWakeH(null);
  };
  const addTask=(ch)=>{
    setData(d=>({...d,tasks:[...(d.tasks||[]),{id:uid(),done:false,...ch}]}));
    setAddingTask(false);
  };

  // Nav
  const NAV=[
    {id:"home",     l:"Home"},
    {id:"abitudini",l:"Abitudini"},
    {id:"task",     l:"Task"},
    {id:"obiettivi",l:"Obiettivi"},
    {id:"visione",  l:"Visione"},
    {id:"analisi",  l:"Analisi"},
  ];

  const ICONS={
    home:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10L12 3l9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/>
        <polyline points="9 21 9 12 15 12 15 21" stroke="currentColor" strokeWidth={a?2.2:1.6} fill="none"/>
      </svg>
    ),
    abitudini:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M7 12.5l3.5 3.5 6-7"/>
      </svg>
    ),
    task:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6"/>
        <line x1="9" y1="12" x2="20" y2="12"/>
        <line x1="9" y1="18" x2="20" y2="18"/>
        <polyline points="4 6 5 7 7 5"/>
        <polyline points="4 12 5 13 7 11"/>
        <polyline points="4 18 5 19 7 17"/>
      </svg>
    ),
    obiettivi:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    visione:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    analisi:a=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={a?2.2:1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
        <line x1="12" y1="7" x2="12" y2="13"/>
      </svg>
    ),
  };

  return(
    <div style={{height:"100dvh",maxWidth:480,margin:"0 auto",
      background:Z.bg,color:Z.t,
      fontFamily:"Inter,-apple-system,BlinkMacSystemFont,sans-serif",
      display:"flex",flexDirection:"column",overflow:"hidden",
      WebkitFontSmoothing:"antialiased"}}>

      {/* Modali globali */}
      {editH&&<EditHabit item={editH} onSave={saveHabit} onDel={delHabit} onClose={()=>setEditH(null)}/>}
      {toast&&<Toast msg={toast.msg} onUndo={toast.onUndo} onDone={()=>setToast(null)}/>}
      {wakeH&&<WakeLog h={wakeH} logs={logs} onLog={saveWake} onClose={()=>setWakeH(null)}/>}
      {addingTask&&<EditTask task={{}} onSave={addTask} onDel={()=>{}} onClose={()=>setAddingTask(false)} aree={data.aree}/>}

      {/* HEADER */}
      <div style={{flexShrink:0,zIndex:20,
        background:"rgba(10,10,10,0.92)",
        backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
        borderBottom:`1px solid ${Z.b}`}}>
        <div style={{display:"flex",alignItems:"center",padding:"13px 18px 0"}}>
          <div style={{flex:1}}>
            <span style={{fontSize:20,fontWeight:800,letterSpacing:"-0.5px",color:Z.t}}>
              <span style={{color:SILVER_BRIGHT,transition:"color 0.3s"}}>M</span>eridian
            </span>
          </div>
          {/* Info contestuale per tab */}
          <div style={{fontSize:11,color:Z.t3,fontWeight:500,
            letterSpacing:"0.06em",fontFamily:"'JetBrains Mono',monospace",
            textAlign:"right"}}>
            {screen==="home"&&(
              <span>{new Date().toLocaleDateString("it-IT",{weekday:"short",day:"numeric",month:"short"})}</span>
            )}
            {screen==="abitudini"&&(
              <span style={{color:tpct===100?"#00e5a0":SILVER}}>{tdone}/{todayH.length} oggi</span>
            )}
            {screen==="obiettivi"&&(()=>{
              const avg=data.goals?.length?Math.round(data.goals.reduce((s,g)=>s+(g.pct||0),0)/data.goals.length):0;
              return <span style={{color:avg>=70?"#00e5a0":avg>=40?"#facc15":Z.t3}}>{avg}% medio</span>;
            })()}
            {screen==="visione"&&(()=>{
              const avg=VITA_AREE.reduce((s,a)=>{
                const vals=a.cat.map(cat=>data.vita?.[cat.id]||0);
                return s+vals.reduce((x,v)=>x+v,0)/vals.length;
              },0)/VITA_AREE.length;
              return <span style={{color:SILVER}}>{Math.round(avg*10)/10}/10</span>;
            })()}
            {screen==="analisi"&&<span>Lucius</span>}
            {screen==="task"&&(()=>{
              const n=(data.tasks||[]).filter(t=>!t.done).length;
              return <span style={{color:n>0?SILVER:Z.t3}}>{n} {n===1?"aperto":"aperti"}</span>;
            })()}
          </div>
        </div>
        {/* Barra sintesi â€” Abitudini Â· Task Â· Obiettivi */}
        <div style={{padding:"8px 18px 0"}}>{(()=>{
          const pendingT=(data.tasks||[]).filter(t=>!t.done).length;
          const avgGoal=data.goals?.length?Math.round(data.goals.reduce((s,g)=>s+(g.pct||0),0)/data.goals.length):0;
          return(
            <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:8}}>
              {/* Abitudini */}
              <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,height:2,background:Z.b,borderRadius:1,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${tpct}%`,
                    background:tpct===100?"#00e5a0":SILVER,
                    transition:"width 0.7s cubic-bezier(.4,0,.2,1)",borderRadius:1}}/>
                </div>
                <span style={{fontSize:9,color:tpct===100?"#00e5a0":Z.t3,
                  fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>
                  {tdone}/{todayH.length}
                </span>
              </div>
              <div style={{width:1,height:12,background:Z.b,margin:"0 8px",flexShrink:0}}/>
              {/* Task */}
              <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                <span style={{fontSize:9,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>Task</span>
                <span style={{fontSize:9,fontWeight:600,
                  color:pendingT>0?SILVER:Z.t3,
                  fontFamily:"'JetBrains Mono',monospace"}}>{pendingT}</span>
              </div>
              <div style={{width:1,height:12,background:Z.b,margin:"0 8px",flexShrink:0}}/>
              {/* Obiettivi */}
              <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                <span style={{fontSize:9,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>Goal</span>
                <span style={{fontSize:9,fontWeight:600,color:SILVER,
                  fontFamily:"'JetBrains Mono',monospace"}}>{avgGoal}%</span>
              </div>
            </div>
          );
        })()}</div>
      </div>

      {/* CONTENT */}
      <div key={screen} className="fadeup" style={{flex:1,overflowY:"auto",overflowX:"hidden",zIndex:1,
        padding:"18px 15px 0",WebkitOverflowScrolling:"touch",animation:"fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both"}}>
        {screen==="abitudini"&&<Abitudini data={data} tr={tr} logs={logs} onDel={delHabit} onToggle={toggle}
          onEdit={h=>setEditH(h)} onLog={h=>h.logType==="sveglia"?setWakeH(h):null} onAdd={addHabit}/>}
        {screen==="task"     &&<TaskScreen data={data} setData={setData} onAdd={()=>setAddingTask(true)} showToast={showToast}/>}
        {screen==="obiettivi"&&<Obiettivi data={data} setData={setData} showToast={showToast}/>}
        {screen==="visione"  &&<Vita data={data} setData={setData}/>}
        {screen==="analisi"  &&<Lucius data={data} tr={tr}/>}
        {screen==="home"     &&<Home data={data} tr={tr} logs={logs} showToast={showToast} onToggle={toggle}
          onEditHabit={h=>setEditH(h)} onLog={h=>h.logType==="sveglia"?setWakeH(h):null}
          setScreen={setScreen} setData={setData} onAddTask={()=>setAddingTask(true)}/>}
        <div style={{height:92}}/>
      </div>

      {/* BOTTOM NAV */}
      <div style={{flexShrink:0,zIndex:20,
        background:"rgba(10,10,10,0.96)",
        backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
        borderTop:`1px solid ${Z.b}`,
        paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{display:"flex"}}>
          {NAV.map(n=>{
            const a=screen===n.id;
            return(
              <button key={n.id} onClick={()=>setScreen(n.id)}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  padding:"8px 4px 6px",color:a?SILVER_BRIGHT:Z.t3,transition:"color 0.2s"}}>
                <div style={{width:44,height:28,borderRadius:13,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:a?"rgba(210,210,220,0.1)":"transparent",
                  transition:"background 0.2s"}}>
                  {ICONS[n.id]?.(a)}
                </div>
                <span style={{fontSize:9,fontWeight:a?600:400,letterSpacing:"0.01em",lineHeight:1}}>
                  {n.l}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}