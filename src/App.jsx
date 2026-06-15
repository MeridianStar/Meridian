import React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const CSS=`
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{background:#0a0a0a;color:#f0f0f0;font-family:Inter,sans-serif;overscroll-behavior:none;}
  button{background:none;border:none;cursor:pointer;font-family:inherit;}
  input,textarea{font-family:inherit;}
  ::-webkit-scrollbar{display:none;}
  .up{padding:0;}
  .d1{animation:fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both 0.05s;}
  .d2{animation:fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both 0.1s;}
  .in{animation:fadein 0.18s ease both;}
  @keyframes fadeup{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadein{from{opacity:0;}to{opacity:1;}}
  @keyframes ripple{0%{transform:scale(1);opacity:0.4;}100%{transform:scale(2.2);opacity:0;}}
  @keyframes checkpop{0%{transform:scale(0.5);}70%{transform:scale(1.15);}100%{transform:scale(1);}}
  @keyframes streakpulse{0%,100%{opacity:1;}50%{opacity:0.6;}}
  @keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:4px;background:transparent;outline:none;border:none;cursor:pointer;}
  input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:#222;}
  @keyframes popCheck{
    0%{opacity:0;transform:scale(0.3) translateY(4px);}
    40%{opacity:1;transform:scale(1.1) translateY(0);}
    70%{opacity:1;transform:scale(1) translateY(0);}
    100%{opacity:0;transform:scale(0.9) translateY(-6px);}
  }
  @keyframes rippleGreen{
    0%{transform:scale(0);opacity:0.5;}
    100%{transform:scale(3);opacity:0;}
  }
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:50%;background:var(--c,#c8c8d4);cursor:pointer;border:2px solid #0a0a0a;}
`;

// ================================================================
//  MERIDIAN  —  Final Release
// ================================================================

//  TOKENS 
const Z={
  bg:"#0a0a0a",s1:"#111111",s2:"#1a1a1a",s3:"#222222",
  b:"#2a2a2a",b2:"#333333",
  t:"#f0f0f0",t2:"#999999",t3:"#888888",
};
const SILVER="rgba(210,210,220,0.55)";
const SILVER_BRIGHT="rgba(230,230,240,0.85)";
const ERR_LIGHT="#fca5a5"; // rosso chiaro per task urgenti

// Tab accent — argento uniforme, elegante

// Colori area — ben distinti
const AREA_C={
  salute:"#00e5a0",   // verde acqua
  lavoro:"#ff7b54",   // arancio caldo
  relazioni:"#c084fc",// viola
  gioia:"#38bdf8",    // azzurro
};

const STATUS={
  red:   {l:"Critico", c:"#c94040"},
  orange:{l:"Scarso",  c:"#c46828"},
  yellow:{l:"Buono",   c:"#b09018"},
  green: {l:"Ottimo",  c:"#2ea34e"},
};

// Vita aree — colori più distinti
const uid=()=>Math.random().toString(36).slice(2,9);

const INIT={
  aree:[
    {id:"salute",icon:"⚡",  nome:"Energia",  color:"#00e5a0", cat:[
      {id:"mente",icon:"🧠",  nome:"Mente",       h:[
        {id:"h1",nome:"Sveglia alle 06:00",        icon:"⏰",s:"green",note:"",freq:{type:"daily"},      logType:"sveglia",  milestones:[]},
        {id:"h2",nome:"Meditazione",    icon:"🧘",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
        {id:"h4",nome:"Sonno",          icon:"🌙",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
        {id:"h3",nome:"Detox digitale", icon:"📵",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
      ]},
      {id:"fisico",icon:"💪", nome:"Fisico",       h:[
        {id:"h5",nome:"Esercizio",      icon:"🏋️",s:"green",note:"",freq:{type:"weekly",n:3}, logType:"workout",  milestones:[],esercizi:[]},
        {id:"h6",nome:"Nuoto",          icon:"🏊",s:"green",note:"",freq:{type:"weekly",n:3}, logType:"nuoto",    milestones:[]},
        {id:"h7",nome:"Camminata",      icon:"🚶",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
        {id:"h8",nome:"Stretching",     icon:"🤸",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
      ]},
      {id:"vita2",icon:"🌿",  nome:"Longevità",    h:[
        {id:"h9", nome:"Igiene",         icon:"🪥",s:"green",note:"",freq:{type:"none"},      logType:"igiene",   milestones:[],aspetti:[{id:"a1",nome:"Denti",ok:false},{id:"a2",nome:"Pelle",ok:false},{id:"a3",nome:"Capelli",ok:false},{id:"a4",nome:"Postura",ok:false},{id:"a5",nome:"Unghie",ok:false}]},
        {id:"h10",nome:"Nutrizione",     icon:"🥗",s:"green",note:"",freq:{type:"daily"},     logType:"nessuno",  milestones:[]},
        {id:"h11",nome:"Idratazione",    icon:"💧",s:"green",note:"",freq:{type:"none"},      logType:"nessuno",  milestones:[]},
        {id:"h12",nome:"Visite mediche", icon:"🩺",s:"green",note:"",freq:{type:"none"},      logType:"visite",   milestones:[],visite:[]},
        {id:"h13",nome:"Luce del Sole",  icon:"☀️",s:"green",note:"",freq:{type:"none"},      logType:"nessuno",  milestones:[]},
      ]},
    ]},
    {id:"lavoro",icon:"🔥",   nome:"Ingegno",   color:"#ff7b54", cat:[
      {id:"ricch",icon:"💰",  nome:"Ricchezza",   h:[
        {id:"h20",nome:"Asset",icon:"💰",s:"green",note:"",freq:{type:"none"},logType:"asset",milestones:[],patrimoniStorico:[
        {id:"2025-01-01",label:"01/01/25",data:"2025-01-01",cripto:14353.46,relending:1268.24,societa:5600.0,azioni:23178.0,pensione:17401.05,deposito:10364.93,liquidita:280.7,backup:0.0,totale:72446.38},
        {id:"2025-02-01",label:"01/02/25",data:"2025-02-01",cripto:11414.75,relending:1268.24,societa:5600.0,azioni:25158.0,pensione:21770.9,deposito:11839.59,liquidita:401.29,backup:0.0,totale:77452.77},
        {id:"2025-03-01",label:"01/03/25",data:"2025-03-01",cripto:7217.43,relending:1268.24,societa:5600.0,azioni:28368.0,pensione:21973.95,deposito:13172.93,liquidita:403.7,backup:0.0,totale:78004.25},
        {id:"2025-04-01",label:"01/04/25",data:"2025-04-01",cripto:5235.68,relending:1268.24,societa:5600.0,azioni:28932.0,pensione:22106.13,deposito:15013.8,liquidita:150.51,backup:0.0,totale:78306.36},
        {id:"2025-05-01",label:"01/05/25",data:"2025-05-01",cripto:7026.47,relending:1268.24,societa:5600.0,azioni:28590.0,pensione:23041.31,deposito:15845.1,liquidita:124.44,backup:0.0,totale:81495.56},
        {id:"2025-06-01",label:"01/06/25",data:"2025-06-01",cripto:9402.09,relending:1268.24,societa:5600.0,azioni:29001.0,pensione:23059.76,deposito:17000.0,liquidita:726.45,backup:102.42,totale:86159.96},
        {id:"2025-07-01",label:"01/07/25",data:"2025-07-01",cripto:6788.04,relending:1268.24,societa:5600.0,azioni:29079.0,pensione:23333.73,deposito:20003.25,liquidita:626.66,backup:153.96,totale:86852.88},
        {id:"2025-08-01",label:"01/08/25",data:"2025-08-01",cripto:7396.76,relending:1268.24,societa:5600.0,azioni:32106.0,pensione:24448.86,deposito:23027.93,liquidita:62.24,backup:85.02,totale:93995.05},
        {id:"2025-09-01",label:"01/09/25",data:"2025-09-01",cripto:6450.02,relending:1268.24,societa:5600.0,azioni:32250.0,pensione:24539.82,deposito:36504.44,liquidita:244.39,backup:85.02,totale:106941.93},
        {id:"2025-10-01",label:"01/10/25",data:"2025-10-01",cripto:5851.81,relending:1268.24,societa:5600.0,azioni:33984.0,pensione:24607.6,deposito:46562.48,liquidita:764.2,backup:85.02,totale:118723.35},
        {id:"2025-11-01",label:"01/11/25",data:"2025-11-01",cripto:2717.12,relending:1268.24,societa:5600.0,azioni:33660.0,pensione:25672.05,deposito:58014.06,liquidita:243.33,backup:76.72,totale:127251.52},
        {id:"2025-12-01",label:"01/12/25",data:"2025-12-01",cripto:2409.68,relending:758.0,societa:5600.0,azioni:33690.0,pensione:25876.5,deposito:59364.26,liquidita:47.42,backup:260.85,totale:128006.71},
        {id:"2026-01-01",label:"01/01/26",data:"2026-01-01",cripto:2373.64,relending:758.0,societa:5600.0,azioni:35736.0,pensione:25909.25,deposito:68895.59,liquidita:67.88,backup:484.74,totale:139825.1},
        {id:"2026-02-01",label:"01/02/26",data:"2026-02-01",cripto:2098.62,relending:758.0,societa:5600.0,azioni:35936.0,pensione:27189.81,deposito:9034.81,liquidita:257.6,backup:585.84,totale:81460.68},
        {id:"2026-03-01",label:"01/03/26",data:"2026-03-01",cripto:1524.9,relending:758.0,societa:5600.0,azioni:35010.0,pensione:27256.47,deposito:8503.56,liquidita:556.85,backup:952.68,totale:80162.46},
        {id:"2026-04-01",label:"01/04/26",data:"2026-04-01",cripto:2483.28,relending:758.0,societa:5600.0,azioni:30708.0,pensione:27657.03,deposito:8966.3,liquidita:145.95,backup:1167.32,totale:77485.88},
        {id:"2026-05-01",label:"01/05/26",data:"2026-05-01",cripto:2116.69,relending:758.0,societa:5600.0,azioni:34650.0,pensione:27813.29,deposito:7757.67,liquidita:33.58,backup:655.47,totale:79384.7},
        {id:"2026-06-01",label:"01/06/26",data:"2026-06-01",cripto:2851.15,relending:758.0,societa:5600.0,azioni:34842.0,pensione:27813.29,deposito:8759.35,liquidita:59.35,backup:1387.27,totale:82070.41}
      ]},
        {id:"h21",nome:"Spese",icon:"📊",s:"green",note:"",freq:{type:"none"},logType:"spese",milestones:[],spese:[]},
        {id:"h22",nome:"Risparmi",icon:"🏦",s:"green",note:"",freq:{type:"none"},logType:"risparmi",milestones:[]},
        {id:"h23",nome:"Protezione",icon:"🛡️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"carr",icon:"🚀",   nome:"Carriera",    h:[
        {id:"h14",nome:"Deep Work",     icon:"🎯",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
        {id:"h24",nome:"Snam",          icon:"⚡",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h60",nome:"Flutter",       icon:"💙",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h25",nome:"Persone",         icon:"👥",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h26",nome:"Competenze",      icon:"🧠",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h27",nome:"Opportunità",     icon:"🚀",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h28",nome:"Sponsor ⭐",         icon:"",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"proj",icon:"⚙️",   nome:"Progetti",    h:[
        {id:"h29",nome:"Applicazioni",icon:"💻",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h30",nome:"Scrittore",icon:"✍️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h31",nome:"Game Designer",icon:"🎮",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h32",nome:"Life Coach",icon:"🌱",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
    ]},
    {id:"relazioni",icon:"🌱",nome:"Legami",    color:"#c084fc", cat:[
      {id:"amore",icon:"❤️",  nome:"Amore",       h:[
        {id:"h33",nome:"Condivisione",icon:"💬",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h34",nome:"Crescita di coppia",icon:"🌿",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h35",nome:"Intimità",icon:"💞",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h36",nome:"Maturità",icon:"🧭",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h37",nome:"Futuro insieme",icon:"🏡",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h38",nome:"Sostegno",icon:"🤝",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"fam",icon:"🏠",    nome:"Famiglia",    h:[
        {id:"h39",nome:"Mamma",icon:"👩",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h40",nome:"Papà",icon:"👨",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h41",nome:"Nonna",icon:"👵",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"amici",icon:"✨",  nome:"Amici",       h:[
        {id:"h42",nome:"15 Uomini",icon:"🕺",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h43",nome:"Dennis",icon:"🎵",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h44",nome:"Barra e Grosso",icon:"🍺",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h45",nome:"Colleghi",icon:"💼",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
    ]},
    {id:"gioia",icon:"🌊",    nome:"Armonia",   color:"#38bdf8", cat:[
      {id:"amb",icon:"🌍",    nome:"Ambiente",    h:[
        {id:"h46",nome:"Casa",icon:"🏠",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h47",nome:"Natura",icon:"🌲",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h48",nome:"Ordine",icon:"✨",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"pass",icon:"🎭",   nome:"Passioni",    h:[
        {id:"h49",nome:"Viaggi",icon:"✈️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h50",nome:"Concerti",icon:"🎶",s:"green",note:"",freq:{type:"none"},logType:"concerti",milestones:[],eventi:[]},
        {id:"h51",nome:"Lettura",icon:"📚",s:"green",note:"",freq:{type:"daily"},logType:"nessuno",milestones:[]},
        {id:"h52",nome:"Scacchi",icon:"♟️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h53",nome:"Gaming",icon:"🎮",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h54",nome:"Cinema",icon:"🎬",s:"green",note:"",freq:{type:"none"},logType:"cinema",milestones:[],eventi:[]},
      ]},
      {id:"svil",icon:"📖",   nome:"Crescita",   h:[
        {id:"h56",nome:"Manualità",icon:"🔧",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h57",nome:"Tastiera",icon:"🎹",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h58",nome:"Crescita personale",icon:"📖",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h59",nome:"Automobile",icon:"🚗",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
    ]},
  ],
  tasks:[
    {id:"t1", text:'Dichiarazione dei redditi',              done:false,s:"yellow",deadline:null,aId:null},
    {id:"t2", text:'Checkpoint matrimonio',                  done:false,s:"yellow",deadline:null,aId:null},
    {id:"t3", text:'Piano Parigi',                           done:false,s:"yellow",deadline:null,aId:null},
    {id:"t4", text:'Piano alimentare',                       done:false,s:"yellow",deadline:null,aId:null},
    {id:"t5", text:'Pulire condizionatore',                  done:false,s:"yellow",deadline:null,aId:null},
    {id:"t6", text:'Sistemare lampadine',                    done:false,s:"yellow",deadline:null,aId:null},
    {id:"t7", text:'Chiamare AMSA',                         done:false,s:"yellow",deadline:null,aId:null},
    {id:"t8", text:'Piantare Bonsai',                        done:false,s:"yellow",deadline:null,aId:null},
    {id:"t9", text:'Attivare visite',                        done:false,s:"yellow",deadline:null,aId:null},
    {id:"t10",text:'Email Troilo',                           done:false,s:"yellow",deadline:null,aId:null},
    {id:"t11",text:'Albero genealogico',                     done:false,s:"yellow",deadline:null,aId:null},
    {id:"t12",text:'Intestazione Tari',                      done:false,s:"yellow",deadline:null,aId:null},
    {id:"t13",text:'Ricordi 2025',                           done:false,s:"yellow",deadline:null,aId:null},
    {id:"t14",text:'Comprare orologio',                      done:false,s:"yellow",deadline:null,aId:null},
    {id:"t15",text:'Comprare porta Cerv + AYCE polpette',   done:false,s:"yellow",deadline:null,aId:null},
    {id:"t16",text:'Filtro reverse osmosi',                  done:false,s:"yellow",deadline:null,aId:null},
    {id:"t17",text:'Sicurezza Verisure',                     done:false,s:"yellow",deadline:null,aId:null},
  ],
  goals:[],
  vita:{
    mente:5,fisico:5,vita2:5,
    ricch:5,carr:5,proj:5,
    amore:5,fam:5,amici:5,
    amb:5,pass:5,svil:5
  },
  snapshots:[],
};


const NAV=[
  {id:"home",      l:"Home"},
  {id:"abitudini", l:"Abitudini"},
  {id:"task",      l:"Task"},
  {id:"obiettivi", l:"Obiettivi"},
  {id:"visione",   l:"Visione"},
  {id:"analisi",   l:"Analisi"},
];

const ICONS={
  home:    (a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('path',{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),React.createElement('polyline',{points:"9 22 9 12 15 12 15 22"})),
  abitudini:(a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('path',{d:"M9 11l3 3L22 4"}),React.createElement('path',{d:"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"})),
  task:    (a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('rect',{x:"3",y:"3",width:"7",height:"7"}),React.createElement('rect',{x:"14",y:"3",width:"7",height:"7"}),React.createElement('rect',{x:"14",y:"14",width:"7",height:"7"}),React.createElement('rect',{x:"3",y:"14",width:"7",height:"7"})),
  obiettivi:(a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('circle',{cx:"12",cy:"12",r:"10"}),React.createElement('circle',{cx:"12",cy:"12",r:"6"}),React.createElement('circle',{cx:"12",cy:"12",r:"2"})),
  visione: (a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('polygon',{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})),
  analisi: (a)=>React.createElement('svg',{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:a?"rgba(210,210,220,0.9)":"rgba(150,150,160,0.7)",strokeWidth:2,strokeLinecap:"round"},React.createElement('path',{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})),
};

const VITA_AREE=[
  {id:"salute",   nome:"Energia",  color:"#00e5a0", icon:"⚡", cat:[
    {id:"v-mente", nome:"Mente",     icon:"🧠", desc:"Chiarezza, concentrazione, stress"},
    {id:"v-fisico",nome:"Fisico",    icon:"💪", desc:"Energia, forma, allenamento, sonno"},
    {id:"v-vita",  nome:"Benessere", icon:"🌿", desc:"Alimentazione, prevenzione"},
  ]},
  {id:"lavoro",   nome:"Ingegno",  color:"#ff7b54", icon:"🔥", cat:[
    {id:"v-ricch", nome:"Ricchezza",    icon:"💰", desc:"Reddito, risparmi, sicurezza"},
    {id:"v-carr",  nome:"Carriera",     icon:"🚀", desc:"Crescita, ruolo, riconoscimento"},
    {id:"v-proj",  nome:"Progetti",     icon:"⚙️", desc:"Realizzazioni, impatto"},
  ]},
  {id:"relazioni",nome:"Legami",   color:"#c084fc", icon:"🌱", cat:[
    {id:"v-amore", nome:"Amore",        icon:"❤️", desc:"Coppia, intimità, cura"},
    {id:"v-fam",   nome:"Famiglia",     icon:"🏠", desc:"Genitori, fratelli, radici"},
    {id:"v-amici", nome:"Amici",        icon:"✨", desc:"Amicizie, rete sociale"},
  ]},
  {id:"gioia",    nome:"Armonia",  color:"#38bdf8", icon:"🌊", cat:[
    {id:"v-amb",   nome:"Ambiente",     icon:"🌍", desc:"Casa, natura, ordine"},
    {id:"v-pass",  nome:"Passioni",     icon:"🎭", desc:"Hobby, crescita, creatività"},
    {id:"v-svil",  nome:"Crescita",     icon:"📖", desc:"Apprendimento, spiritualità"},
  ]},
];


//  UTILS 
const pad=n=>String(n).padStart(2,"0");
function tod(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function ago(n){const d=new Date();d.setDate(d.getDate()-n);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function d7(){return Array.from({length:7},(_,i)=>ago(6-i));}
const d30=()=>Array.from({length:30},(_,i)=>ago(29-i));
const d84=()=>Array.from({length:84},(_,i)=>ago(83-i));
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
  if(diff<0) return{txt:fmtDate(s),c:"#f87171",u:true};
  if(diff===0)return{txt:"Oggi",c:"#facc15",u:false};
  return{txt:fmtDate(s),c:Z.t3,u:false};
}
function greet(){const h=new Date().getHours();return h<5?"Buonanotte":h<12?"Buongiorno":h<17?"Buon pomeriggio":h<21?"Buonasera":"Buonanotte";}
function flatH(aree){const r=[];(aree||[]).forEach(a=>(a.cat||[]).forEach(c=>(c.h||[]).forEach(h=>r.push({...h,aId:a.id,aN:a.nome,cId:c.id,cN:c.nome,color:a.color}))));return r;}

function isExpected(h,dateStr){
  const freq=h.freq||{type:"daily"};
  if(freq.type==="none")return false;
  if(freq.type==="daily")return true;
  const dow=new Date(dateStr+"T00:00:00").getDay();
  if(freq.type==="days")return(freq.d||[]).includes(dow);
  if(freq.type==="weekly"){
    // Per weekly (es. 3x/settimana) consideriamo attesa ogni giorno
    // ma la logica di pct li ignora se non completate
    // Questo è il comportamento voluto: mostrate sempre, completate quante ne serve
    return true;
  }
  return true;
}
function strkF(h,tr){
  const freq=h.freq||{type:"daily"};
  let n=0,d=new Date();
  const ts=tod();
  if(!(tr[h.id]||{})[ts])d.setDate(d.getDate()-1);
  let safe=0;
  while(safe++<400){
    const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const exp=isExpected(h,k),done=!!((tr[h.id]||{})[k]);
    if(exp&&!done)break;
    if(exp&&done)n++;
    d.setDate(d.getDate()-1);
  }
  return n;
}
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

//  BOTTOM SHEET 
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
        {/* Handle — draggabile */}
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

//  WAKE LOG 
function WakeLog({h,logs,onLog,onClose}){
  const ts=tod();
  const ex=((logs[h.id]||{})[ts]||{}).wakeTime||"06:00";
  const [time,setTime]=useState(ex);
  const col=AREA_C[h.aId]||SILVER;
  const hist=d7().map(d=>({d,t:((logs[h.id]||{})[d]||{}).wakeTime})).filter(x=>x.t);
  return(
    <Sheet onClose={onClose} title={`Sveglia — ${h.nome}`} accent={col}>
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
        <button onClick={()=>{onLog(h.id,{wakeTime:time||""});onClose();}}
          style={{flex:2,padding:13,background:col,border:"none",
            borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>
          Salva
        </button>
      </div>
    </Sheet>
  );
}

//  EDIT HABIT SHEET 
//  LOG DETAIL COMPONENTS 

function LogAsset({h,logs,onSaveLog,data}){
  const ts=tod();
  const today=((logs||{})[h.id]||{});
  const patrimoniStorico=(()=>{
    const found=(data&&data.aree||[]).flatMap(a=>a.cat||[])
      .flatMap(cat=>cat.h||[]).find(x=>x.id===h.id);
    return (found&&found.patrimoniStorico||[]);
  })();
  const [showStorico,setShowStorico]=useState(false);
  const CATS=[
    {k:"cripto",   l:"Criptovalute",  icon:"₿"},
    {k:"relending",l:"RE Lending",     icon:"🏘️"},
    {k:"societa",  l:"Società",        icon:"🏢"},
    {k:"azioni",   l:"Azioni",         icon:"📈"},
    {k:"pensione", l:"Pensione",       icon:"🔒"},
    {k:"deposito", l:"Deposito",       icon:"🏦"},
    {k:"liquidita",l:"Liquidità",      icon:"💵"},
    {k:"backup",   l:"Backup",         icon:"🛡️"},
  ];
  const save=(k,val)=>onSaveLog(h.id,{...today,[k]:val});
  const tot=CATS.reduce((s,cat)=>s+(parseFloat((today[cat.k]||"").replace(",","."))||0),0);
  const fmt=n=>n.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})+"€";

  return(
    <div>
      {CATS.map(cat=>(
        <div key={cat.k} style={{display:"flex",alignItems:"center",
          gap:10,marginBottom:8}}>
          <span style={{fontSize:14,flexShrink:0,width:24,textAlign:"center"}}>{cat.icon}</span>
          <span style={{fontSize:13,color:Z.t2,flex:1,minWidth:0,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat.l}</span>
          <div style={{position:"relative",flexShrink:0}}>
            <input type="number" min={0} step={0.01}
              value={today[cat.k]||""}
              onChange={e=>save(cat.k,e.target.value)}
              placeholder="0,00"
              style={{width:110,background:Z.s2,border:`1px solid ${Z.b}`,
                borderRadius:8,padding:"7px 28px 7px 8px",
                color:Z.t,fontSize:13,textAlign:"right",outline:"none"}}/>
            <span style={{position:"absolute",right:8,top:"50%",
              transform:"translateY(-50%)",fontSize:11,color:Z.t3,
              pointerEvents:"none"}}>€</span>
          </div>
        </div>
      ))}
      {tot>0&&(
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginTop:12,paddingTop:10,
          borderTop:`1px solid ${Z.b}`}}>
          <span style={{fontSize:12,color:Z.t3,fontWeight:600,
            textTransform:"uppercase",letterSpacing:"0.08em"}}>Totale</span>
          <span style={{fontSize:18,fontWeight:900,color:"#00e5a0",
            fontFamily:"'JetBrains Mono',monospace"}}>{fmt(tot)}</span>
        </div>
      )}

      {/* Storico mensile */}
      {patrimoniStorico.length>0&&(
        <div style={{marginTop:16}}>
          <button onClick={()=>setShowStorico(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:6,
              fontSize:11,color:Z.t3,marginBottom:8,padding:0,background:"transparent",border:"none"}}>
            <span style={{display:"inline-block",transform:showStorico?"rotate(90deg)":"none",transition:"transform 0.2s"}}>›</span>
            Storico · {patrimoniStorico.length} mesi
          </button>
          {showStorico&&(
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:4}}>
              <div style={{display:"flex",gap:6,minWidth:"max-content"}}>
                {[...patrimoniStorico].reverse().map((m,i)=>(
                  <div key={m.id} style={{width:128,background:Z.s2,borderRadius:10,
                    padding:"10px",border:`1px solid ${i===0?"rgba(0,229,160,0.4)":Z.b}`,flexShrink:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:Z.t3,marginBottom:6,
                      fontFamily:"'JetBrains Mono',monospace"}}>{m.label}</div>
                    {[["cripto","Cripto","#f59e0b"],["relending","RE Lend","#a78bfa"],
                      ["societa","Società","#60a5fa"],["azioni","Azioni","#34d399"],
                      ["pensione","Pensione","#f87171"],["deposito","Deposito","#38bdf8"],
                      ["liquidita","Liquidità","#fb923c"],["backup","Backup","#94a3b8"],
                    ].map(([k,l,col])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:9,color:Z.t3}}>{l}</span>
                        <span style={{fontSize:9,fontWeight:600,color:col,
                          fontFamily:"'JetBrains Mono',monospace"}}>
                          {(m[k]||0).toLocaleString("it-IT",{maximumFractionDigits:0})}€
                        </span>
                      </div>
                    ))}
                    <div style={{marginTop:6,paddingTop:5,borderTop:"1px solid rgba(255,255,255,0.08)",
                      display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:9,color:Z.t3,fontWeight:700}}>TOT</span>
                      <span style={{fontSize:10,fontWeight:900,color:"#00e5a0",
                        fontFamily:"'JetBrains Mono',monospace"}}>
                        {(m.totale||0).toLocaleString("it-IT",{maximumFractionDigits:0})}€
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LogSpese({h,data,setData}){
  const FREQ=[
    {k:"una_tantum", l:"Una tantum"},
    {k:"settimanale",l:"Settimanale"},
    {k:"mensile",    l:"Mensile"},
    {k:"trimestrale",l:"Trimestrale"},
    {k:"annuale",    l:"Annuale"},
  ];
  const spese=(()=>{
    const found=(data.aree||[]).flatMap(a=>a.cat||[])
      .flatMap(cat=>cat.h||[]).find(x=>x.id===h.id);
    return (found&&found.spese||[]);
  })();
  const saveSpese=newSpese=>setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
    cat:(a.cat||[]).map(cat=>({...cat,
      h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,spese:newSpese}:hh)
    }))
  }))}));

  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({causale:"",importo:"",freq:"mensile"});
  const [editId,setEditId]=useState(null);

  const resetForm=()=>{setForm({causale:"",importo:"",freq:"mensile"});setEditId(null);setShowForm(false);};
  const salva=()=>{
    if(!form.causale.trim()||!form.importo)return;
    const entry={id:editId||uid(),causale:form.causale.trim(),
      importo:parseFloat(form.importo),freq:form.freq};
    const updated=editId?spese.map(s=>s.id===editId?entry:s):[...spese,entry];
    saveSpese(updated);
    resetForm();
  };
  const del=id=>saveSpese(spese.filter(s=>s.id!==id));

  const freqColor={una_tantum:"#94a3b8",settimanale:"#38bdf8",
    mensile:"#00e5a0",trimestrale:"#facc15",annuale:"#c084fc"};
  const totMens=spese.reduce((s,x)=>{
    const v=x.importo||0;
    if(x.freq==="una_tantum")return s;
    if(x.freq==="settimanale")return s+v*4.33;
    if(x.freq==="mensile")return s+v;
    if(x.freq==="trimestrale")return s+v/3;
    if(x.freq==="annuale")return s+v/12;
    return s;
  },0);
  const fmt=n=>n.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})+"€";

  return(
    <div>
      {/* Lista spese */}
      {spese.map(s=>(
        <div key={s.id} style={{display:"flex",alignItems:"center",
          gap:8,marginBottom:6,padding:"9px 12px",
          background:Z.s2,borderRadius:10,border:`1px solid ${Z.b}`}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,color:Z.t,fontWeight:500,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {s.causale}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <span style={{fontSize:10,fontWeight:700,
                color:freqColor[s.freq]||Z.t3,
                padding:"1px 5px",borderRadius:4,
                background:(freqColor[s.freq]||Z.t3)+"18"}}>
                {(FREQ.find(f=>f.k===s.freq)||{}).l||s.freq}
              </span>
              <span style={{fontSize:13,fontWeight:700,
                color:"#f87171",fontFamily:"'JetBrains Mono',monospace"}}>
                -{fmt(s.importo)}
              </span>
            </div>
          </div>
          <button onClick={()=>{setForm({causale:s.causale,
            importo:String(s.importo),freq:s.freq});
            setEditId(s.id);setShowForm(true);}}
            style={{color:Z.t3,fontSize:11,padding:"3px 7px",
              background:"rgba(255,255,255,0.05)",
              borderRadius:6,border:`1px solid ${Z.b}`}}>✎</button>
          <button onClick={()=>del(s.id)}
            style={{color:"#f87171",fontSize:16,padding:"0 4px",
              opacity:0.5,lineHeight:1}}>×</button>
        </div>
      ))}

      {/* Totale mensile */}
      {spese.length>0&&(
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",padding:"8px 0",
          borderTop:`1px solid ${Z.b}`,marginBottom:10}}>
          <span style={{fontSize:11,color:Z.t3,fontWeight:600,
            textTransform:"uppercase",letterSpacing:"0.07em"}}>
            Totale mensile stimato
          </span>
          <span style={{fontSize:15,fontWeight:900,color:"#f87171",
            fontFamily:"'JetBrains Mono',monospace"}}>
            -{fmt(totMens)}
          </span>
        </div>
      )}

      {/* Form aggiungi / modifica */}
      {showForm?(
        <div style={{background:Z.s2,borderRadius:12,
          padding:"12px",border:`1px solid ${Z.b}`}}>
          <input value={form.causale}
            onChange={e=>setForm(f=>({...f,causale:e.target.value}))}
            placeholder="Causale (es. Affitto, Netflix...)"
            style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,
              borderRadius:8,padding:"8px 12px",color:Z.t,fontSize:13,
              outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{position:"relative",flex:1}}>
              <input type="number" min={0} step={0.01}
                value={form.importo}
                onChange={e=>setForm(f=>({...f,importo:e.target.value}))}
                placeholder="0,00"
                style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,
                  borderRadius:8,padding:"8px 28px 8px 8px",
                  color:Z.t,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              <span style={{position:"absolute",right:8,top:"50%",
                transform:"translateY(-50%)",fontSize:11,color:Z.t3}}>€</span>
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            {FREQ.map(f=>(
              <button key={f.k} onClick={()=>setForm(fm=>({...fm,freq:f.k}))}
                style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,
                  background:form.freq===f.k?freqColor[f.k]+"22":"rgba(255,255,255,0.04)",
                  border:`1.5px solid ${form.freq===f.k?freqColor[f.k]:"rgba(255,255,255,0.08)"}`,
                  color:form.freq===f.k?freqColor[f.k]:Z.t3}}>
                {f.l}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={salva}
              style={{flex:1,padding:"9px",background:"#00e5a0",
                borderRadius:10,color:"#0a0a0a",fontSize:13,fontWeight:700}}>
              {editId?"Aggiorna":"Aggiungi"}
            </button>
            <button onClick={resetForm}
              style={{padding:"9px 14px",background:Z.s1,
                borderRadius:10,color:Z.t3,fontSize:13}}>✕</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowForm(true)}
          style={{display:"flex",alignItems:"center",gap:6,
            padding:"9px 14px",background:"rgba(0,229,160,0.07)",
            border:"1px solid rgba(0,229,160,0.2)",borderRadius:10,
            color:"#00e5a0",fontSize:13,fontWeight:600}}>
          <span style={{fontSize:16}}>+</span> Aggiungi spesa
        </button>
      )}
    </div>
  );
}

function LogRisparmi({h,data,setData}){
  // Legge i parametri salvati dall'abitudine stessa
  const found=(data.aree||[]).flatMap(a=>a.cat||[]).flatMap(cat=>cat.h||[]).find(x=>x.id===h.id);
  const cfg=(found&&found.rispCfg||{stipendio:"",spese:"",investimenti:""});
  const storico=(found&&found.rispStorico||[]);

  const saveCfg=newCfg=>setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
    cat:(a.cat||[]).map(cat=>({...cat,
      h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,rispCfg:newCfg}:hh)
    }))
  }))}));
  const saveStorico=ns=>setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
    cat:(a.cat||[]).map(cat=>({...cat,
      h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,rispStorico:ns}:hh)
    }))
  }))}));

  const [localCfg,setLocalCfg]=useState(cfg);
  const [showCfg,setShowCfg]=useState(storico.length===0);

  const s=parseFloat((localCfg.stipendio||"").replace(",","."))||0;
  const sp=parseFloat((localCfg.spese||"").replace(",","."))||0;
  const inv=parseFloat((localCfg.investimenti||"").replace(",","."))||0;
  const risparmio=s-sp-inv;
  const pctRisp=s>0?Math.round(risparmio/s*100):0;
  const pctInv=s>0?Math.round(inv/s*100):0;

  const fmt=n=>n.toLocaleString("it-IT",{minimumFractionDigits:0,maximumFractionDigits:0})+"€";
  const fmt2=n=>n.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})+"€";

  const registraMese=()=>{
    if(s<=0)return;
    saveCfg(localCfg);
    const label=new Date().toLocaleDateString("it-IT",{month:"short",year:"2-digit"});
    const entry={id:uid(),label,stipendio:s,spese:sp,investimenti:inv,risparmio};
    saveStorico([entry,...storico].slice(0,24));
    setShowCfg(false);
  };

  const barW=(v)=>s>0?Math.min(100,Math.round(v/s*100)):0;
  const GREEN="#00e5a0",YELLOW="#facc15",RED="#f87171",BLUE="#38bdf8";

  return(
    <div>
      {/* Config mensile */}
      {(showCfg||storico.length===0)?(
        <div style={{background:Z.s2,borderRadius:12,padding:"14px",
          border:`1px solid ${Z.b}`,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:Z.t3,
            textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,
            fontFamily:"'JetBrains Mono',monospace"}}>Parametri del mese</div>

          {[
            {k:"stipendio",    l:"Stipendio netto",  icon:"💼", color:GREEN},
            {k:"spese",        l:"Spese totali",      icon:"💳", color:RED},
            {k:"investimenti", l:"Investimenti",      icon:"📈", color:BLUE},
          ].map(item=>(
            <div key={item.k} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:14}}>{item.icon}</span>
                  <span style={{fontSize:13,color:Z.t2}}>{item.l}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:item.color,
                  fontFamily:"'JetBrains Mono',monospace"}}>
                  {parseFloat((localCfg[item.k]||"").replace(",","."))||0 ?
                    fmt2(parseFloat((localCfg[item.k]||"").replace(",","."))||0) : "—"}
                </span>
              </div>
              <div style={{position:"relative"}}>
                <input type="number" min={0} step={1}
                  value={localCfg[item.k]||""}
                  onChange={e=>setLocalCfg(f=>({...f,[item.k]:e.target.value}))}
                  placeholder="0"
                  style={{width:"100%",background:Z.s1,
                    border:`1px solid ${localCfg[item.k]?item.color+"44":Z.b}`,
                    borderRadius:8,padding:"8px 32px 8px 10px",
                    color:Z.t,fontSize:14,outline:"none",
                    boxSizing:"border-box",transition:"border-color 0.2s"}}/>
                <span style={{position:"absolute",right:10,top:"50%",
                  transform:"translateY(-50%)",fontSize:12,color:Z.t3}}>€</span>
              </div>
            </div>
          ))}

          {/* Preview risparmio */}
          {s>0&&(
            <div style={{marginTop:14,padding:"12px",
              background:risparmio>=0?"rgba(0,229,160,0.07)":"rgba(248,113,113,0.07)",
              borderRadius:10,border:`1px solid ${risparmio>=0?GREEN+"30":RED+"30"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,color:Z.t2,fontWeight:600}}>Risparmio mensile</span>
                <span style={{fontSize:20,fontWeight:900,
                  color:risparmio>=0?GREEN:RED,
                  fontFamily:"'JetBrains Mono',monospace"}}>
                  {risparmio>=0?"+":""}{fmt2(risparmio)}
                </span>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                {[
                  {l:"Spese",l2:`${barW(sp)}%`,c:RED,v:sp},
                  {l:"Investimenti",l2:`${barW(inv)}%`,c:BLUE,v:inv},
                  {l:"Risparmio",l2:`${Math.max(0,barW(risparmio))}%`,c:GREEN,v:Math.max(0,risparmio)},
                ].map(seg=>(
                  <div key={seg.l} style={{flex:1,textAlign:"center"}}>
                    <div style={{height:6,background:Z.b2,borderRadius:3,overflow:"hidden",marginBottom:3}}>
                      <div style={{height:"100%",width:seg.l2,background:seg.c,borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:9,color:seg.c,fontWeight:700}}>{seg.l}</div>
                    <div style={{fontSize:10,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>{seg.l2}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={registraMese}
              style={{flex:1,padding:"10px",
                background:s>0?"#00e5a0":"rgba(255,255,255,0.06)",
                borderRadius:10,
                color:s>0?"#0a0a0a":Z.t3,
                fontSize:13,fontWeight:700}}>
              ✓ Registra mese
            </button>
            {storico.length>0&&(
              <button onClick={()=>setShowCfg(false)}
                style={{padding:"10px 14px",background:Z.s1,
                  borderRadius:10,color:Z.t3,fontSize:13}}>✕</button>
            )}
          </div>
        </div>
      ):(
        <button onClick={()=>{setLocalCfg(cfg);setShowCfg(true);}}
          style={{display:"flex",alignItems:"center",gap:6,
            marginBottom:14,padding:"8px 14px",
            background:"rgba(0,229,160,0.07)",
            border:"1px solid rgba(0,229,160,0.2)",
            borderRadius:10,color:GREEN,fontSize:12,fontWeight:600}}>
          + Nuovo mese
        </button>
      )}

      {/* Storico */}
      {storico.length>0&&(
        <div>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,
            textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>Storico</div>
          {storico.map((m,i)=>{
            const pct=m.stipendio>0?Math.round(m.risparmio/m.stipendio*100):0;
            const col=m.risparmio>0?GREEN:RED;
            return(
              <div key={m.id} style={{padding:"10px 12px",marginBottom:6,
                background:Z.s2,borderRadius:10,
                border:`1px solid ${i===0?GREEN+"40":Z.b}`}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {i===0&&<span style={{fontSize:9,fontWeight:700,
                      color:GREEN,padding:"1px 5px",background:GREEN+"18",
                      borderRadius:4}}>ULTIMO</span>}
                    <span style={{fontSize:13,fontWeight:700,color:Z.t}}>
                      {m.label}
                    </span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:900,color:col,
                      fontFamily:"'JetBrains Mono',monospace"}}>
                      {m.risparmio>=0?"+":""}{fmt(m.risparmio)}
                    </span>
                    <button onClick={()=>saveStorico(storico.filter(x=>x.id!==m.id))}
                      style={{color:Z.t3,fontSize:14,opacity:0.3,lineHeight:1}}>×</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  {[
                    {l:"💼 Stipendio",v:m.stipendio,c:Z.t2},
                    {l:"💳 Spese",v:m.spese,c:RED},
                    {l:"📈 Investimenti",v:m.investimenti,c:BLUE},
                  ].map(item=>(
                    <div key={item.l} style={{flex:1}}>
                      <div style={{fontSize:9,color:Z.t3,marginBottom:1}}>{item.l}</div>
                      <div style={{fontSize:11,fontWeight:700,color:item.c,
                        fontFamily:"'JetBrains Mono',monospace"}}>
                        {fmt(item.v)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:8,height:3,background:Z.b2,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.max(0,pct)}%`,
                    background:col,borderRadius:2}}/>
                </div>
                <div style={{fontSize:9,color:col,marginTop:2,textAlign:"right",fontWeight:700}}>
                  {pct}% risparmiato
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LogIgiene({h,setData,data}){
  // Gli aspetti igiene sono persistiti nell'abitudine stessa (non nei logs)
  const aspetti=(()=>{
    const found=(data.aree||[]).flatMap(a=>a.cat||[])
      .flatMap(cat=>cat.h||[])
      .find(x=>x.id===h.id);
    return (found&&found.aspetti||[]);
  })();

  const toggle=(aspId)=>{
    setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
      cat:(a.cat||[]).map(cat=>({...cat,
        h:(cat.h||[]).map(hh=>hh.id===h.id
          ?{...hh,aspetti:(hh.aspetti||[]).map(asp=>asp.id===aspId?{...asp,ok:!asp.ok}:asp)}
          :hh)
      }))
    }))}));
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {aspetti.map(asp=>(
        <button key={asp.id} onClick={()=>toggle(asp.id)}
          style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            background:Z.s2,borderRadius:10,textAlign:"left",
            border:`1px solid ${asp.ok?"#00e5a0":Z.b}`}}>

          <span style={{flex:1,fontSize:14,color:Z.t}}>{asp.nome}</span>
          {asp.ok&&<span style={{fontSize:12,color:"#00e5a0"}}>✓</span>}
        </button>
      ))}
    </div>
  );
}

function LogVisite({h,setData,data}){
  const FREQ_OPTIONS=[
    {k:"una_tantum", l:"Una tantum"},
    {k:"mensile",    l:"Mensile"},
    {k:"semestrale", l:"Semestrale"},
    {k:"annuale",    l:"Annuale"},
    {k:"biennale",   l:"Ogni 2 anni"},
  ];
  const visite=(()=>{
    const found=(data.aree||[]).flatMap(a=>a.cat||[])
      .flatMap(cat=>cat.h||[]).find(x=>x.id===h.id);
    return (found&&found.visite||[]);
  })();
  const saveVisite=nv=>setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
    cat:(a.cat||[]).map(cat=>({...cat,
      h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,visite:nv}:hh)
    }))
  }))}));

  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({nome:"",freq:"annuale",data:""});
  const [editId,setEditId]=useState(null);

  const reset=()=>{setForm({nome:"",freq:"annuale",data:""});setEditId(null);setShowForm(false);};
  const salva=()=>{
    if(!form.nome.trim())return;
    const entry={id:editId||uid(),nome:form.nome.trim(),freq:form.freq,data:form.data};
    const updated=editId?visite.map(v=>v.id===editId?entry:v):[...visite,entry];
    saveVisite(updated);
    reset();
  };
  const del=id=>saveVisite(visite.filter(v=>v.id!==id));

  // Calcola prossima visita
  const prossimaData=(data,freq)=>{
    if(!data)return null;
    const d=new Date(data);
    if(isNaN(d))return null;
    const adds={una_tantum:0,mensile:1,semestrale:6,annuale:12,biennale:24};
    const months=adds[freq]||12;
    d.setMonth(d.getMonth()+months);
    return d;
  };
  const oggi=new Date();
  const fmtDate=d=>d?new Date(d).toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"}):"—";
  const statusColor=(data,freq)=>{
    const p=prossimaData(data,freq);
    if(!p)return Z.t3;
    const diff=(p-oggi)/(1000*60*60*24);
    if(diff<0)return"#f87171";
    if(diff<30)return"#facc15";
    return"#00e5a0";
  };
  const freqLabel=k=>(FREQ_OPTIONS.find(f=>f.k===k)||{}).l||k;

  return(
    <div>
      {visite.map(v=>{
        const pross=prossimaData(v.data,v.freq);
        const sc=statusColor(v.data,v.freq);
        return(
          <div key={v.id} style={{padding:"10px 12px",marginBottom:8,
            background:Z.s2,borderRadius:10,border:`1px solid ${Z.b}`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",
                background:sc,flexShrink:0,marginTop:4}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:Z.t,marginBottom:3}}>
                  {v.nome}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:Z.t3}}>
                    📅 Ultima: <span style={{color:Z.t2}}>{fmtDate(v.data)}</span>
                  </span>
                  <span style={{fontSize:10,color:Z.t3}}>
                    🔁 <span style={{color:Z.t2}}>{freqLabel(v.freq)}</span>
                  </span>
                </div>
                {pross&&v.freq!=="una_tantum"&&(
                  <div style={{marginTop:3,fontSize:10,fontWeight:600,color:sc}}>
                    → Prossima: {fmtDate(pross.toISOString().split("T")[0])}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>{setForm({nome:v.nome,freq:v.freq,data:v.data});setEditId(v.id);setShowForm(true);}}
                  style={{color:Z.t3,fontSize:11,padding:"3px 7px",
                    background:"rgba(255,255,255,0.05)",
                    borderRadius:6,border:`1px solid ${Z.b}`}}>✎</button>
                <button onClick={()=>del(v.id)}
                  style={{color:"#f87171",fontSize:16,padding:"0 4px",opacity:0.5}}>×</button>
              </div>
            </div>
          </div>
        );
      })}

      {showForm?(
        <div style={{background:Z.s2,borderRadius:12,padding:"12px",
          border:`1px solid ${Z.b}`,marginTop:4}}>
          <input value={form.nome}
            onChange={e=>setForm(f=>({...f,nome:e.target.value}))}
            placeholder="Es. Cardiologo, Dentista..."
            style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,
              borderRadius:8,padding:"8px 12px",color:Z.t,fontSize:13,
              outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:10,color:Z.t3,marginBottom:4,fontWeight:600}}>Data ultima visita</div>
            <input type="date" value={form.data}
              onChange={e=>setForm(f=>({...f,data:e.target.value}))}
              style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,
                borderRadius:8,padding:"8px 12px",color:Z.t,fontSize:13,
                outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:Z.t3,marginBottom:6,fontWeight:600}}>Frequenza</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {FREQ_OPTIONS.map(f=>(
                <button key={f.k} onClick={()=>setForm(fm=>({...fm,freq:f.k}))}
                  style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,
                    background:form.freq===f.k?"rgba(56,189,248,0.15)":"rgba(255,255,255,0.04)",
                    border:`1.5px solid ${form.freq===f.k?"#38bdf8":"rgba(255,255,255,0.08)"}`,
                    color:form.freq===f.k?"#38bdf8":Z.t3}}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={salva}
              style={{flex:1,padding:"9px",background:"#38bdf8",
                borderRadius:10,color:"#0a0a0a",fontSize:13,fontWeight:700}}>
              {editId?"Aggiorna":"Aggiungi"}
            </button>
            <button onClick={reset}
              style={{padding:"9px 14px",background:Z.s1,
                borderRadius:10,color:Z.t3,fontSize:13}}>✕</button>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowForm(true)}
          style={{display:"flex",alignItems:"center",gap:6,
            padding:"9px 14px",
            background:"rgba(56,189,248,0.07)",
            border:"1px solid rgba(56,189,248,0.2)",
            borderRadius:10,color:"#38bdf8",fontSize:13,fontWeight:600}}>
          <span style={{fontSize:16}}>+</span> Aggiungi visita
        </button>
      )}
    </div>
  );
}


function EditHabit({item,logs,data,setData:setDataProp,onSave,onDel,onClose,onSaveLog}){
  const nameRef=useRef(null);
  const [st,setSt]       = useState(item.s||"green");
  const [freq,setFreq]   = useState(item.freq||{type:"daily"});
  const [conf,setConf]   = useState(false);
  const [newMs,setNewMs] = useState("");
  const [milestones,setMilestones] = useState(item.milestones||[]);
  const [riflessioni,setRiflessioni] = useState(item.riflessioni||"");
  const col = AREA_C[item.aId]||SILVER;

  const saveAll=()=>{
    const nome=(nameRef.current&&nameRef.current.value&&nameRef.current.value.trim())||item.nome;
    onSave({s:st,note:"",freq,nome,milestones,riflessioni});onClose();
  };
  const addMs=()=>{
    if(!newMs.trim())return;
    setMilestones(ms=>[...ms,{id:Date.now().toString(36),text:newMs.trim(),done:false}]);
    setNewMs("");
  };
  const MS_STATES=[
    {k:"todo",   label:"Da fare",    color:Z.t3,      bg:"transparent",           icon:"○"},
    {k:"doing",  label:"In corso",   color:"#facc15", bg:"rgba(250,204,21,0.1)",  icon:"◑"},
    {k:"done",   label:"Completata", color:col,       bg:col+"18",                icon:"●"},
  ];
  const togMs=msId=>setMilestones(ms=>ms.map(m=>{
    if(m.id!==msId)return m;
    const order=["todo","doing","done"];
    const next=order[(order.indexOf(m.state||"todo")+1)%3];
    return{...m,state:next,done:next==="done"};
  }));
  const delMs=msId=>setMilestones(ms=>ms.filter(m=>m.id!==msId));

  return(
    <Sheet onClose={onClose} accent={col}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,
        paddingBottom:16,borderBottom:`1px solid ${Z.b}`}}>
        {item.icon&&(
          <div style={{width:42,height:42,borderRadius:12,
            background:col+"18",border:`1px solid ${col}33`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,flexShrink:0}}>
            {item.icon}
          </div>
        )}
        <input ref={nameRef} defaultValue={item.nome||""}
          placeholder="Nome abitudine..."
          style={{flex:1,background:"transparent",border:"none",
            borderBottom:`2px solid ${col}55`,borderRadius:0,
            padding:"6px 2px",color:Z.t,fontSize:18,fontWeight:700,
            outline:"none"}}/>
      </div>

      {/* Priorità */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:8,
          fontFamily:"'JetBrains Mono',monospace"}}>Priorità</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {Object.entries(STATUS).map(([k,v])=>{
            const sel=st===k;
            return(
              <button key={k} onClick={()=>setSt(k)}
                style={{padding:"10px 4px",borderRadius:10,
                  background:sel?v.c+"18":Z.s2,
                  border:`1.5px solid ${sel?v.c:Z.b}`,
                  display:"flex",flexDirection:"column",
                  alignItems:"center",gap:4}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:v.c}}/>
                <span style={{fontSize:10,color:sel?v.c:Z.t3,fontWeight:sel?700:400}}>
                  {v.l}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frequenza */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:8,
          fontFamily:"'JetBrains Mono',monospace"}}>Frequenza</div>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {[
            {v:"daily", l:"Ogni giorno"},
            {v:"weekly",l:"N×/sett"},
            {v:"days",  l:"Giorni fissi"},
            {v:"none",  l:"Libera"},
          ].map(({v,l})=>{
            const sel=freq.type===v;
            return(
              <button key={v} onClick={()=>setFreq(
                v==="daily"?{type:"daily"}:
                v==="weekly"?{type:"weekly",n:freq.n||3}:
                v==="none"?{type:"none"}:
                {type:"days",d:freq.d||[1,2,3,4,5]}
              )}
                style={{flex:1,padding:"8px 2px",borderRadius:10,
                  fontSize:10,fontWeight:sel?700:400,
                  background:sel?col+"20":Z.s2,
                  border:`1.5px solid ${sel?col:Z.b}`,
                  color:sel?col:Z.t2,textAlign:"center",lineHeight:1.3}}>
                {l}
              </button>
            );
          })}
        </div>
        {freq.type==="weekly"&&(
          <div style={{display:"flex",gap:5}}>
            {[1,2,3,4,5,6].map(n=>(
              <button key={n} onClick={()=>setFreq({type:"weekly",n})}
                style={{flex:1,padding:"9px 0",borderRadius:8,fontSize:13,
                  fontWeight:freq.n===n?700:400,
                  background:freq.n===n?col:Z.s2,
                  border:`1px solid ${freq.n===n?col:Z.b}`,
                  color:freq.n===n?"white":Z.t2}}>
                {n}×
              </button>
            ))}
          </div>
        )}
        {freq.type==="days"&&(
          <div style={{display:"flex",gap:5}}>
            {["D","L","M","M","G","V","S"].map((label,dow)=>{
              const sel=(freq.d||[]).includes(dow);
              return(
                <button key={dow} onClick={()=>{
                  const cur=freq.d||[];
                  setFreq({type:"days",d:sel?cur.filter(x=>x!==dow):[...cur,dow].sort()});
                }}
                  style={{flex:1,padding:"9px 0",borderRadius:10,fontSize:12,
                    fontWeight:sel?700:400,
                    background:sel?col:Z.s2,
                    border:`1px solid ${sel?col:Z.b}`,
                    color:sel?"white":Z.t2}}>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Log speciale */}


      {item.logType==="asset"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>💰 Patrimonio del mese</div>
          <LogAsset h={item} logs={logs||{}} onSaveLog={onSaveLog||(()=>{})} data={data||{}}/>
        </div>
      )}
      {item.logType==="risparmi"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>🏦 Simulatore Risparmi</div>
          <LogRisparmi h={item} data={data||{}} setData={setDataProp||(()=>{})}/>
        </div>
      )}
      {item.logType==="spese"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>📊 Gestione Spese</div>
          <LogSpese h={item} data={data||{}} setData={setDataProp||(()=>{})}/>
        </div>
      )}
      {item.logType==="igiene"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>🪥 Igiene</div>
          <LogIgiene h={item} setData={setDataProp||(()=>{})} data={data||{}}/>
        </div>
      )}
      {item.logType==="visite"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>🩺 Visite</div>
          <LogVisite h={item} setData={setDataProp||(()=>{})} data={data||{}}/>
        </div>
      )}

      {/* Milestone */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:8,
          fontFamily:"'JetBrains Mono',monospace"}}>🏆 Milestone</div>
        {milestones.map(m=>{
          const st=MS_STATES.find(s=>s.k===(m.state||"todo"))||MS_STATES[0];
          return(
            <div key={m.id} style={{display:"flex",alignItems:"center",
              gap:8,marginBottom:6,padding:"8px 10px",
              background:st.bg||Z.s2,borderRadius:10,
              border:`1px solid ${st.k==="done"?col+"33":st.k==="doing"?"rgba(250,204,21,0.2)":Z.b}`}}>
              <button onClick={()=>togMs(m.id)}
                style={{flexShrink:0,padding:"2px 7px",borderRadius:6,
                  fontSize:10,fontWeight:700,
                  background:st.k==="todo"?"transparent":st.bg,
                  border:`1.5px solid ${st.k==="todo"?Z.b2:st.color}`,
                  color:st.color,whiteSpace:"nowrap"}}>
                {st.icon} {st.label}
              </button>
              <span style={{flex:1,fontSize:13,
                color:st.k==="done"?Z.t3:Z.t,
                textDecoration:st.k==="done"?"line-through":"none"}}>
                {m.text}
              </span>
              <button onClick={()=>delMs(m.id)}
                style={{color:Z.t3,fontSize:16,padding:"0 4px",opacity:0.4}}>×</button>
            </div>
          );
        })}
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <input value={newMs} onChange={e=>setNewMs(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addMs()}
            placeholder="Nuova milestone..."
            style={{flex:1,background:Z.s2,
              border:`1px solid ${newMs?col:Z.b}`,
              borderRadius:10,padding:"9px 12px",
              color:Z.t,fontSize:13,outline:"none"}}/>
          <button onClick={addMs}
            style={{padding:"9px 14px",
              background:newMs.trim()?col:"rgba(255,255,255,0.06)",
              borderRadius:10,color:newMs.trim()?"#0a0a0a":Z.t3,
              fontSize:16,fontWeight:700}}>+</button>
        </div>
      </div>

      {/* Riflessioni */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:8,
          fontFamily:"'JetBrains Mono',monospace"}}>Riflessioni</div>
        <textarea
          value={riflessioni}
          onChange={e=>setRiflessioni(e.target.value)}
          placeholder="Pensieri liberi, note, contesto..."
          rows={4}
          style={{width:"100%",background:Z.s2,
            border:`1px solid ${riflessioni?col+"44":Z.b}`,
            borderRadius:10,padding:"11px 13px",
            color:Z.t,fontSize:13,lineHeight:1.6,
            resize:"none",outline:"none",
            boxSizing:"border-box",
            fontFamily:"Inter,sans-serif",
            transition:"border-color 0.2s"}}/>
      </div>
      {/* Azioni */}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        {conf?(
          <>
            <button onClick={()=>setConf(false)}
              style={{flex:1,padding:12,background:Z.s2,borderRadius:10,
                color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={onDel}
              style={{flex:2,padding:12,background:"rgba(248,113,113,0.12)",
                border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,
                color:"#f87171",fontSize:14,fontWeight:600}}>
              Conferma eliminazione
            </button>
          </>
        ):(
          <>
            <button onClick={()=>setConf(true)}
              style={{padding:"10px 14px",background:Z.s2,borderRadius:10,
                color:Z.t3,fontSize:12}}>Elimina</button>
            <button onClick={onClose}
              style={{flex:1,padding:12,background:Z.s2,borderRadius:10,
                color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={saveAll}
              style={{flex:2,padding:12,background:col,borderRadius:10,
                color:"white",fontSize:14,fontWeight:700}}>Salva</button>
          </>
        )}
      </div>
      <div style={{height:60}}/>
    </Sheet>
  );
}


function EditGoal({item,onSave,onDel,onClose,isNew}){
  const [text,setText]=useState(item.text||"");
  const [deadline,setDeadline]=useState(item.deadline||"");
  const [s,setS]=useState(item.s||"red");
  const [conf,setConf]=useState(false);
  return(
    <Sheet onClose={onClose} title={isNew?"Nuovo obiettivo":"Obiettivo"} accent="#facc15">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Descrivi l'obiettivo..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:10,
          padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:600,boxSizing:"border-box",marginBottom:12}}/>

      
      {/* Scadenza */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:600,color:Z.t2,marginBottom:6,
          letterSpacing:"0.05em",textTransform:"uppercase"}}>
          Scadenza (opzionale)
        </div>
        <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
          style={{background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:10,
            padding:"10px 12px",color:deadline?Z.t:Z.t3,fontSize:13,
            width:"100%",boxSizing:"border-box",outline:"none",
            colorScheme:"dark"}}/>
        {deadline&&(
          <button onClick={()=>setDeadline('')}
            style={{marginTop:6,fontSize:11,color:Z.t3}}>
            Rimuovi scadenza ×
          </button>
        )}
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
            <button onClick={()=>{onSave({text:text.trim()||item.text,note:"",s,deadline:deadline||null});onClose();}}
              style={{flex:2,padding:12,background:"#facc15",borderRadius:10,color:"#0a0a0a",fontSize:14,fontWeight:700}}>
              {isNew?"Crea":"Salva"}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}

function EditTask({task,onSave,onDel,onClose,aree}){
  const [txt,setTxt]=useState(task.text||"");
  const [dl,setDl]=useState(task.deadline||"");
  const [aId,setAId]=useState(task.aId||"");
  const [cId,setCId]=useState(task.cId||"");
  const [note,setNote]=useState(task.note||"");
  const [showDP,setShowDP]=useState(false);
  const [conf,setConf]=useState(false);
  const col="#c8c8d4";
  const selArea=aree.find(a=>a.id===aId);
  const cats=(selArea&&selArea.cat)||[];

  const autoDetect=useCallback((text)=>{
    if(!text.trim())return;
    const lower=text.toLowerCase();
    const keywords={
      salute:  ["salute","gym","palestra","nuoto","corsa","dieta","medic","dottore","sport","allenament","sonno"],
      lavoro:  ["lavoro","progetto","meeting","email","cliente","snam","report","offerta","contratto","app","code","sviluppo"],
      relazioni:["amici","famiglia","mamma","papà","nonna","costanza","uscita","cena","chiamata","compleanno"],
      gioia:   ["viaggio","vacanza","musica","libro","film","gioco","chitarra","casa","natura"],
    };
    for(const [areaId,words] of Object.entries(keywords)){
      if(words.some(w=>lower.includes(w))){
        const area=aree.find(a=>a.id===areaId);
        if(area){
          setAId(areaId);
          for(const cat of area.cat){
            const catWords=cat.nome.toLowerCase().split(" ");
            if(catWords.some(w=>lower.includes(w))){setCId(cat.id);return;}
          }
          setCId("");
        }
        return;
      }
    }
  },[aree]);

  return(
    <Sheet onClose={onClose}
      title={task.id?"Modifica task":"Nuovo task"}
      accent={col}>
      {showDP&&<DatePicker value={dl} onChange={v=>{setDl(v);setShowDP(false);}}
        onClose={()=>setShowDP(false)} accent={col}/>}

      {/* Testo */}
      <input value={txt}
        onChange={e=>{setTxt(e.target.value);autoDetect(e.target.value);}}
        placeholder="Descrivi il task..."
        onFocus={e=>setTimeout(()=>e.target.scrollIntoView({behavior:"smooth",block:"center"}),300)}
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:10,
          padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:500,
          boxSizing:"border-box",marginBottom:14,outline:"none"}}/>

      {/* Scadenza */}
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:8,
        fontFamily:"'JetBrains Mono',monospace"}}>Scadenza</div>
      <button onClick={()=>setShowDP(true)}
        style={{width:"100%",padding:"12px 13px",background:Z.s2,
          border:`1px solid ${dl?col+"55":Z.b}`,
          borderRadius:10,color:dl?Z.t:Z.t3,fontSize:14,textAlign:"left",
          marginBottom:14,display:"flex",alignItems:"center",
          justifyContent:"space-between"}}>
        <span>{dl?fmtDate(dl):"Nessuna scadenza"}</span>
        <span style={{fontSize:12,color:Z.t3}}>📅</span>
      </button>

      {/* Area */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
          textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>Area</div>
        {aId&&<span style={{fontSize:10,color:Z.t3}}>auto-rilevata ✦</span>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {aree.map(a=>(
          <button key={a.id} onClick={()=>{setAId(a.id===aId?"":a.id);setCId("");}}
            style={{padding:"5px 11px",borderRadius:20,fontSize:12,
              fontWeight:aId===a.id?600:400,
              background:aId===a.id?a.color+"22":Z.s2,
              border:`1px solid ${aId===a.id?a.color:Z.b}`,
              color:aId===a.id?a.color:Z.t2}}>
            {a.nome}
          </button>
        ))}
      </div>
      {cats.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {cats.map(cat=>(
            <button key={cat.id} onClick={()=>setCId(cat.id===cId?"":cat.id)}
              style={{padding:"4px 10px",borderRadius:20,fontSize:11,
                fontWeight:cId===cat.id?600:400,
                background:cId===cat.id?selArea.color+"18":Z.s2,
                border:`1px solid ${cId===cat.id?selArea.color:Z.b}`,
                color:cId===cat.id?selArea.color:Z.t3}}>
              {cat.nome}
            </button>
          ))}
        </div>
      )}



      {/* Note */}
      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
        textTransform:"uppercase",marginBottom:8,
        fontFamily:"'JetBrains Mono',monospace"}}>Note</div>
      <textarea value={note} onChange={e=>setNote(e.target.value)}
        placeholder="Note (opzionale)..."
        rows={2}
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,
          borderRadius:8,padding:"8px 10px",color:Z.t,fontSize:13,
          resize:"none",outline:"none",boxSizing:"border-box",marginBottom:14,
          fontFamily:"Inter,sans-serif",lineHeight:1.5}}/>

      {/* Bottoni */}
      {task.id&&conf?(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setConf(false)}
            style={{flex:1,padding:12,background:Z.s2,borderRadius:10,
              color:Z.t2,fontSize:14}}>Annulla</button>
          <button onClick={()=>{onDel();onClose();}}
            style={{flex:1,padding:12,background:"rgba(248,113,113,0.12)",
              border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,
              color:"#f87171",fontSize:14,fontWeight:600}}>Elimina</button>
        </div>
      ):(
        <div style={{display:"flex",gap:8}}>
          {task.id&&(
            <button onClick={()=>setConf(true)}
              style={{padding:"12px 14px",background:Z.s2,borderRadius:10,
                color:Z.t3,fontSize:13,flexShrink:0}}>🗑</button>
          )}
          <button onClick={onClose}
            style={{flex:1,padding:12,background:Z.s2,borderRadius:10,
              color:Z.t2,fontSize:14}}>Annulla</button>
          <button onClick={()=>{
            if(txt.trim()){
              onSave({...task,text:txt.trim(),deadline:dl||null,aId,cId,note:note.trim()});
              onClose();
            }
          }}
            style={{flex:2,padding:12,background:col,borderRadius:10,
              color:"#0a0a0a",fontSize:14,fontWeight:700}}>
            {task.id?"Salva":"Aggiungi"}
          </button>
        </div>
      )}
      <div style={{height:80}}/>
    </Sheet>
  );
}


function HRow({h,tr,logs,onToggle,onEdit,onLog,onDel,onChangeStatus,compact,showArea}){
  const ts=tod();
  const done=!!((tr[h.id]||{})[ts]);
  const col=AREA_C[h.aId]||SILVER;
  const sc=STATUS[h.s]||STATUS.red;
  const tw=((logs||{})[h.id]||{})[ts];
  const todayWake=tw&&tw.wakeTime;

  return(
    <div style={{display:"flex",alignItems:"center",gap:0,
      borderRadius:10,marginBottom:5,overflow:"hidden",
      background:done?"rgba(255,255,255,0.02)":Z.s1,
      border:`1px solid ${done?"rgba(255,255,255,0.05)":"transparent"}`}}>

      {/* Bottone tick / pallino criticità */}
      {h.freq&&h.freq.type==="none"?(
        <button
          onClick={e=>{e.stopPropagation();
            if(onChangeStatus){
              const cycle=["red","orange","yellow","green"];
              const cur=cycle.indexOf(h.s||"red");
              onChangeStatus(h.id,cycle[(cur+1)%cycle.length]);
            }
          }}
          style={{width:48,flexShrink:0,alignSelf:"stretch",
            background:"transparent",
            border:"none",borderRight:`1px solid ${Z.b}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",padding:0}}>
          <div style={{width:20,height:20,borderRadius:"50%",
            background:sc.c,
            boxShadow:`0 0 6px ${sc.c}60`}}/>
        </button>
      ):(
        <button
          onClick={e=>{e.stopPropagation();onToggle(h.id);}}
          style={{width:48,flexShrink:0,alignSelf:"stretch",
            background:done?col+"22":"transparent",
            border:"none",borderRight:`1px solid ${done?sc.c+"40":Z.b}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",padding:0}}>
          <div style={{width:20,height:20,borderRadius:"50%",
            background:done?sc.c:sc.c+"18",
            border:`2.5px solid ${sc.c}`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            {done&&<span style={{color:"#0a0a0a",fontSize:11,fontWeight:900}}>{"✓"}</span>}
          </div>
        </button>
      )}

      {/* Contenuto */}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:8,
        padding:compact?"8px 10px":"10px 12px",minWidth:0,cursor:"pointer"}}
        onClick={()=>onEdit(h)}>

        {h.icon&&<span style={{fontSize:16,flexShrink:0,lineHeight:1}}>{h.icon}</span>}

        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:done?400:500,
            color:done?Z.t3:Z.t,
            textDecoration:done?"line-through":"none",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {h.nome}
          </div>
          {!compact&&todayWake&&(
            <div style={{fontSize:11,color:col,marginTop:1}}>{todayWake}</div>
          )}
          {!compact&&h.freq&&h.freq.type!=="daily"&&h.freq.type!=="none"&&(
            <div style={{fontSize:10,color:Z.t3,marginTop:1}}>
              {h.freq.type==="weekly"?"Sett.":"Mensile"}
            </div>
          )}
        </div>

        {showArea&&(
          <span style={{fontSize:9,color:col,fontWeight:600,
            padding:"2px 6px",background:col+"20",borderRadius:5,
            whiteSpace:"nowrap",flexShrink:0}}>
            {h.cN}
          </span>
        )}

        {!compact&&<span style={{fontSize:13,color:Z.t3,opacity:0.4}}>{"›"}</span>}

        {h.logType&&h.logType!=="nessuno"&&!compact&&(
          <button onClick={e=>{e.stopPropagation();if(onLog)onLog(h);}}
            style={{width:28,height:28,borderRadius:8,flexShrink:0,
              background:col+"15",border:`1px solid ${col}30`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13}}>
            {h.icon||"✦"}
          </button>
        )}
      </div>
    </div>
  );
}

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
        const mu=()=>{window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);};
        window.addEventListener("mousemove",mm);
        window.addEventListener("mouseup",mu);
      }}>
      {/* Track */}
      <div style={{position:"absolute",left:0,right:0,height:4,borderRadius:2,
        background:"rgba(255,255,255,0.1)"}}>
        <div style={{position:"absolute",left:0,width:`${pct}%`,height:"100%",
          borderRadius:2,background:color}}/>
      </div>
      {/* Thumb */}
      <div style={{position:"absolute",
        left:`calc(${pct}% - 7px)`,
        width:14,height:14,borderRadius:"50%",
        background:"white",
        boxShadow:`0 0 0 2.5px ${color}, 0 2px 4px rgba(0,0,0,0.5)`,
        pointerEvents:"none"}}/>
    </div>
  );
}

//  LABEL ROW per Radar Vita 

function Vita({data,setData}){
  const scores=data.vita||{};
  const snapshots=data.snapshots||[];
  const setScore=(id,v)=>setData(d=>({...d,vita:{...d.vita,[id]:v}}));
  const [openArea,setOpenArea]=useState(null);
  const [selSnap,setSelSnap]=useState(null);

  const saveSnapshot=()=>{
    const label=new Date().toLocaleDateString("it-IT",{day:"numeric",month:"short"});
    setData(d=>({...d,snapshots:[{date:label,vita:{...scores}},...(d.snapshots||[])].slice(0,4)}));
  };

  const areaScore=a=>Math.round(a.cat.map(c=>scores[c.id]||0).reduce((s,v)=>s+v,0)/a.cat.length*10)/10;
  const areaPcts=useMemo(()=>VITA_AREE.map(a=>areaScore(a)),[scores]);
  const avg=useMemo(()=>Math.round(areaPcts.reduce((s,v)=>s+v,0)/4*10)/10,[areaPcts]);
  const gc=avg>=7?"#00e5a0":avg>=4?"#facc15":"#f87171";

  const CX=113,CY=113,R=105;
  const GAP=(8*Math.PI)/180,SPAN=Math.PI/2,CSPAN=(SPAN-GAP)/3;
  const areaA=VITA_AREE.map((_,ai)=>{
    const s0=-Math.PI/2+ai*SPAN,s=s0+GAP/2,e=s0+SPAN-GAP/2;
    return{s,e,catA:[0,1,2].map(ci=>s+CSPAN*(ci+0.5))};
  });
  const ALL=VITA_AREE.flatMap((area,ai)=>
    area.cat.map((cat,ci)=>({...cat,aColor:area.color,ang:areaA[ai].catA[ci]}))
  );
  const vals=ALL.map(x=>scores[x.id]||0);
  const snapVals=useMemo(()=>{
    if(selSnap===null||!snapshots[selSnap])return null;
    return ALL.map(x=>((snapshots[selSnap]||{}).vita||{})[x.id]||0);
  },[selSnap,snapshots]);
  const f2=n=>n.toFixed(2);
  const px=(a,v)=>CX+(v/10)*R*Math.cos(a);
  const py=(a,v)=>CY+(v/10)*R*Math.sin(a);
  const dv=vals.map(v=>v===0?0.2:v);
  const mkPoly=vs=>ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,vs[i]))},${f2(py(x.ang,vs[i]))}`).join(" ")+"Z";
  const poly=useMemo(()=>mkPoly(dv),[JSON.stringify(dv)]);
  const snapPoly=useMemo(()=>snapVals?mkPoly(snapVals.map(v=>v||0.2)):null,[selSnap,JSON.stringify(snapshots)]);
  const ring=v=>ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,v))},${f2(py(x.ang,v))}`).join(" ")+"Z";

  return(
    <div style={{paddingBottom:20}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"baseline",
        justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,letterSpacing:"-0.5px"}}>
          Visione
        </h1>
        <span style={{fontSize:28,fontWeight:900,color:gc,
          fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-1px"}}>
          {avg}<span style={{fontSize:13,color:Z.t3,fontWeight:400}}>/10</span>
        </span>
      </div>

      {/* Card radar */}
      <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
        borderRadius:18,overflow:"hidden",marginBottom:14}}>

        {/* Riga top: Armonia (sx) — Energia (dx) */}
        <div style={{display:"flex",borderBottom:`1px solid ${Z.b}`}}>
          {[3,0].map((idx,li)=>{
            const area=VITA_AREE[idx],score=areaPcts[idx];
            const sc=score>=7?area.color:score>=4?"#facc15":"#f87171";
            const sel=openArea===area.id;
            return(
              <button key={area.id}
                onClick={()=>setOpenArea(sel?null:area.id)}
                style={{flex:1,padding:"12px 16px",background:"transparent",
                  border:"none",display:"flex",flexDirection:"column",
                  alignItems:li===0?"flex-start":"flex-end",gap:3,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,
                  flexDirection:li===0?"row":"row-reverse"}}>
                  <span style={{fontSize:17}}>{area.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,
                    color:sel?area.color:Z.t2,letterSpacing:"-0.2px"}}>{area.nome}</span>
                </div>
                <span style={{fontSize:24,fontWeight:900,color:sc,lineHeight:1,
                  fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.5px"}}>
                  {score}
                </span>
              </button>
            );
          })}
        </div>

        {/* SVG radar — viewBox stretto, zero spazio vuoto */}
        <svg viewBox="0 0 226 226" style={{display:"block",width:"100%"}}>
          <defs>
            <radialGradient id="vgrd" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.09"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </radialGradient>
          </defs>

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

          {areaA.map((a,ai)=>(
            <line key={`s${ai}`}
              x1={f2(CX+3*Math.cos(a.s))} y1={f2(CY+3*Math.sin(a.s))}
              x2={f2(CX+R*Math.cos(a.s))} y2={f2(CY+R*Math.sin(a.s))}
              stroke="#0a0a0a" strokeWidth={2.5}/>
          ))}

          {[2,5,8,10].map(v=>(
            <path key={v} d={ring(v)} fill="none"
              stroke={v===10?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.04)"}
              strokeWidth={v===10?1:0.5}/>
          ))}

          {ALL.map((x,i)=>(
            <line key={`r${i}`} x1={f2(CX)} y1={f2(CY)}
              x2={f2(CX+R*Math.cos(x.ang))} y2={f2(CY+R*Math.sin(x.ang))}
              stroke={x.aColor+"12"} strokeWidth={0.7}/>
          ))}

          {snapPoly&&(
            <path d={snapPoly} fill="none"
              stroke="rgba(255,255,255,0.22)" strokeWidth={1.5}
              strokeDasharray="3 2" strokeLinejoin="round"/>
          )}

          <path d={poly} fill="url(#vgrd)"
            stroke="rgba(255,255,255,0.72)" strokeWidth={2}
            strokeLinejoin="round"/>

          {ALL.map((x,i)=>(
            <g key={`d${i}`}>
              <circle cx={f2(px(x.ang,dv[i]))} cy={f2(py(x.ang,dv[i]))}
                r={6} fill={x.aColor} opacity={0.15}/>
              <circle cx={f2(px(x.ang,dv[i]))} cy={f2(py(x.ang,dv[i]))}
                r={3.5} fill={x.aColor} stroke="#111" strokeWidth={1.5}/>
            </g>
          ))}

          {ALL.map((x,i)=>{
            const lr=R*0.65,lx=CX+lr*Math.cos(x.ang),ly=CY+lr*Math.sin(x.ang);
            const cA=Math.cos(x.ang),sA=Math.sin(x.ang);
            const anchor=cA>0.4?"start":cA<-0.4?"end":"middle";
            const dy=sA>0.3?10:sA<-0.3?-2:4;
            return(
              <text key={`l${i}`} x={f2(lx)} y={f2(ly+dy)}
                textAnchor={anchor} fontSize={9} fontWeight={800}
                fill={x.aColor}
                stroke="#0d0d0d" strokeWidth={3} paintOrder="stroke fill"
                fontFamily="Inter,sans-serif">
                {x.nome}
              </text>
            );
          })}

          <circle cx={CX} cy={CY} r={26} fill="#0d0d0d"
            stroke="rgba(255,255,255,0.07)" strokeWidth={1}/>
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize={16} fontWeight={900} fill={gc}
            fontFamily={"'JetBrains Mono',monospace"}>{avg}</text>
          <text x={CX} y={CY+15} textAnchor="middle" fontSize={7}
            fill="rgba(255,255,255,0.2)" fontFamily="Inter,sans-serif">/10</text>
        </svg>

        {/* Riga bottom: Legami (sx) — Ingegno (dx) */}
        <div style={{display:"flex",borderTop:`1px solid ${Z.b}`}}>
          {[2,1].map((idx,li)=>{
            const area=VITA_AREE[idx],score=areaPcts[idx];
            const sc=score>=7?area.color:score>=4?"#facc15":"#f87171";
            const sel=openArea===area.id;
            return(
              <button key={area.id}
                onClick={()=>setOpenArea(sel?null:area.id)}
                style={{flex:1,padding:"12px 16px",background:"transparent",
                  border:"none",display:"flex",flexDirection:"column",
                  alignItems:li===0?"flex-start":"flex-end",gap:3,cursor:"pointer"}}>
                <span style={{fontSize:24,fontWeight:900,color:sc,lineHeight:1,
                  fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.5px"}}>
                  {score}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:5,
                  flexDirection:li===0?"row":"row-reverse"}}>
                  <span style={{fontSize:17}}>{area.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,
                    color:sel?area.color:Z.t2,letterSpacing:"-0.2px"}}>{area.nome}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Snapshot */}
        <div style={{borderTop:`1px solid ${Z.b}`,padding:"8px 14px",
          display:"flex",alignItems:"center",gap:8}}>
          <button onClick={saveSnapshot}
            style={{padding:"5px 12px",flexShrink:0,
              background:"rgba(200,200,212,0.07)",
              border:"1px solid rgba(200,200,212,0.15)",
              borderRadius:8,color:SILVER,fontSize:11,fontWeight:600}}>
            Salva
          </button>
          <div style={{display:"flex",gap:4,overflowX:"auto",flex:1,scrollbarWidth:"none"}}>
            {snapshots.length>0&&(
              <button onClick={()=>setSelSnap(null)}
                style={{padding:"4px 10px",borderRadius:7,fontSize:10,
                  flexShrink:0,whiteSpace:"nowrap",
                  background:selSnap===null?"rgba(255,255,255,0.09)":"transparent",
                  border:`1px solid rgba(255,255,255,${selSnap===null?"0.2":"0.07"})`,
                  color:selSnap===null?Z.t:Z.t3}}>Attuale</button>
            )}
            {snapshots.map((snap,i)=>(
              <div key={i} style={{display:"flex",flexShrink:0}}>
                <button onClick={()=>setSelSnap(selSnap===i?null:i)}
                  style={{padding:"4px 9px",borderRadius:"7px 0 0 7px",fontSize:10,
                    whiteSpace:"nowrap",
                    background:selSnap===i?"rgba(255,255,255,0.09)":"transparent",
                    border:`1px solid rgba(255,255,255,${selSnap===i?"0.2":"0.07"})`,
                    borderRight:"none",color:selSnap===i?Z.t:Z.t3}}>{snap.date}</button>
                <button onClick={()=>{
                  if(selSnap===i)setSelSnap(null);
                  else if(selSnap!==null&&selSnap>i)setSelSnap(selSnap-1);
                  setData(d=>({...d,snapshots:(d.snapshots||[]).filter((_,j)=>j!==i)}));
                }}
                  style={{padding:"4px 7px",borderRadius:"0 7px 7px 0",fontSize:11,
                    background:"transparent",
                    border:"1px solid rgba(255,255,255,0.07)",
                    color:"rgba(255,255,255,0.25)"}}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card aree 2x2 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {VITA_AREE.map((area,i)=>{
          const score=areaPcts[i],sel=openArea===area.id;
          const sc=score>=7?area.color:score>=4?"#facc15":"#f87171";
          return(
            <div key={area.id} onClick={()=>setOpenArea(sel?null:area.id)}
              style={{background:Z.s1,
                border:`1px solid ${sel?area.color+"70":Z.b}`,
                borderRadius:14,overflow:"hidden",cursor:"pointer",
                transition:"border-color 0.2s"}}>
              <div style={{padding:"11px 13px 9px",borderBottom:`1px solid ${Z.b}`}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                  <span style={{fontSize:16}}>{area.icon}</span>
                  <span style={{fontSize:13,fontWeight:700,
                    color:sel?area.color:Z.t2,flex:1}}>{area.nome}</span>
                  <span style={{fontSize:19,fontWeight:900,color:sc,
                    fontFamily:"'JetBrains Mono',monospace"}}>{score}</span>
                </div>
                <div styl