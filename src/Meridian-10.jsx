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
  input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:var(--track,#222);}
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
  salute:"#facc15",   // energia/elettrico
  lavoro:"#f97316",   // fuoco
  relazioni:"#84cc16",// terra
  gioia:"#38bdf8",    // acqua
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
    {id:"salute",icon:"⚡",  nome:"Energia",  color:"#facc15", cat:[
      {id:"mente",icon:"🧠",  nome:"Mente",       h:[
        {id:"h1",nome:"Sveglia alle 6",        icon:"⏰",s:"green",note:"",freq:{type:"daily"},      logType:"sveglia",  milestones:[]},
        {id:"h2",nome:"Meditazione",    icon:"🧘",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
        {id:"h3",nome:"Detox digitale", icon:"📵",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
        {id:"h4",nome:"Sonno",          icon:"🌙",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
      ]},
      {id:"fisico",icon:"💪", nome:"Fisico",       h:[
        {id:"h5",nome:"Esercizio",      icon:"🏋️",s:"green",note:"",freq:{type:"weekly",n:3}, logType:"workout",  milestones:[],esercizi:[]},
        {id:"h6",nome:"Nuoto",          icon:"🏊",s:"green",note:"",freq:{type:"weekly",n:3}, logType:"nuoto",    milestones:[]},
        {id:"h7",nome:"Camminata",      icon:"🚶",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
        {id:"h8",nome:"Stretching",     icon:"🤸",s:"green",note:"",freq:{type:"none"},       logType:"nessuno",  milestones:[]},
      ]},
      {id:"vita2",icon:"🌿",  nome:"Longevità",    h:[
        {id:"h10",nome:"Nutrizione",     icon:"🥗",s:"green",note:"",freq:{type:"daily"},     logType:"nessuno",  milestones:[]},
        {id:"h9", nome:"Igiene",         icon:"🪥",s:"green",note:"",freq:{type:"none"},      logType:"igiene",   milestones:[],aspetti:[{id:"a1",nome:"Denti",ok:false},{id:"a2",nome:"Pelle",ok:false},{id:"a3",nome:"Capelli",ok:false},{id:"a4",nome:"Postura",ok:false},{id:"a5",nome:"Unghie",ok:false}]},
        {id:"h12",nome:"Visite mediche", icon:"🩺",s:"green",note:"",freq:{type:"none"},      logType:"visite",   milestones:[],visite:[]},
      ]},
    ]},
    {id:"lavoro",icon:"🔥",   nome:"Ingegno",   color:"#f97316", cat:[
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
        {id:"h24",nome:"Cliente Snam",   icon:"🏭",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h60",nome:"Cliente Flutter",icon:"🎲",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h27",nome:"Opportunita",icon:"🚀",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h25",nome:"Persone",icon:"👥",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h26",nome:"Upskilling AI",  icon:"🤖",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h28",nome:"Sponsorship",   icon:"⭐",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"proj",icon:"⚙️",   nome:"Progetti",    h:[
        {id:"h14",nome:"Deep Work",     icon:"🎯",s:"green",note:"",freq:{type:"daily"},      logType:"nessuno",  milestones:[]},
        {id:"h29",nome:"Software",icon:"💻",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h30",nome:"Scrittura creativa",icon:"✍️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h32",nome:"Coaching",icon:"🌱",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
    ]},
    {id:"relazioni",icon:"🌱",nome:"Legami",    color:"#84cc16", cat:[
      {id:"amore",icon:"❤️",  nome:"Amore",       h:[
        {id:"h33",nome:"Condivisione",icon:"💬",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h34",nome:"Crescita di coppia",icon:"🌿",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h35",nome:"Intimità",icon:"💞",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h36",nome:"Maturità",icon:"🧭",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h37",nome:"Futuro insieme",icon:"🏡",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h38",nome:"Sostegno",icon:"🤝",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
      ]},
      {id:"fam",icon:"🏠",    nome:"Famiglia",    h:[
        {id:"h39",nome:"Mamma",icon:"👩",s:"green",note:"",freq:{type:"none"},logType:"relazione",milestones:[],dimensioni:[{id:"profondita",nome:"Profondità",s:"green"},{id:"cura",nome:"Cura",s:"green"},{id:"tempo",nome:"Tempo di qualità",s:"green"},{id:"realizzazione",nome:"Realizzazione",s:"green"}]},
        {id:"h40",nome:"Papà",icon:"👨",s:"green",note:"",freq:{type:"none"},logType:"relazione",milestones:[],dimensioni:[{id:"profondita",nome:"Profondità",s:"green"},{id:"cura",nome:"Cura",s:"green"},{id:"tempo",nome:"Tempo di qualità",s:"green"},{id:"realizzazione",nome:"Realizzazione",s:"green"}]},
        {id:"h41",nome:"Nonna",icon:"👵",s:"green",note:"",freq:{type:"none"},logType:"relazione",milestones:[],dimensioni:[{id:"profondita",nome:"Profondità",s:"green"},{id:"cura",nome:"Cura",s:"green"},{id:"tempo",nome:"Tempo di qualità",s:"green"},{id:"realizzazione",nome:"Realizzazione",s:"green"}]},
      ]},
      {id:"amici",icon:"✨",  nome:"Amici",       h:[
        {id:"h42",nome:"15 Uomini",icon:"☠️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h43",nome:"Amici stretti",icon:"🏫",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
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
        {id:"h51",nome:"Lettura",icon:"📚",s:"green",note:"",freq:{type:"daily"},logType:"nessuno",milestones:[]},
        {id:"h49",nome:"Viaggi",icon:"✈️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h50",nome:"Concerti",icon:"🎶",s:"green",note:"",freq:{type:"none"},logType:"concerti",milestones:[],eventi:[]},
        {id:"h52",nome:"Scacchi",icon:"♟️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h53",nome:"Gaming",icon:"🎮",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h54",nome:"Cinema",icon:"🎬",s:"green",note:"",freq:{type:"none"},logType:"cinema",milestones:[],eventi:[]},
      ]},
      {id:"svil",icon:"📖",   nome:"Crescita",   h:[
        {id:"h56",nome:"Manualità",icon:"🔧",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h58",nome:"Miglioramento",icon:"📖",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
        {id:"h99",nome:"Spiritualità",icon:"🕊️",s:"green",note:"",freq:{type:"none"},logType:"nessuno",milestones:[]},
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
  goals:[
    {id:"g1",text:"💪 Massa grassa al 15%",s:"red",note:"",
      tasks:[
        {id:"gt1a",text:"Da 25% a 20%",pct:20,done:false},
        {id:"gt1b",text:"Da 20% a 15%",pct:0,done:false}
      ],pct:10},
    {id:"g2",text:"🚀 Top #3 Senior Manager",s:"yellow",note:"",
      tasks:[
        {id:"gt2a",text:"Nodari",pct:80,done:false},
        {id:"gt2b",text:"Ferioli",pct:70,done:false},
        {id:"gt2c",text:"Lucey",pct:55,done:false},
        {id:"gt2d",text:"Apollonio",pct:0,done:false},
        {id:"gt2e",text:"Natale",pct:100,done:true},
        {id:"gt2f",text:"D'Ubaldo",pct:0,done:false},
        {id:"gt2g",text:"Gallina",pct:0,done:false},
        {id:"gt2h",text:"Giubileo",pct:85,done:false},
        {id:"gt2i",text:"Uri",pct:0,done:false}
      ],pct:43},
    {id:"g3",text:"💍 Matrimonio con Costanza",s:"orange",note:"",
      tasks:[
        {id:"gt3a",text:"Abiti",pct:35,done:false},
        {id:"gt3b",text:"Location",pct:30,done:false},
        {id:"gt3c",text:"Invitati",pct:20,done:false},
        {id:"gt3d",text:"Accessori",pct:5,done:false},
        {id:"gt3e",text:"Viaggio di Nozze",pct:85,done:false}
      ],pct:35},
    {id:"g4",text:"🏦 Risparmio di 30.000€",s:"orange",note:"",
      tasks:[
        {id:"gt4a",text:"5000€ - 10000€",pct:50,done:false},
        {id:"gt4b",text:"10000€ - 15000€",pct:0,done:false},
        {id:"gt4c",text:"15000€ - 20000€",pct:10,done:false},
        {id:"gt4d",text:"20000€ - 25000€",pct:90,done:false},
        {id:"gt4e",text:"25000€ - 30000€",pct:0,done:false}
      ],pct:30},
    {id:"g5",text:"📖 Lettura di 10 libri di Narrativa",s:"orange",note:"",
      tasks:[
        {id:"gt5a",text:"Le Cosmicomiche",pct:70,done:false},
        {id:"gt5b",text:"Il Dominatore delle Tenebre",pct:100,done:true},
        {id:"gt5c",text:"Il Conte di Montecristo",pct:0,done:false},
        {id:"gt5d",text:"Libro 4",pct:0,done:false},
        {id:"gt5e",text:"Libro 5",pct:0,done:false},
        {id:"gt5f",text:"Libro 6",pct:0,done:false},
        {id:"gt5g",text:"Libro 7",pct:0,done:false},
        {id:"gt5h",text:"Libro 8",pct:80,done:false},
        {id:"gt5i",text:"Libro 9",pct:0,done:false},
        {id:"gt5j",text:"Libro 10",pct:0,done:false}
      ],pct:17},
  ],
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
  {id:"salute",   nome:"Energia",  color:"#facc15", icon:"⚡", cat:[
    {id:"v-mente", nome:"Mente",     icon:"🧠", desc:"Chiarezza, concentrazione, stress"},
    {id:"v-fisico",nome:"Fisico",    icon:"💪", desc:"Energia, forma, allenamento, sonno"},
    {id:"v-vita",  nome:"Benessere", icon:"🌿", desc:"Alimentazione, prevenzione"},
  ]},
  {id:"lavoro",   nome:"Ingegno",  color:"#f97316", icon:"🔥", cat:[
    {id:"v-ricch", nome:"Ricchezza",    icon:"💰", desc:"Reddito, risparmi, sicurezza"},
    {id:"v-carr",  nome:"Carriera",     icon:"🚀", desc:"Crescita, ruolo, riconoscimento"},
    {id:"v-proj",  nome:"Progetti",     icon:"⚙️", desc:"Realizzazioni, impatto"},
  ]},
  {id:"relazioni",nome:"Legami",   color:"#84cc16", icon:"🌱", cat:[
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
  while(safe++<3650){
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
          paddingBottom:"env(safe-area-inset-bottom,12px)",
          maxHeight:"92dvh",overflowY:"auto"}}>
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
function MiniSlider({value,onChange,color,bg}){
  const trackRef=useRef(null);
  const [dragging,setDragging]=useState(false);

  const setFromX=(clientX)=>{
    if(!trackRef.current)return;
    const rect=trackRef.current.getBoundingClientRect();
    let pct=((clientX-rect.left)/rect.width)*100;
    pct=Math.max(0,Math.min(100,pct));
    pct=Math.round(pct/5)*5;
    onChange(pct);
  };

  useEffect(()=>{
    if(!dragging)return;
    const move=e=>{
      if(e.cancelable)e.preventDefault();
      const x=e.touches?e.touches[0].clientX:e.clientX;
      setFromX(x);
    };
    const up=()=>setDragging(false);
    window.addEventListener("mousemove",move);
    window.addEventListener("touchmove",move,{passive:false});
    window.addEventListener("mouseup",up);
    window.addEventListener("touchend",up);
    return()=>{
      window.removeEventListener("mousemove",move);
      window.removeEventListener("touchmove",move);
      window.removeEventListener("mouseup",up);
      window.removeEventListener("touchend",up);
    };
  },[dragging]);

  return(
    <div ref={trackRef}
      onMouseDown={e=>{setDragging(true);setFromX(e.clientX);}}
      onTouchStart={e=>{setDragging(true);setFromX(e.touches[0].clientX);}}
      style={{position:"relative",height:20,display:"flex",alignItems:"center",
        cursor:"pointer",touchAction:"none"}}>
      <div style={{position:"absolute",left:0,right:0,height:3,borderRadius:2,background:bg}}/>
      <div style={{position:"absolute",left:0,height:3,borderRadius:2,background:color,
        width:`${value}%`,transition:dragging?"none":"width 0.15s"}}/>
      <div style={{position:"absolute",left:`calc(${value}% - 7px)`,top:"50%",marginTop:-7,
        width:14,height:14,borderRadius:"50%",background:color,
        border:"2px solid #0a0a0a",boxShadow:"0 1px 3px rgba(0,0,0,0.4)",
        transition:dragging?"none":"left 0.15s"}}/>
    </div>
  );
}

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
          maxHeight:"92dvh",overflow:"hidden",display:"flex",flexDirection:"column",
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

function LogAsset({h,logs,onSaveLog,data,setData}){
  const ts=tod();
  const today=((logs||{})[h.id]||{})[ts]||{};
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

  const currentMonthLabel=new Date().toLocaleDateString("it-IT",{month:"2-digit",year:"2-digit"});
  const alreadySaved=patrimoniStorico.some(s=>s.label===`01/${currentMonthLabel}`);
  const saveMonthSnapshot=()=>{
    if(!setData)return;
    const now=new Date();
    const dateStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
    const label=`01/${currentMonthLabel}`;
    const entry={id:dateStr,label,data:dateStr,
      ...CATS.reduce((acc,cat)=>({...acc,[cat.k]:parseFloat((today[cat.k]||"").replace(",","."))||0}),{}),
      totale:tot};
    setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
      cat:(a.cat||[]).map(cat=>({...cat,
        h:(cat.h||[]).map(hh=>{
          if(hh.id!==h.id)return hh;
          const existing=(hh.patrimoniStorico||[]).filter(s=>s.label!==label);
          return{...hh,patrimoniStorico:[...existing,entry]};
        })
      }))
    }))}));
  };

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

      {tot>0&&setData&&(
        <button onClick={saveMonthSnapshot}
          disabled={alreadySaved}
          style={{width:"100%",marginBottom:12,padding:"10px",
            background:alreadySaved?"rgba(46,163,78,0.08)":"rgba(201,168,38,0.1)",
            border:`1px solid ${alreadySaved?"rgba(46,163,78,0.3)":"rgba(201,168,38,0.35)"}`,
            borderRadius:10,fontSize:12,fontWeight:600,
            color:alreadySaved?"#2ea34e":"#c9a826",
            cursor:alreadySaved?"default":"pointer"}}>
          {alreadySaved?`✓ Mese salvato nello storico`:`📌 Salva snapshot del mese`}
        </button>
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
  const [confirmDelId,setConfirmDelId]=useState(null);
  const confirmTimer=useRef(null);

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
  const totAnnuo=spese.reduce((s,x)=>{
    const v=x.importo||0;
    if(x.freq==="una_tantum")return s+v;
    if(x.freq==="settimanale")return s+v*52;
    if(x.freq==="mensile")return s+v*12;
    if(x.freq==="trimestrale")return s+v*4;
    if(x.freq==="annuale")return s+v;
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
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
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
          <button onClick={()=>{
              if(confirmDelId===s.id){
                clearTimeout(confirmTimer.current);
                setConfirmDelId(null);
                del(s.id);
              }else{
                setConfirmDelId(s.id);
                clearTimeout(confirmTimer.current);
                confirmTimer.current=setTimeout(()=>setConfirmDelId(null),2500);
              }
            }}
            style={confirmDelId===s.id?{
              color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",
              background:"#f87171",borderRadius:6,lineHeight:1.4,whiteSpace:"nowrap"
            }:{color:"#f87171",fontSize:16,padding:"0 4px",
              opacity:0.5,lineHeight:1}}>
            {confirmDelId===s.id?"Confermi?":"×"}
          </button>
        </div>
      ))}

      {/* Totale mensile + annuo */}
      {spese.length>0&&(
        <div style={{padding:"10px 0",borderTop:`1px solid ${Z.b}`,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{fontSize:11,color:Z.t3,fontWeight:600,
              textTransform:"uppercase",letterSpacing:"0.07em"}}>
              Totale mensile stimato
            </span>
            <span style={{fontSize:15,fontWeight:900,color:"#f87171",
              fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginLeft:8}}>
              -{fmt(totMens)}
            </span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:6}}>
            <span style={{fontSize:10,color:Z.t3,fontWeight:600,
              textTransform:"uppercase",letterSpacing:"0.08em"}}>Costo annuo</span>
            <span style={{fontSize:13,fontWeight:700,color:"#f87171",opacity:0.7,
              fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginLeft:8}}>-{fmt(totAnnuo)}</span>
          </div>
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
  const cfg=(()=>{
    const found=(data.aree||[]).flatMap(a=>a.cat||[])
      .flatMap(cat=>cat.h||[]).find(x=>x.id===h.id);
    return (found&&found.rispCfg)||{};
  })();
  const save=(k,val)=>setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
    cat:(a.cat||[]).map(cat=>({...cat,
      h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,rispCfg:{...(hh.rispCfg||{}),[k]:val}}:hh)
    }))
  }))}));

  const stipendio=parseFloat((cfg.stipendio||"").toString().replace(",","."))||0;
  const spese=parseFloat((cfg.spese||"").toString().replace(",","."))||0;
  const robo=parseFloat((cfg.robo||"").toString().replace(",","."))||0;
  const conto=parseFloat((cfg.conto||"").toString().replace(",","."))||0;
  const backup=stipendio*0.05;
  const netto=stipendio-spese-robo-conto-backup;

  const fmt=n=>n.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})+"€";
  const ROWS=[
    {k:"stipendio",l:"Stipendio",icon:"💼",color:"#00e5a0",readonly:false},
    {k:"spese",    l:"Spese",    icon:"📊",color:"#f87171",readonly:false},
    {k:"robo",     l:"Robo-Advisor",icon:"🤖",color:"#c084fc",readonly:false},
    {k:"conto",    l:"Conto Deposito",icon:"🏦",color:"#38bdf8",readonly:false},
    {k:"backup",   l:"Backup (5%)",icon:"🛡️",color:"#facc15",readonly:true},
  ];

  return(
    <div>
      {ROWS.map(row=>(
        <div key={row.k} style={{display:"flex",alignItems:"center",
          gap:10,marginBottom:8}}>
          <span style={{fontSize:14,flexShrink:0,width:24,textAlign:"center"}}>{row.icon}</span>
          <span style={{fontSize:13,color:Z.t2,flex:1,minWidth:0,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.l}</span>
          <div style={{position:"relative",flexShrink:0}}>
            {row.readonly?(
              <div style={{width:110,background:Z.s3,border:`1px solid ${Z.b}`,
                borderRadius:8,padding:"7px 28px 7px 8px",
                color:row.color,fontSize:13,textAlign:"right",
                fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>
                {fmt(backup)}
              </div>
            ):(
              <input type="number" min={0} step={0.01}
                value={cfg[row.k]||""}
                onChange={e=>save(row.k,e.target.value)}
                placeholder="0,00"
                style={{width:110,background:Z.s2,border:`1px solid ${Z.b}`,
                  borderRadius:8,padding:"7px 28px 7px 8px",
                  color:Z.t,fontSize:13,textAlign:"right",outline:"none"}}/>
            )}
            <span style={{position:"absolute",right:8,top:"50%",
              transform:"translateY(-50%)",fontSize:11,color:Z.t3,
              pointerEvents:"none"}}>€</span>
          </div>
        </div>
      ))}
      {stipendio>0&&(
        <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${Z.b}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:Z.t3,fontWeight:600,
              textTransform:"uppercase",letterSpacing:"0.08em"}}>Importo netto</span>
            <span style={{fontSize:18,fontWeight:900,
              color:netto>=0?"#00e5a0":"#f87171",
              fontFamily:"'JetBrains Mono',monospace"}}>{fmt(netto)}</span>
          </div>
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

function LogRelazione({h,setData}){
  const dims=(()=>{
    // Leggi dimensioni dall'abitudine stessa in data
    return h.dimensioni||[];
  })();

  const cycleS=(dimId)=>{
    const cycle=["green","yellow","orange","red"];
    setData(d=>({...d,aree:(d.aree||[]).map(a=>({...a,
      cat:(a.cat||[]).map(cat=>({...cat,
        h:(cat.h||[]).map(hh=>hh.id===h.id?{...hh,
          dimensioni:(hh.dimensioni||[]).map(dim=>dim.id===dimId
            ?{...dim,s:cycle[(cycle.indexOf(dim.s||"green")+1)%cycle.length]}
            :dim)
        }:hh)
      }))
    }))}));
  };

  if(!dims.length)return null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {dims.map(dim=>{
        const sc=STATUS[dim.s||"green"]||STATUS.green;
        return(
          <div key={dim.id} style={{display:"flex",alignItems:"center",gap:12,
            padding:"10px 12px",background:Z.s2,borderRadius:10,
            border:`1px solid ${Z.b}`}}>
            <button onClick={()=>cycleS(dim.id)}
              style={{width:24,height:24,borderRadius:"50%",flexShrink:0,
                background:sc.c,boxShadow:`0 0 8px ${sc.c}60`,
                border:"none",cursor:"pointer"}}/>
            <span style={{flex:1,fontSize:13,color:Z.t,fontWeight:500}}>{dim.nome}</span>
            <span style={{fontSize:10,color:sc.c,fontWeight:600}}>{sc.l}</span>
          </div>
        );
      })}
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
  const [confirmDelId,setConfirmDelId]=useState(null);
  const confirmTimer=useRef(null);

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
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
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
                <button onClick={()=>{
                    if(confirmDelId===v.id){
                      clearTimeout(confirmTimer.current);
                      setConfirmDelId(null);
                      del(v.id);
                    }else{
                      setConfirmDelId(v.id);
                      clearTimeout(confirmTimer.current);
                      confirmTimer.current=setTimeout(()=>setConfirmDelId(null),2500);
                    }
                  }}
                  style={confirmDelId===v.id?{
                    color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",
                    background:"#f87171",borderRadius:6,whiteSpace:"nowrap"
                  }:{color:"#f87171",fontSize:16,padding:"0 4px",opacity:0.5}}>
                  {confirmDelId===v.id?"Confermi?":"×"}
                </button>
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
  const [showAdvanced,setShowAdvanced] = useState(false);
  const [confirmMsId,setConfirmMsId] = useState(null);
  const confirmMsTimer=useRef(null);
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

      {/* Priorità + Frequenza — riassunto collassato di default */}
      {!showAdvanced?(
        <button onClick={()=>setShowAdvanced(true)}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            width:"100%",padding:"10px 12px",marginBottom:16,
            background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:10,
            cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:STATUS[st].c}}/>
            <span style={{fontSize:12,color:Z.t2,fontWeight:500}}>
              {STATUS[st].l} · {
                freq.type==="daily"?"Ogni giorno":
                freq.type==="weekly"?`${freq.n||3}× a settimana`:
                freq.type==="days"?`${(freq.d||[]).length} giorni fissi`:
                "Libera"
              }
            </span>
          </div>
          <span style={{fontSize:11,color:Z.t3}}>Modifica ›</span>
        </button>
      ):(
      <>
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
      </>
      )}

      {/* Log speciale */}


      {item.logType==="asset"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>💰 Patrimonio del mese</div>
          <LogAsset h={item} logs={logs||{}} onSaveLog={onSaveLog||(()=>{})} data={data||{}} setData={setDataProp}/>
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

      {item.logType==="relazione"&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:8,
            fontFamily:"'JetBrains Mono',monospace"}}>❤️ Dimensioni</div>
          <LogRelazione h={item} setData={setDataProp||(()=>{})}/>
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
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:13,
                  color:st.k==="done"?Z.t3:Z.t,
                  textDecoration:st.k==="done"?"line-through":"none"}}>
                  {m.text}
                </span>
                {m.date&&(
                  <div style={{fontSize:10,color:Z.t3,marginTop:2}}>{m.date}</div>
                )}
              </div>
              <button onClick={()=>{
                  if(confirmMsId===m.id){
                    clearTimeout(confirmMsTimer.current);
                    setConfirmMsId(null);
                    delMs(m.id);
                  }else{
                    setConfirmMsId(m.id);
                    clearTimeout(confirmMsTimer.current);
                    confirmMsTimer.current=setTimeout(()=>setConfirmMsId(null),2500);
                  }
                }}
                style={confirmMsId===m.id?{
                  color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",
                  background:"#f87171",borderRadius:6,whiteSpace:"nowrap",flexShrink:0
                }:{color:Z.t3,fontSize:16,padding:"0 4px",opacity:0.4}}>
                {confirmMsId===m.id?"Confermi?":"×"}
              </button>
            </div>
          );
        })}
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
          <div style={{display:"flex",gap:8}}>
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


function HRow({h,tr,logs,onToggle,onEdit,onLog,onDel,onChangeStatus,compact,showArea,grid,flat}){
  const ts=tod();
  const done=!!((tr[h.id]||{})[ts]);
  const col=flat?SILVER:(AREA_C[h.aId]||SILVER);
  const sc=STATUS[h.s]||STATUS.red;
  const tw=((logs||{})[h.id]||{})[ts];
  const todayWake=tw&&tw.wakeTime;

  // Swipe a destra per completare (solo in modalità griglia)
  const [tx,setTx]=useState(0);
  const [sw,setSw]=useState(false);
  const swX=useRef(0),swS=useRef(0),swY=useRef(0),swLocked=useRef(null);
  const swipeRef=useRef(null);
  const swProg=Math.min(1,tx/32);
  useEffect(()=>{
    if(!grid)return;
    const el=swipeRef.current;if(!el)return;
    const fn=e=>{
      const dx=e.touches[0].clientX-swS.current;
      const dy=e.touches[0].clientY-swY.current;
      if(swLocked.current===null)swLocked.current=Math.abs(dx)>Math.abs(dy)?"h":"v";
      if(swLocked.current==="v"){if(swX.current>2){swX.current=0;setTx(0);}return;}
      e.preventDefault();
      // segue il dito 1:1 fino a 36px, poi elastico (niente muro rigido)
      let cl=dx<0?0:(dx<=36?dx:36+(dx-36)*0.28);
      cl=Math.min(cl,52);
      swX.current=cl;setTx(cl);
    };
    el.addEventListener("touchmove",fn,{passive:false});
    return()=>el.removeEventListener("touchmove",fn);
  },[sw,grid]);

  // Modalità griglia: card verticale dedicata (icona+check in alto, nome sotto)
  if(grid){
    const isNone=h.freq&&h.freq.type==="none";
    return(
      <div ref={swipeRef} style={{position:"relative",overflow:"hidden",borderRadius:10}}>
        {!isNone&&(
          <div style={{position:"absolute",inset:0,display:"flex",
            alignItems:"center",justifyContent:"flex-start",paddingLeft:12,
            background:`rgba(0,229,160,${swProg*0.3})`}}>
            <span style={{fontSize:14,opacity:swProg,color:"#00e5a0"}}>✓</span>
          </div>
        )}
        <div
          onTouchStart={e=>{if(isNone)return;swS.current=e.touches[0].clientX;swY.current=e.touches[0].clientY;swLocked.current=null;setSw(true);}}
          onTouchEnd={()=>{
            if(isNone)return;
            setSw(false);
            if(swX.current>26){onToggle(h.id);if(navigator.vibrate)navigator.vibrate([6,3,6]);}
            swX.current=0;setTx(0);
          }}
          onClick={()=>{if(swX.current===0)onEdit(h);}}
          style={{minHeight:0,minWidth:0,display:"flex",alignItems:"center",
            gap:7,padding:"7px 8px",borderRadius:10,cursor:"pointer",overflow:"hidden",
            background:done?"rgba(255,255,255,0.025)":Z.s1,
            border:`1px solid ${done?"rgba(255,255,255,0.07)":Z.b}`,
            willChange:"transform",
            transform:`translate3d(${tx}px,0,0)`,
            transition:sw?"none":"transform 0.2s ease-out",
            ...(flat?{}:{borderLeftWidth:3,borderLeftColor:`${col}80`})}}>
        {isNone?(
          <div style={{position:"relative",width:15,height:15,flexShrink:0}}>
            <button
              onClick={e=>{e.stopPropagation();
                if(onChangeStatus){
                  const cycle=["red","orange","yellow","green"];
                  const cur=cycle.indexOf(h.s||"red");
                  onChangeStatus(h.id,cycle[(cur+1)%cycle.length]);
                }}}
              style={{position:"absolute",inset:-9,background:"transparent",
                border:"none",cursor:"pointer",padding:0}}/>
            <span style={{width:15,height:15,borderRadius:"50%",display:"block",
              background:sc.c,boxShadow:`0 0 5px ${sc.c}60`,pointerEvents:"none"}}/>
          </div>
        ):(
          <div style={{position:"relative",width:15,height:15,flexShrink:0}}>
            <button onClick={e=>{e.stopPropagation();onToggle(h.id);}}
              style={{position:"absolute",inset:-9,background:"transparent",
                border:"none",cursor:"pointer",padding:0}}/>
            <span style={{width:15,height:15,borderRadius:"50%",display:"flex",
              alignItems:"center",justifyContent:"center",boxSizing:"border-box",
              background:done?sc.c:sc.c+"18",border:`2px solid ${sc.c}`,
              pointerEvents:"none"}}>
              {done&&<span style={{color:"#0a0a0a",fontSize:8,fontWeight:900}}>{"✓"}</span>}
            </span>
          </div>
        )}
        <span style={{fontSize:14,lineHeight:1,flexShrink:0}}>{h.icon||"●"}</span>
        <div style={{fontSize:11.5,fontWeight:done?400:500,flex:1,minWidth:0,
          color:done?Z.t3:Z.t,textDecoration:done?"line-through":"none",
          lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {h.nome}
        </div>
        </div>
      </div>
    );
  }

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
          <div style={{width:18,height:18,borderRadius:"50%",
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
          <div style={{width:18,height:18,borderRadius:"50%",
            background:done?sc.c:sc.c+"18",
            border:`2.5px solid ${sc.c}`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            {done&&<span style={{color:"#0a0a0a",fontSize:10,fontWeight:900}}>{"✓"}</span>}
          </div>
        </button>
      )}

      {/* Contenuto */}
      <div style={{flex:1,display:"flex",alignItems:"center",gap:8,
        padding:compact?"9px 12px":"10px 12px",minWidth:0,cursor:"pointer"}}
        onClick={()=>onEdit(h)}>

        {h.icon&&<span style={{fontSize:18,flexShrink:0,lineHeight:1}}>{h.icon}</span>}

        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:13,fontWeight:done?400:500,
            color:done?Z.t3:Z.t,
            textDecoration:done?"line-through":"none",
            lineHeight:"20px",
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
            padding:"2px 6px",border:`1px solid ${col}50`,background:"transparent",borderRadius:5,
            whiteSpace:"nowrap",flexShrink:0}}>
            {h.cN}
          </span>
        )}


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
        <svg viewBox="-42 -16 310 258" style={{display:"block",width:"100%"}}>
          <defs>
            <radialGradient id="vgrd" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.09"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="elemRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#facc15"/>
              <stop offset="35%" stopColor="#f97316"/>
              <stop offset="70%" stopColor="#84cc16"/>
              <stop offset="100%" stopColor="#38bdf8"/>
            </linearGradient>
          </defs>

          {VITA_AREE.map((area,ai)=>{
            const{s,e}=areaA[ai];
            const x1=f2(CX+R*Math.cos(s)),y1=f2(CY+R*Math.sin(s));
            const x2=f2(CX+R*Math.cos(e)),y2=f2(CY+R*Math.sin(e));
            return(
              <path key={ai}
                d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`}
                fill={area.color} opacity={openArea===area.id?0.32:0.16}
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
            <path d={snapPoly} fill="rgba(201,168,38,0.08)"
              stroke="#c9a826" strokeWidth={1.5}
              strokeDasharray="4 2" strokeLinejoin="round"/>
          )}

          <path d={poly} fill="url(#vgrd)"
            stroke="rgba(255,255,255,0.85)" strokeWidth={2.5}
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
            const lr=R*0.78,lx=CX+lr*Math.cos(x.ang),ly=CY+lr*Math.sin(x.ang);
            const cA=Math.cos(x.ang),sA=Math.sin(x.ang);
            const anchor=cA>0.4?"start":cA<-0.4?"end":"middle";
            const dy=sA>0.3?10:sA<-0.3?-2:4;
            return(
              <text key={`l${i}`} x={f2(lx)} y={f2(ly+dy)}
                textAnchor={anchor} fontSize={8} fontWeight={800}
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
                  background:selSnap===null?"rgba(255,255,255,0.06)":"transparent",
                  border:`1px solid rgba(255,255,255,${selSnap===null?"0.2":"0.05"})`,
                  color:selSnap===null?Z.t:Z.t3,
                  display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",
                    background:"rgba(255,255,255,0.7)",flexShrink:0,display:"inline-block"}}/>
                  Attuale</button>
            )}
            {snapshots.map((snap,i)=>(
              <div key={i} style={{display:"flex",flexShrink:0}}>
                <button onClick={()=>setSelSnap(selSnap===i?null:i)}
                  style={{padding:"4px 9px",borderRadius:"7px 0 0 7px",fontSize:10,
                    whiteSpace:"nowrap",
                    background:selSnap===i?"rgba(201,168,38,0.1)":"transparent",
                    border:`1px solid ${selSnap===i?"rgba(201,168,38,0.4)":"rgba(255,255,255,0.07)"}`,
                    borderRight:"none",color:selSnap===i?"#c9a826":Z.t3,
                    display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:7,height:7,borderRadius:"50%",
                      background:selSnap===i?"#c9a826":"rgba(255,255,255,0.2)",
                      flexShrink:0,display:"inline-block"}}/>
                    {snap.date}</button>
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
                <div style={{height:3,background:Z.b2,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${score*10}%`,
                    background:area.color,borderRadius:2,transition:"width 0.4s"}}/>
                </div>
              </div>
              <div style={{padding:"9px 13px"}}>
                {area.cat.map((cat,ci)=>{
                  const v=scores[cat.id]||0;
                  const vc=v>=7?area.color:v>=4?"#facc15":"#f87171";
                  return(
                    <div key={cat.id} style={{display:"flex",alignItems:"center",
                      gap:5,marginBottom:ci<2?6:0}}>
                      <span style={{fontSize:11,flexShrink:0}}>{cat.icon}</span>
                      <span style={{fontSize:11,color:Z.t3,flex:1,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat.nome}</span>
                      <span style={{fontSize:12,fontWeight:700,color:vc,
                        fontFamily:"'JetBrains Mono',monospace",
                        flexShrink:0,minWidth:18,textAlign:"right"}}>{v}</span>
                    </div>
                  );
                })}
              </div>
              {sel&&(
                <div style={{borderTop:`1px solid ${Z.b}`,padding:"10px 13px 13px"}}>
                  {area.cat.map(cat=>{
                    const v=scores[cat.id]||0;
                    return(
                      <div key={cat.id} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",
                          alignItems:"center",marginBottom:5}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:12}}>{cat.icon}</span>
                            <span style={{fontSize:12,color:Z.t2}}>{cat.nome}</span>
                          </div>
                          <span style={{fontSize:13,fontWeight:800,color:area.color,
                            fontFamily:"'JetBrains Mono',monospace"}}>{v}/10</span>
                        </div>
                        <SliderCustom value={v} min={0} max={10} step={1}
                          color={area.color} onChange={v=>setScore(cat.id,v)}/>
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


function AddInArea({area,onAdd,color}){
  const [catId,setCatId]=useState((area.cat[0]&&area.cat[0].id)||"");
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
            borderRadius:10,padding:"9px 12px",color:Z.t,fontSize:14,
            outline:"none",WebkitTextSizeAdjust:"100%"}}/>
        <button onClick={go}
          style={{padding:"9px 14px",background:name.trim()?color:Z.b,
            borderRadius:10,color:name.trim()?"white":Z.t3,
            fontSize:14,fontWeight:600,transition:"all 0.15s",
            flexShrink:0}}>{"+"}
        </button>
      </div>
    </div>
  );
}

//  ABITUDINI SCREEN — Card aree + lista filtrata 
function Abitudini({data,tr,logs,onToggle,onEdit,onLog,onAdd,onDel,onChangeStatus,addingH,setAddingH}){
  const [filterArea,setFilterArea]=useState(null);
  const [openCats,setOpenCats]=useState({});
  const isCatOpen=catId=>openCats[catId]!==false;

  const today=tod();
  const SPECIAL_LOGS=["asset","spese","risparmi"];
  const visibleH=data.aree.flatMap(area=>
    area.cat.flatMap(cat=>
      (cat.h||[]).map(h=>({...h,aId:area.id,aN:area.nome,
        cId:cat.id,cN:cat.nome,color:area.color}))
    )
  ).filter(h=>(!filterArea||h.aId===filterArea));

  const byCat=[];
  let lastCat=null;
  visibleH.forEach(h=>{
    if(h.cId!==lastCat){
      byCat.push({catId:h.cId,catNome:h.cN,color:h.color,habits:[],
        done:0,expected:0});
      lastCat=h.cId;
    }
    const grp=byCat[byCat.length-1];
    grp.habits.push(h);
    if(isExpected(h,today))grp.expected++;
    if((tr[h.id]||{})[today])grp.done++;
  });

  const toggleAll=()=>{
    const anyOpen=byCat.some(g=>isCatOpen(g.catId));
    if(anyOpen){
      const next={};
      byCat.forEach(g=>{next[g.catId]=false;});
      setOpenCats(next);
    }else{
      setOpenCats({});
    }
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,
          margin:0,letterSpacing:"-0.4px"}}>Abitudini</h1>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggleAll}
            style={{padding:"6px 12px",borderRadius:8,
              background:"rgba(200,200,212,0.08)",
              border:"1px solid rgba(200,200,212,0.2)",
              color:SILVER,fontSize:12,fontWeight:600}}>
            {byCat.some(g=>isCatOpen(g.catId))?"↑ Chiudi":"↓ Espandi"}
          </button>
          <button onClick={()=>{setAddingH(true);}}
            style={{width:32,height:32,borderRadius:"50%",
              background:"rgba(200,200,212,0.1)",
              border:"1px solid rgba(200,200,212,0.25)",
              color:SILVER_BRIGHT,fontSize:20,fontWeight:300,
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0}}>+</button>
        </div>
      </div>

      {/* Filtro aree */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <button onClick={()=>setFilterArea(null)}
          style={{flex:1,padding:"6px 4px",borderRadius:10,
            background:!filterArea?"rgba(210,210,220,0.15)":"rgba(255,255,255,0.04)",
            border:"1.5px solid "+(!filterArea?"rgba(210,210,220,0.5)":"rgba(255,255,255,0.08)"),
            display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
          <span style={{fontSize:14,lineHeight:1,color:!filterArea?SILVER_BRIGHT:"rgba(255,255,255,0.4)"}}>✦</span>
          <span style={{fontSize:9,fontWeight:600,
            color:!filterArea?SILVER_BRIGHT:Z.t3}}>Tutte</span>
        </button>
        {data.aree.map(a=>{
          const sel=filterArea===a.id;
          return(
            <button key={a.id} onClick={()=>setFilterArea(sel?null:a.id)}
              style={{flex:1,padding:"6px 4px",borderRadius:10,
                background:sel?`linear-gradient(135deg, ${a.color}45, ${a.color}1c)`:`${a.color}12`,
                border:"1.5px solid "+(sel?a.color:a.color+"35"),
                boxShadow:sel?`0 0 12px ${a.color}40`:"none",
                display:"flex",flexDirection:"column",alignItems:"center",gap:1,
                transition:"background 0.15s, border-color 0.15s, box-shadow 0.15s"}}>
              <span style={{fontSize:14,lineHeight:1}}>{a.icon||"●"}</span>
              <span style={{fontSize:9,fontWeight:600,
                color:sel?a.color:Z.t2}}>{a.nome}</span>
            </button>
          );
        })}
      </div>

      {/* Lista categorie */}
      {byCat.length===0&&(
        <div style={{background:Z.s1,borderRadius:14,
          border:"1px solid rgba(255,255,255,0.05)",
          textAlign:"center",padding:"24px 20px",color:Z.t2,fontSize:13}}>
        </div>
      )}
      {byCat.length>0&&byCat.map((grp,gi)=>(
        <div key={grp.catId} style={{background:Z.s1,
          border:"none",borderRadius:14,borderLeft:`3px solid ${grp.color}50`,
          overflow:"hidden",marginBottom:gi<byCat.length-1?8:0}}>
          <div onClick={()=>setOpenCats(o=>({...o,[grp.catId]:!isCatOpen(grp.catId)}))}
            style={{padding:"7px 12px 6px",display:"flex",
              alignItems:"center",gap:8,
              background:`linear-gradient(90deg, ${grp.color}26, transparent 70%)`,
              borderBottom:isCatOpen(grp.catId)?`1px solid ${grp.color}30`:"none",
              cursor:"pointer"}}>
            <div style={{width:7,height:7,borderRadius:"50%",
              background:grp.color,flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:600,
              color:grp.color,letterSpacing:"0.01em",
              flex:1}}>
              {grp.catNome}
            </span>


            <span style={{fontSize:12,color:Z.t3,opacity:0.5,
              display:"inline-block",
              transform:isCatOpen(grp.catId)?"rotate(90deg)":"none",
              transition:"transform 0.2s"}}>›</span>
          </div>
          {isCatOpen(grp.catId)&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:5,
              padding:"5px 5px 4px"}}>
              {grp.habits.map(h=>(
                <HRow key={h.id} h={h} tr={tr} logs={logs}
                  onToggle={onToggle}
                  onEdit={()=>onEdit({...h})}
                  onLog={hLog=>onLog&&onLog({...hLog,aId:h.aId})}
                  onChangeStatus={onChangeStatus}
                  onDel={onDel}
                  compact showArea={false} grid/>
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}


function TaskScreen({data,setData,onAdd,showToast,onEditTask}){
  const [showDone,setShowDone]=useState(true);
  const tog=id=>setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const del=id=>{
    const backup=(data.tasks||[]).find(t=>t.id===id);
    setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));
    if(showToast)showToast("Task eliminato");
  };
  const delAllDone=()=>{
    setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>!t.done)}));
    if(showToast)showToast("Task completati eliminati");
  };
  const tasks=data.tasks||[];
  const pend=useMemo(()=>tasks.filter(t=>!t.done).sort((a,b)=>{
    if(!a.deadline&&!b.deadline)return 0;
    if(!a.deadline)return 1;
    if(!b.deadline)return -1;
    return a.deadline.localeCompare(b.deadline);
  }),[tasks]);
  const dn=useMemo(()=>tasks.filter(t=>t.done),[tasks]);
  const urg=useMemo(()=>pend.filter(t=>(fmtDL(t.deadline)||{}).u),[pend]);

  // Gruppi per scadenza (gli scaduti rientrano in "Oggi", indicati solo dalla data in rosso)
  const todayStr=tod();
  const endWeek=new Date();endWeek.setDate(endWeek.getDate()+7);
  const endWeekStr=endWeek.toISOString().split("T")[0];
  const taskGroups=pend.length?[
    {key:"oggi",   label:"Oggi",            items:pend.filter(t=>urg.includes(t)||t.deadline===todayStr)},
    {key:"sett",   label:"Questa settimana", items:pend.filter(t=>!urg.includes(t)&&t.deadline&&t.deadline>todayStr&&t.deadline<=endWeekStr)},
    {key:"dopo",   label:"Prossimamente",    items:pend.filter(t=>!urg.includes(t)&&t.deadline&&t.deadline>endWeekStr)},
    {key:"nodata", label:"Senza data",        items:pend.filter(t=>!urg.includes(t)&&!t.deadline)},
  ].filter(g=>g.items.length>0):[];

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,
            letterSpacing:"-0.4px"}}>Task</h1>


        </div>
        <button onClick={onAdd}
          style={{padding:"9px 18px",background:SILVER,border:"none",
            borderRadius:20,color:"#0a0a0a",fontSize:13,fontWeight:700}}>
          + Aggiungi
        </button>
      </div>

      {tasks.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:Z.s1,
          borderRadius:14,border:`1px solid ${Z.b}`}}>
          <div style={{fontSize:18,fontWeight:700,color:Z.t,marginBottom:6}}>
            Nessun task
          </div>
          <div style={{fontSize:14,color:Z.t2}}>Tocca + per aggiungere</div>
        </div>
      )}

      {/* Gruppi per scadenza */}
      {taskGroups.map(grp=>(
        <div key={grp.key} style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:Z.t3,
            letterSpacing:"0.07em",textTransform:"uppercase",
            fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>
            {grp.label} · {grp.items.length}
          </div>
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
            borderRadius:12,overflow:"hidden"}}>
            {grp.items.map((t,i)=>(
              <div key={t.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
                <SwipeTask t={t} onToggle={tog}
                  onEdit={onEditTask||(()=>{})}
                  onDelete={del} aree={data.aree}/>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Completati */}
      {dn.length>0&&(
        <div style={{marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",
            justifyContent:"space-between",marginBottom:4}}>
            <button onClick={()=>setShowDone(v=>!v)}
              style={{fontSize:12,color:Z.t3,padding:"4px 0",
                display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:10,display:"inline-block",
                transform:showDone?"rotate(90deg)":"none",
                transition:"transform 0.2s"}}>›</span>
              Completati · {dn.length}
            </button>
            {showDone&&(
              <button onClick={delAllDone}
                style={{fontSize:11,color:"#f87171",padding:"4px 8px",
                  background:"rgba(248,113,113,0.08)",
                  border:"1px solid rgba(248,113,113,0.2)",borderRadius:6}}>
                Elimina tutti
              </button>
            )}
          </div>
          {showDone&&(
            <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
              borderRadius:12,overflow:"hidden",opacity:0.7}}>
              {dn.map((t,i)=>(
                <div key={t.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
                  <SwipeTask t={t} onToggle={tog}
                    onEdit={onEditTask||(()=>{})}
                    onDelete={del} aree={data.aree}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalCard({g,openG,setOpenG,addTo,setAddTo,newT,setNewT,togT,delT,addT,updT,pctColor,setEditG}){
  const gt=g.tasks||[];
  const avgPct=gt.length?Math.round(gt.reduce((s,t)=>s+(t.pct!==undefined?t.pct:(t.done?100:0)),0)/gt.length):null;
  const tp=avgPct;
  const pc=tp!==null?pctColor(tp):"rgba(140,140,155,0.4)";
  const dl=g.deadline?fmtDL(g.deadline):null;
  const isOpen=openG===g.id;
  const done100=tp!==null&&tp>=100;
  const [editingTId,setEditingTId]=useState(null);
  const [editTxt,setEditTxt]=useState("");
  const [activeSlider,setActiveSlider]=useState(null);

  return(
    <div style={{marginBottom:8,borderRadius:14,
      border:`1px solid rgba(255,255,255,${isOpen?"0.08":"0.05"})`,
      background:"rgba(255,255,255,0.02)"}}>

      {/* Header obiettivo */}
      <div onClick={()=>setOpenG(isOpen?null:g.id)}
        style={{display:"flex",alignItems:"center",gap:12,
          padding:"12px 14px",cursor:"pointer"}}>

        {/* Cerchio progresso */}
        <div style={{width:36,height:36,flexShrink:0,position:"relative",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={36} height={36} style={{position:"absolute",top:0,left:0}}>
            <circle cx={18} cy={18} r={14} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth={2.5}/>
            <circle cx={18} cy={18} r={14} fill="none"
              stroke={done100?"#00e5a0":pc} strokeWidth={2.5}
              strokeDasharray={`${(2*Math.PI*14*(done100?1:(tp||0)/100)).toFixed(1)} ${(2*Math.PI*14).toFixed(1)}`}
              strokeLinecap="round" transform="rotate(-90 18 18)"/>
          </svg>
          <span style={{fontSize:9,fontWeight:800,
            color:done100?"#00e5a0":pc,
            fontFamily:"'JetBrains Mono',monospace",position:"relative"}}>
            {done100?"✓":(tp!==null?tp:"")}
          </span>
        </div>

        {/* Testo + barra */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:600,
            color:done100?"#00e5a0":Z.t,
            textDecoration:done100?"line-through":"none",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
            marginBottom:gt.length?5:0}}>
            {g.icon&&<span style={{marginRight:6}}>{g.icon}</span>}
            {g.text}
          </div>
          {gt.length>0&&(
            <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:1,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${tp||0}%`,
                background:done100?"#00e5a0":pc,
                borderRadius:1,transition:"width 0.4s"}}/>
            </div>
          )}
          {dl&&(
            <div style={{fontSize:10,color:dl.u?"#f87171":"rgba(250,204,21,0.7)",
              marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>
              {dl.txt}
            </div>
          )}
        </div>

        {/* Azioni header */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();setEditG(g);}}
            style={{background:"transparent",border:"none",
              color:"rgba(255,255,255,0.2)",fontSize:15,padding:"4px",
              cursor:"pointer",lineHeight:1}}>⋯</button>
          <span style={{fontSize:14,color:Z.t3,opacity:0.4,
            transform:isOpen?"rotate(90deg)":"none",
            transition:"transform 0.2s",display:"inline-block"}}>›</span>
        </div>
      </div>

      {/* Traguardi espansi */}
      {isOpen&&(
        <div style={{borderTop:`1px solid rgba(255,255,255,0.05)`}}>

          {gt.length===0&&addTo!==g.id&&(
            <div style={{padding:"12px 14px"}}>
              <span style={{fontSize:12,color:Z.t3,fontStyle:"italic"}}>Nessun traguardo — aggiungine uno</span>
            </div>
          )}

          {gt.map((t,i)=>{
            const tpct=t.pct!==undefined?t.pct:(t.done?100:0);
            const tc=pctColor(tpct);
            const isSliderOpen=activeSlider===t.id;
            return(
              <div key={t.id}
                style={{padding:"10px 14px",
                  borderTop:i===0?"none":`1px solid rgba(255,255,255,0.04)`}}>

                {/* Riga principale */}
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {/* Frecce riordino */}
                  <div style={{display:"flex",flexDirection:"column",flexShrink:0}}>
                    <button onClick={e=>{e.stopPropagation();
                      if(i===0)return;
                      const arr=[...gt];arr.splice(i-1,0,arr.splice(i,1)[0]);
                      updT(g.id,arr,"reorder");}}
                      style={{background:"transparent",border:"none",padding:"1px 4px",
                        color:i===0?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.35)",
                        fontSize:11,lineHeight:1,cursor:i===0?"default":"pointer"}}>▲</button>
                    <button onClick={e=>{e.stopPropagation();
                      if(i===gt.length-1)return;
                      const arr=[...gt];arr.splice(i+1,0,arr.splice(i,1)[0]);
                      updT(g.id,arr,"reorder");}}
                      style={{background:"transparent",border:"none",padding:"1px 4px",
                        color:i===gt.length-1?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.35)",
                        fontSize:11,lineHeight:1,cursor:i===gt.length-1?"default":"pointer"}}>▼</button>
                  </div>
                  {/* Check */}
                  <button onClick={e=>{e.stopPropagation();
                    updT(g.id,{...t,pct:tpct>=100?0:100,done:tpct<100});}}
                    style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
                      background:tpct>=100?tc:"transparent",
                      border:`2px solid ${tc}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer"}}>
                    {tpct>=100&&<span style={{color:"#0a0a0a",fontSize:9,fontWeight:900}}>✓</span>}
                  </button>

                  {/* Nome */}
                  {editingTId===t.id?(
                    <input value={editTxt}
                      onChange={e=>setEditTxt(e.target.value)}
                      onBlur={()=>{if(editTxt.trim())updT(g.id,{...t,text:editTxt.trim()});setEditingTId(null);}}
                      onKeyDown={e=>{if(e.key==="Enter"){if(editTxt.trim())updT(g.id,{...t,text:editTxt.trim()});setEditingTId(null);}if(e.key==="Escape")setEditingTId(null);}}
                      autoFocus onClick={e=>e.stopPropagation()}
                      style={{flex:1,background:"transparent",border:"none",
                        borderBottom:`1px solid ${tc}`,color:Z.t,fontSize:13,
                        outline:"none",padding:"0 0 2px"}}/>
                  ):(
                    <span onDoubleClick={()=>{setEditingTId(t.id);setEditTxt(t.text);}}
                      style={{flex:1,fontSize:13,color:tpct>=100?Z.t3:Z.t,
                        textDecoration:tpct>=100?"line-through":"none",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {t.text}
                    </span>
                  )}

                  {/* % toccabile per aprire slider */}
                  <button onClick={e=>{e.stopPropagation();
                    setActiveSlider(prev=>prev===t.id?null:t.id);}}
                    style={{background:isSliderOpen?`${tc}20`:"transparent",
                      border:`1px solid ${isSliderOpen?tc:"transparent"}`,
                      borderRadius:6,padding:"2px 6px",
                      fontSize:11,fontWeight:700,color:tc,
                      fontFamily:"'JetBrains Mono',monospace",
                      flexShrink:0,cursor:"pointer"}}>
                    {tpct}%
                  </button>

                  {/* Elimina */}
                  <button onClick={e=>{e.stopPropagation();delT(g.id,t.id);}}
                    style={{background:"transparent",border:"none",
                      color:Z.t3,fontSize:16,opacity:0.25,
                      padding:"0 2px",flexShrink:0,lineHeight:1,cursor:"pointer"}}>×</button>
                </div>

                {/* Slider — solo quando aperto */}
                {isSliderOpen&&(
                  <div onClick={e=>{e.stopPropagation();e.preventDefault();}}
                    onTouchStart={e=>e.stopPropagation()}
                    style={{marginTop:8,paddingLeft:10,paddingRight:4,paddingBottom:4}}>
                    <MiniSlider value={tpct} color={tc} bg={Z.b2}
                      onChange={v=>updT(g.id,{...t,pct:v,done:v>=100})}/>
                  </div>
                )}
              </div>
            );
          })}

          {/* Aggiungi traguardo */}
          {addTo===g.id?(
            <div style={{display:"flex",gap:8,padding:"10px 14px",
              borderTop:`1px solid rgba(255,255,255,0.05)`}}
              onClick={e=>e.stopPropagation()}>
              <input value={newT} onChange={e=>setNewT(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addT(g.id);if(e.key==="Escape"){setAddTo(null);setNewT("");}}}
                placeholder="Nome traguardo..." autoFocus
                style={{flex:1,background:Z.s2,border:`1px solid ${Z.b2}`,
                  borderRadius:8,padding:"8px 10px",color:Z.t,fontSize:13,outline:"none"}}/>
              <button onClick={()=>addT(g.id)}
                style={{padding:"8px 14px",background:pc,borderRadius:8,
                  color:"#0a0a0a",fontSize:14,fontWeight:700,border:"none"}}>+</button>
              <button onClick={()=>{setAddTo(null);setNewT("");}}
                style={{padding:"8px 10px",background:Z.s1,borderRadius:8,
                  color:Z.t3,fontSize:13,border:"none"}}>✕</button>
            </div>
          ):(
            <button onClick={e=>{e.stopPropagation();setAddTo(g.id);setNewT("");}}
              style={{width:"100%",padding:"10px 14px",background:"transparent",
                border:"none",borderTop:`1px solid rgba(255,255,255,0.05)`,
                fontSize:12,color:Z.t3,textAlign:"left",cursor:"pointer",
                display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,lineHeight:1}}>+</span>
              <span>Aggiungi traguardo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function wScr(habits,tr,n){
  // Week score: % abitudini completate negli ultimi 7 giorni
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-i);
    return d.toISOString().split("T")[0];
  });
  const exp=habits.filter(h=>h.freq&&h.freq.type!=="none");
  if(!exp.length)return 0;
  let tot=0,done=0;
  days.forEach(day=>{
    exp.forEach(h=>{
      if(h.freq.type==="daily"||(h.freq.type==="weekly")){tot++;if((tr[h.id]||{})[day])done++;}
    });
  });
  return tot?Math.round(done/tot*100):0;
}

function Obiettivi({data,setData,showToast,editG,setEditG,newG,setNewG}){
  const pctColor=p=>{
    if(p===0)return"rgba(140,140,155,0.5)";
    if(p<50){const t=p/50;return`rgb(${Math.round(248+(250-248)*t)},${Math.round(113+(204-113)*t)},${Math.round(113+(21-113)*t)})`;}
    if(p<100){const t=(p-50)/50;return`rgb(${Math.round(250*(1-t))},${Math.round(204+(229-204)*t)},${Math.round(21+(160-21)*t)})`;}
    return"#00e5a0";
  };
  const [openG,setOpenG]=useState(null);
  const [addTo,setAddTo]=useState(null);
  const [newT,setNewT]=useState("");
  const [newDream,setNewDream]=useState("");
  const [dreams,setDreams]=useState(()=>{try{return JSON.parse(localStorage.getItem("m-dreams")||"[]");}catch{return[];}});
  const saveDream=()=>{if(!newDream.trim())return;const d=[{id:uid(),text:newDream.trim(),ts:Date.now()},...dreams];setDreams(d);localStorage.setItem("m-dreams",JSON.stringify(d));setNewDream("");};
  const delDream=id=>{const d=dreams.filter(x=>x.id!==id);setDreams(d);localStorage.setItem("m-dreams",JSON.stringify(d));};

  const updT=(gId,updatedTask,mode)=>setData(d=>({...d,goals:d.goals.map(g=>{
    if(g.id!==gId)return g;
    const tasks=mode==="reorder"?updatedTask:(g.tasks||[]).map(t=>t.id===updatedTask.id?updatedTask:t);
    const avg=tasks.length?Math.round(tasks.reduce((s,t)=>{
      const v=t.pct!==undefined?t.pct:(t.done?100:0);
      return s+v;
    },0)/tasks.length):0;
    return{...g,tasks,pct:avg};
  })}));
  const togT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>{
    if(g.id!==gId)return g;
    const tasks=(g.tasks||[]).map(t=>t.id===tId?{...t,done:!t.done,pct:t.done?0:100}:t);
    const avg=tasks.length?Math.round(tasks.reduce((s,t)=>s+(t.pct||0),0)/tasks.length):0;
    return{...g,tasks,pct:avg};
  })}));
  const delT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>{
    if(g.id!==gId)return g;
    const tasks=(g.tasks||[]).filter(t=>t.id!==tId);
    const avg=tasks.length?Math.round(tasks.reduce((s,t)=>s+(t.pct!==undefined?t.pct:(t.done?100:0)),0)/tasks.length):0;
    return{...g,tasks,pct:avg};
  })}));
  const addT=gId=>{
    if(!newT.trim())return;
    setData(d=>({...d,goals:d.goals.map(g=>{
      if(g.id!==gId)return g;
      const tasks=[...(g.tasks||[]),{id:uid(),text:newT.trim(),done:false,pct:0}];
      const avg=tasks.length?Math.round(tasks.reduce((s,t)=>s+(t.pct!==undefined?t.pct:(t.done?100:0)),0)/tasks.length):0;
      return{...g,tasks,pct:avg};
    })}));
    setNewT("");
  };

  const CARD={openG,setOpenG,addTo,setAddTo,newT,setNewT,togT,delT,addT,updT,pctColor,setEditG};
  const goals=data.goals||[];
  const active=goals.filter(g=>!(g.tasks||[]).length||(g.tasks||[]).some(t=>!t.done));
  const done=goals.filter(g=>(g.tasks||[]).length>0&&(g.tasks||[]).every(t=>t.done));

  return(
    <div style={{paddingBottom:20}}>
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,
          letterSpacing:"-0.4px"}}>Obiettivi</h1>
        <button onClick={()=>setNewG(true)}
          style={{padding:"8px 16px",background:"rgba(250,204,21,0.08)",
            border:"1px solid rgba(250,204,21,0.2)",borderRadius:20,
            color:"#facc15",fontSize:13,fontWeight:700}}>+ Nuovo</button>
      </div>

      {goals.length===0&&(
        <div style={{textAlign:"center",padding:"48px 20px",
          background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14}}>
          <div style={{fontSize:36,marginBottom:10}}>🎯</div>
          <div style={{fontSize:16,fontWeight:700,color:Z.t,marginBottom:6}}>
            Nessun obiettivo
          </div>
          <div style={{fontSize:13,color:Z.t2,lineHeight:1.6,marginBottom:16}}>
            Crea un obiettivo e traccia i tuoi progressi
          </div>
          <button onClick={()=>setNewG(true)}
            style={{padding:"10px 24px",background:"#facc15",border:"none",
              borderRadius:10,color:"#0a0a0a",fontSize:13,fontWeight:700}}>
            Crea obiettivo
          </button>
        </div>
      )}

      {active.length>0&&(
        <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
          borderRadius:12,overflow:"hidden",marginBottom:4}}>
          <div style={{padding:"7px 12px 6px",borderBottom:`1px solid ${Z.b}`,
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,fontWeight:700,color:SILVER,
              letterSpacing:"0.05em",textTransform:"uppercase",
              fontFamily:"'JetBrains Mono',monospace"}}>
              In corso · {active.length}
            </span>
          </div>
          {active.map((g,i)=>(
            <div key={g.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
              <GoalCard g={g}
                openG={CARD.openG} setOpenG={CARD.setOpenG}
                addTo={CARD.addTo} setAddTo={CARD.setAddTo}
                newT={CARD.newT} setNewT={CARD.setNewT}
                togT={CARD.togT} delT={CARD.delT} addT={CARD.addT}
                updT={CARD.updT} pctColor={CARD.pctColor} setEditG={CARD.setEditG}/>
            </div>
          ))}
        </div>
      )}

      {done.length>0&&(
        <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
          borderRadius:12,overflow:"hidden",opacity:0.6}}>
          <div style={{padding:"7px 12px 6px",borderBottom:`1px solid ${Z.b}`}}>
            <span style={{fontSize:11,fontWeight:700,color:"#00e5a0",
              letterSpacing:"0.05em",textTransform:"uppercase",
              fontFamily:"'JetBrains Mono',monospace"}}>
              Completati · {done.length}
            </span>
          </div>
          {done.map((g,i)=>(
            <div key={g.id} style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
              <GoalCard g={g}
                openG={CARD.openG} setOpenG={CARD.setOpenG}
                addTo={CARD.addTo} setAddTo={CARD.setAddTo}
                newT={CARD.newT} setNewT={CARD.setNewT}
                togT={CARD.togT} delT={CARD.delT} addT={CARD.addT}
                updT={CARD.updT} pctColor={CARD.pctColor} setEditG={CARD.setEditG}/>
            </div>
          ))}
        </div>
      )}
      {/* Angolo dei Sogni */}
      <div style={{marginTop:24,borderRadius:20,overflow:"hidden",
        background:"linear-gradient(135deg,rgba(139,92,246,0.08) 0%,rgba(196,181,253,0.04) 50%,rgba(99,102,241,0.08) 100%)",
        border:"1px solid rgba(196,181,253,0.12)",
        position:"relative"}}>

        {/* Luna decorativa */}
        <svg style={{position:"absolute",top:12,right:16,opacity:0.12,pointerEvents:"none"}}
          width={40} height={40} viewBox="0 0 40 40">
          <path d="M28 20a12 12 0 1 1-12-12 9 9 0 0 0 12 12z"
            fill="rgba(196,181,253,1)" />
        </svg>

        {/* Header */}
        <div style={{padding:"18px 18px 12px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{"✨"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,
              color:"rgba(196,181,253,0.9)",
              letterSpacing:"0.06em",textTransform:"uppercase"}}>
              Angolo dei Sogni
            </div>
            <div style={{fontSize:11,color:"rgba(196,181,253,0.4)",marginTop:2}}>
              Idee per il futuro
            </div>
          </div>
        </div>

        {/* Lista sogni */}
        {dreams.length===0&&(
          <div style={{padding:"12px 18px 16px",
            fontSize:12,color:"rgba(196,181,253,0.3)",fontStyle:"italic"}}>
            I tuoi sogni appariranno qui...
          </div>
        )}
        {dreams.map((d,i)=>(
          <div key={d.id} style={{display:"flex",alignItems:"center",gap:10,
            padding:"10px 18px",
            borderTop:`1px solid rgba(196,181,253,0.07)`}}>
            <span style={{color:"rgba(196,181,253,0.4)",fontSize:10,flexShrink:0}}>{"◇"}</span>
            <span style={{fontSize:13,color:"rgba(220,215,255,0.8)",flex:1,lineHeight:1.5}}>
              {d.text}
            </span>
            <button onClick={()=>delDream(d.id)}
              style={{color:"rgba(196,181,253,0.25)",fontSize:16,padding:"0 2px",
                flexShrink:0,background:"transparent",border:"none",cursor:"pointer"}}>{"×"}</button>
          </div>
        ))}

        {/* Input */}
        <div style={{display:"flex",gap:8,padding:"12px 16px 16px",
          borderTop:`1px solid rgba(196,181,253,0.08)`}}>
          <input value={newDream} onChange={e=>setNewDream(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&saveDream()}
            placeholder="Un sogno, un desiderio, un'idea..."
            style={{flex:1,background:"rgba(139,92,246,0.06)",
              border:"1px solid rgba(196,181,253,0.15)",
              borderRadius:12,padding:"9px 12px",
              color:"rgba(220,215,255,0.9)",fontSize:13,outline:"none"}}/>
          <button onClick={saveDream}
            style={{width:38,height:38,borderRadius:12,flexShrink:0,
              background:"rgba(139,92,246,0.15)",
              border:"1px solid rgba(196,181,253,0.25)",
              color:"rgba(196,181,253,0.9)",fontSize:18,fontWeight:300,
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer"}}>{"+"}</button>
        </div>
      </div>
    </div>
  );
}


function Lucius({data,tr}){
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const [input,setInput]=useState("");
  const [tab,setTab]=useState("analisi"); // "analisi" | "lucius"
  const histRef=useRef(null);
  useEffect(()=>{if(histRef.current)histRef.current.scrollTop=histRef.current.scrollHeight;},[history,loading]);

  // ── DATI ──────────────────────────────────────────────────
  const habits=useMemo(()=>flatH(data.aree).filter(h=>h.freq&&h.freq.type!=="none"),[data.aree]);

  // Ultimi 30 giorni
  const days30=useMemo(()=>Array.from({length:30},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(29-i));
    return d.toISOString().split("T")[0];
  }),[]);

  // Ultimi 7 giorni
  const days7=days30.slice(-7);
  const today=tod();

  // % completamento per giorno (30gg)
  const dailyPct=useMemo(()=>days30.map(day=>{
    if(!habits.length)return{day,pct:0,done:0,tot:0};
    const done=habits.filter(h=>(tr[h.id]||{})[day]).length;
    return{day,pct:Math.round(done/habits.length*100),done,tot:habits.length};
  }),[days30,habits,tr]);

  // Streak corrente per abitudine
  const streaks=useMemo(()=>habits.map(h=>{
    let s=0;
    const revDays=[...days30].reverse();
    for(const day of revDays){
      if(day===today&&!(tr[h.id]||{})[today])continue; // oggi non conta se non fatto
      if((tr[h.id]||{})[day])s++;
      else break;
    }
    return{h,streak:s};
  }).sort((a,b)=>b.streak-a.streak),[habits,days30,tr,today]);

  // Tasso completamento 30gg per abitudine, normalizzato sul target di frequenza
  const rates=useMemo(()=>habits.map(h=>{
    const done=days30.filter(d=>(tr[h.id]||{})[d]).length;
    const freq=h.freq||{type:"daily"};
    // Target realistico nei 30gg: daily=30, weekly(n)=n*30/7, days(specifici)=conteggio reale
    let target=30;
    if(freq.type==="weekly")target=Math.round((freq.n||3)*30/7);
    else if(freq.type==="days")target=days30.filter(d=>isExpected(h,d)).length;
    target=Math.max(1,Math.min(30,target));
    const rate=Math.min(100,Math.round(done/target*100));
    return{h,rate,done,target};
  }).sort((a,b)=>b.rate-a.rate),[habits,days30,tr]);

  // Score settimana corrente
  const weekPct=useMemo(()=>{
    const tot=days7.length*habits.length;
    if(!tot)return 0;
    const done=days7.reduce((s,day)=>s+habits.filter(h=>(tr[h.id]||{})[day]).length,0);
    return Math.round(done/tot*100);
  },[days7,habits,tr]);

  // Colore % 
  const pctCol=p=>p>=80?"#2ea34e":p>=50?"#b09018":p>=20?"#c46828":"#555";
  const [showAllStreaks,setShowAllStreaks]=useState(false);

  // ── CONTEXT LUCIUS ────────────────────────────────────────
  const context=useMemo(()=>{
    const nome=localStorage.getItem("m-nome")||"Davide";
    const doneToday=habits.filter(h=>(tr[h.id]||{})[today]).length;
    const goals=(data.goals||[]).map(g=>`${g.text}: ${g.pct}%`).join(", ");
    return `Utente: ${nome}
Abitudini oggi: ${doneToday}/${habits.length} (${Math.round(doneToday/Math.max(habits.length,1)*100)}%)
Score settimana: ${weekPct}%
Streak migliore: ${(streaks[0]&&streaks[0].h?streaks[0].h.nome:"-")} (${streaks[0]?streaks[0].streak:0} giorni)
Obiettivi: ${goals||"nessuno"}`;
  },[data,tr,habits,today,weekPct,streaks]);

  const sendMsg=async(userMsg)=>{
    if(!userMsg.trim()||loading)return;
    const msg=userMsg.trim();
    setHistory(h=>[...h,{role:"user",content:msg}]);
    setInput("");setLoading(true);
    const newHistory=[...history,{role:"user",content:msg}];
    try{
      const apiKey=localStorage.getItem("m-apikey")||"";
      const geminiHistory=newHistory.map(m=>({
        role:m.role==="assistant"?"model":"user",
        parts:[{text:m.content}]
      }));
      const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system_instruction:{parts:[{text:`Sei Lucius, life coach saggio e diretto di Davide. Rispondi sempre in italiano, in modo conciso e caldo ma non retorico. Sii diretto e pratico.

Dati aggiornati di Davide oggi:
${context}`}]},
          contents:[...geminiHistory,{role:"user",parts:[{text:userMsg}]}],
          generationConfig:{maxOutputTokens:1000}
        })
      });
      if(!resp.ok){
        const err=await resp.json().catch(()=>({}));
        setHistory(h=>[...h,{role:"assistant",content:`Errore API: ${(err.error&&err.error.message)||resp.status}`}]);
        setLoading(false);return;
      }
      const d=await resp.json();
      const text=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts&&d.candidates[0].content.parts[0]&&d.candidates[0].content.parts[0].text)||"Nessuna risposta ricevuta.";
      setHistory(h=>[...h,{role:"assistant",content:text}]);
    }catch(e){setHistory(h=>[...h,{role:"assistant",content:`Errore: ${e.message}`}]);}
    setLoading(false);
  };

  const dayLabel=d=>new Date(d+"T12:00:00").toLocaleDateString("it-IT",{weekday:"short"}).slice(0,3);
  const shortDate=d=>new Date(d+"T12:00:00").toLocaleDateString("it-IT",{day:"numeric",month:"short"});

  return(
    <div style={{overflowX:"hidden"}}>
      {/* Header + tab toggle */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,letterSpacing:"-0.4px"}}>
          {tab==="analisi"?"Analisi":"Lucius"}
        </h1>
        <div style={{display:"flex",gap:4,background:Z.s2,borderRadius:10,padding:3}}>
          {["analisi","lucius"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"5px 14px",borderRadius:8,fontSize:12,fontWeight:600,
                background:tab===t?Z.s3:"transparent",
                border:tab===t?"1px solid rgba(255,255,255,0.1)":"none",
                color:tab===t?Z.t:Z.t3,cursor:"pointer",transition:"all 0.2s"}}>
              {t==="analisi"?"📊 Analisi":"🧠 Lucius"}
            </button>
          ))}
        </div>
      </div>

      {tab==="analisi"&&(
        <div>
          {/* KPI Row */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[
              {l:"Settimana",v:`${weekPct}%`,c:pctCol(weekPct)},
              {l:"Streak top",v:`${(streaks[0]?streaks[0].streak:0)}g`,c:"#c9a826"},
              {l:"Best 30gg",v:`${(rates[0]?rates[0].rate:0)}%`,c:pctCol((rates[0]?rates[0].rate:0))},
            ].map(({l,v,c})=>(
              <div key={l} style={{flex:1,background:Z.s1,borderRadius:12,padding:"12px 10px",
                border:"1px solid rgba(255,255,255,0.05)",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:c,
                  fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{v}</div>
                <div style={{fontSize:10,color:Z.t3,marginTop:4,fontWeight:600,
                  textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Grafico barre 30 giorni */}
          <div style={{background:Z.s1,borderRadius:14,padding:"14px 12px",
            border:"1px solid rgba(255,255,255,0.05)",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
              textTransform:"uppercase",marginBottom:10,
              fontFamily:"'JetBrains Mono',monospace"}}>Completamento 30 giorni</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:1,height:60}}>
              {dailyPct.map((b,i)=>{
                const isToday=b.day===today;
                const h=b.pct>0?Math.max(4,Math.round((b.pct/100)*52)):2;
                const col=b.pct>0?pctCol(b.pct):"rgba(255,255,255,0.08)";
                const showLabel=i===0||i===14||i===29||isToday;
                return(
                  <div key={b.day} style={{flex:1,display:"flex",flexDirection:"column",
                    alignItems:"center",gap:2}}>
                    <div style={{width:"100%",height:52,display:"flex",
                      alignItems:"flex-end",justifyContent:"center"}}>
                      <div style={{width:"100%",height:h,
                        background:isToday&&b.pct===0?"rgba(255,255,255,0.15)":(isToday?col:col+"99"),
                        borderRadius:"2px 2px 0 0",
                        border:isToday?"1px solid rgba(255,255,255,0.2)":"none",
                        boxShadow:isToday&&b.pct>0?`0 0 6px ${col}80`:"none"}}/>
                    </div>
                    <div style={{fontSize:7,color:isToday?Z.t:Z.t3,
                      fontWeight:isToday?700:400,
                      visibility:showLabel?"visible":"hidden",
                      overflow:"hidden"}}>
                      {isToday?"og":dayLabel(b.day)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap per abitudine (ultimi 14gg) */}
          <div style={{background:Z.s1,borderRadius:14,padding:"12px 14px",
            border:"1px solid rgba(255,255,255,0.05)",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
              textTransform:"uppercase",marginBottom:10,
              fontFamily:"'JetBrains Mono',monospace"}}>Abitudini · ultimi 14 giorni</div>
            {/* Header date */}
            <div style={{display:"flex",alignItems:"center",gap:2,marginBottom:6}}>
                  <div style={{width:80,flexShrink:0}}/>
              {days30.slice(-14).map((day,i)=>{
                const isToday=day===today;
                const label=new Date(day+"T12:00:00").toLocaleDateString("it-IT",{day:"numeric"});
                return(
                  <div key={day} style={{flex:1,textAlign:"center",fontSize:7,
                    color:isToday?Z.t:Z.t3,fontWeight:isToday?700:400}}>
                    {i===0||i===6||i===13||isToday?label:""}
                  </div>
                );
              })}
            </div>
            {habits.map(h=>{
              const aColor=(data.aree.find(a=>a.id===h.aId)||{}).color||SILVER;
              const rate=days30.filter(d=>(tr[h.id]||{})[d]).length;
              return(
                <div key={h.id} style={{display:"flex",alignItems:"center",
                  gap:2,marginBottom:4}}>
                  <div style={{width:80,flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:11,flexShrink:0}}>{h.icon}</span>
                    <span style={{fontSize:9,color:Z.t2,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {h.nome.split(" ")[0]}
                    </span>
                  </div>
                  {days30.slice(-14).map(day=>{
                    const done=!!((tr[h.id]||{})[day]);
                    const isToday=day===today;
                    return(
                      <div key={day} style={{flex:1,aspectRatio:"1",borderRadius:3,
                        background:done?aColor:"rgba(255,255,255,0.05)",
                        boxShadow:done&&isToday?`0 0 5px ${aColor}80`:"none",
                        border:isToday?`1px solid ${aColor}50`:"none"}}/>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Top e Bottom abitudini */}
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {/* Top 3 */}
            <div style={{flex:1,background:Z.s1,borderRadius:14,padding:"12px",
              border:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#2ea34e",
                textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>
                ↑ Top
              </div>
              {rates.slice(0,3).map(({h,rate})=>(
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <span style={{fontSize:13}}>{h.icon}</span>
                  <span style={{flex:1,fontSize:11,color:Z.t2,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.nome}</span>
                  <span style={{fontSize:11,fontWeight:700,color:pctCol(rate),
                    fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{rate}%</span>
                </div>
              ))}
            </div>
            {/* Bottom 3 */}
            <div style={{flex:1,background:Z.s1,borderRadius:14,padding:"12px",
              border:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#c46828",
                textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>
                ↓ Da migliorare
              </div>
              {[...rates].reverse().slice(0,3).map(({h,rate})=>(
                <div key={h.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <span style={{fontSize:13}}>{h.icon}</span>
                  <span style={{flex:1,fontSize:11,color:Z.t2,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.nome}</span>
                  <span style={{fontSize:11,fontWeight:700,color:pctCol(rate),
                    fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{rate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak ranking */}
          <div style={{background:Z.s1,borderRadius:14,padding:"12px 14px",
            border:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
              textTransform:"uppercase",marginBottom:10,
              fontFamily:"'JetBrains Mono',monospace"}}>Streak correnti</div>
            {streaks.filter(x=>x.streak>0).slice(0,showAllStreaks?999:8).map(({h,streak},i)=>(
              <div key={h.id} style={{display:"flex",alignItems:"center",
                gap:8,marginBottom:i<streaks.length-1?7:0}}>
                <span style={{fontSize:12}}>{h.icon}</span>
                <span style={{flex:1,fontSize:12,color:Z.t}}>{h.nome}</span>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:Math.max(4,Math.round(streak/Math.max(...streaks.map(x=>x.streak),1)*50)),
                    height:4,borderRadius:2,
                    background:`linear-gradient(90deg,#c9a826,#2ea34e)`}}/>
                  <span style={{fontSize:11,fontWeight:700,color:"#c9a826",
                    fontFamily:"'JetBrains Mono',monospace",
                    minWidth:22,textAlign:"right"}}>{streak}g</span>
                </div>
              </div>
            ))}
            {streaks.every(x=>x.streak===0)&&(
              <div style={{fontSize:12,color:Z.t3,fontStyle:"italic",textAlign:"center",
                padding:"8px 0"}}>Inizia oggi per costruire le tue streak!</div>
            )}
            {streaks.filter(x=>x.streak>0).length>8&&(
              <button onClick={()=>setShowAllStreaks(v=>!v)}
                style={{width:"100%",marginTop:10,padding:"8px",fontSize:11,
                  color:Z.t3,background:"transparent",border:`1px solid ${Z.b}`,
                  borderRadius:8,cursor:"pointer"}}>
                {showAllStreaks?"Mostra meno":`Vedi tutte (${streaks.filter(x=>x.streak>0).length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {tab==="lucius"&&(
        <div>
          {/* Snapshot */}
          <div className="up" style={{background:Z.s1,border:`1px solid ${Z.b}`,
            borderRadius:14,padding:"14px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:Z.t3,letterSpacing:"0.1em",
              textTransform:"uppercase",marginBottom:10,
              fontFamily:"'JetBrains Mono',monospace"}}>
              I tuoi dati oggi
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[
                {l:"Settimana",v:`${weekPct}%`,c:weekPct>=70?"#00e5a0":weekPct>=40?"#facc15":"#f87171"},
                {l:"Streak top",v:`${(streaks[0]?streaks[0].streak:0)}g`,c:"#c9a826"},
                {l:"Obiettivi",v:`${(data.goals||[]).length}`,c:SILVER},
              ].map(({l,v,c})=>(
                <div key={l} style={{flex:1,minWidth:60}}>
                  <div style={{fontSize:16,fontWeight:800,color:c,
                    fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                  <div style={{fontSize:10,color:Z.t3,marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversazione */}
          {history.length===0?(
            <div className="up d1" style={{textAlign:"center",padding:"28px 20px",
              background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:16}}>
              <div style={{fontSize:28,marginBottom:10}}>🧠</div>
              <h2 style={{fontSize:16,fontWeight:700,color:Z.t,marginBottom:8,margin:"0 0 8px"}}>
                Ciao, sono Lucius
              </h2>
              <p style={{fontSize:13,color:Z.t2,margin:"0 0 16px",lineHeight:1.5}}>
                Il tuo coach personale. Chiedimi qualsiasi cosa sui tuoi progressi.
              </p>
              <button onClick={()=>sendMsg("Come sto andando questa settimana?")}
                style={{padding:"12px 28px",background:SILVER,border:"none",
                  borderRadius:20,fontSize:13,fontWeight:700,color:"#0a0a0a",
                  opacity:loading?0.5:1}}>
                Inizia la conversazione
              </button>
            </div>
          ):(
            <div>
              <div ref={histRef} style={{maxHeight:320,overflowY:"auto",
                paddingBottom:8}}>
                {history.map((m,i)=>(
                  <div key={i} style={{marginBottom:12,
                    display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",
                    gap:8,alignItems:"flex-start"}}>
                    {m.role==="assistant"&&<span style={{fontSize:16,flexShrink:0}}>🧠</span>}
                    <div style={{maxWidth:"85%",padding:"10px 12px",borderRadius:14,
                      background:m.role==="user"?"rgba(200,200,212,0.12)":Z.s2,
                      border:`1px solid ${m.role==="user"?"rgba(200,200,212,0.2)":Z.b}`,
                      fontSize:14,color:Z.t,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading&&(
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
                    <span style={{fontSize:16}}>🧠</span>
                    <div style={{padding:"10px 14px",background:Z.s2,borderRadius:14,
                      border:`1px solid ${Z.b}`,fontSize:13,color:Z.t3}}>
                      Lucius sta riflettendo...
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{borderTop:`1px solid ${Z.b}`,padding:"10px 0 0",
            display:"flex",gap:8,alignItems:"flex-end",marginTop:8}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&input.trim()&&sendMsg(input)}
              placeholder="Scrivi a Lucius..."
              rows={1}
              style={{flex:1,background:Z.s2,border:`1px solid ${Z.b}`,
                borderRadius:12,padding:"10px 12px",color:Z.t,fontSize:14,
                outline:"none",resize:"none"}}/>
            <button onClick={()=>sendMsg(input)}
              style={{padding:"9px 14px",background:input.trim()?SILVER:"rgba(255,255,255,0.06)",
                border:"none",borderRadius:12,fontSize:16,
                opacity:loading?0.5:1,flexShrink:0,transition:"all 0.2s"}}>↑</button>
          </div>
          {history.length>0&&!loading&&(
            <button onClick={()=>setHistory([])}
              style={{marginTop:8,fontSize:11,color:Z.t3,padding:"6px 12px",
                background:"transparent",border:`1px solid ${Z.b}`,borderRadius:8,
                cursor:"pointer"}}>
              Nuova conversazione
            </button>
          )}
        </div>
      )}
    </div>
  );
}


function SwipeTask({t,onToggle,onEdit,onDelete,aree,urgent}){
  const [tx,setTx]=useState(0);
  const [sw,setSw]=useState(false);
  const swX=useRef(0),swS=useRef(0),swY=useRef(0),swLocked=useRef(null);
  const swipeRef=useRef(null);
  const prog=Math.min(1,Math.abs(tx)/60);
  const goingRight=tx>0; // right=complete, left=delete
  const d2=fmtDL(t.deadline);
  const area2=aree&&aree.find(a=>a.id===t.aId);
  const aCol=(area2||{}).color;
  const cat2=area2&&(area2.cat||[]).find(cat=>cat.id===t.cId);
  const aName=cat2?cat2.nome:(area2||{}).nome;
  useEffect(()=>{
    const el=swipeRef.current;if(!el)return;
    const fn=e=>{
      const dx=e.touches[0].clientX-swS.current;
      const dy=e.touches[0].clientY-swY.current;
      if(swLocked.current===null)swLocked.current=Math.abs(dx)>Math.abs(dy)?"h":"v";
      if(swLocked.current==="v"){if(Math.abs(swX.current)>2){swX.current=0;setTx(0);}return;}
      e.preventDefault();
      const cl=Math.max(-80,Math.min(80,dx));swX.current=cl;setTx(cl);
    };
    el.addEventListener("touchmove",fn,{passive:false});
    return()=>el.removeEventListener("touchmove",fn);
  },[sw]);
  return(
    <div ref={swipeRef} style={{position:"relative",overflow:"hidden"}}>
      {/* BG feedback */}
      <div style={{position:"absolute",inset:0,display:"flex",
        alignItems:"center",
        justifyContent:goingRight?"flex-start":"flex-end",
        padding:"0 16px",
        background:goingRight
          ?`rgba(0,229,160,${prog*0.25})`
          :`rgba(248,113,113,${prog*0.25})`}}>
        <span style={{fontSize:16,opacity:prog}}>
          {goingRight?"✓":"✕"}
        </span>
      </div>
      <div
        onTouchStart={e=>{swS.current=e.touches[0].clientX;swY.current=e.touches[0].clientY;swLocked.current=null;setSw(true);}}
        
        onTouchEnd={()=>{
          setSw(false);
          if(swX.current>60){onToggle(t.id);if(navigator.vibrate)navigator.vibrate([6,3,6]);}
          else if(swX.current<-60){onDelete(t.id);if(navigator.vibrate)navigator.vibrate([8]);}
          swX.current=0;setTx(0);
        }}
        style={{display:"flex",alignItems:"center",gap:10,
          padding:"7px 12px",
          background:t.done?"rgba(0,229,160,0.04)":Z.s1,
          transform:`translateX(${tx}px)`,
          transition:sw?"none":"transform 0.28s cubic-bezier(0.16,1,0.3,1)"}}>
        <button onClick={()=>onToggle(t.id)}
          style={{width:20,height:20,borderRadius:"50%",flexShrink:0,padding:0,
            background:t.done?"#00e5a0":"transparent",
            border:`1.5px solid ${t.done?"#00e5a0":Z.b2}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#0a0a0a",fontSize:11,fontWeight:700}}>
          {t.done&&"✓"}
        </button>
        <div style={{flex:1,minWidth:0,cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"space-between",gap:8}}
          onClick={()=>swX.current===0&&onEdit(t)}>
          <div style={{fontSize:13.5,color:t.done?Z.t3:Z.t,
            fontWeight:t.done?400:500,minWidth:0,flex:1,
            textDecoration:t.done?"line-through":"none",lineHeight:1.3,wordBreak:"break-word"}}>
            {t.text}
          </div>
          {(aName||d2)&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",
              gap:2,flexShrink:0,fontSize:10,color:Z.t3}}>
              {aName&&(
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:aCol,flexShrink:0}}/>
                  <span>{aName}</span>
                </div>
              )}
              {d2&&<span style={{color:urgent&&!t.done?"#f87171":Z.t3,fontWeight:urgent&&!t.done?600:400}}>{d2.txt}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//  HOME 

function Home({data,tr,logs,onToggle,onEditHabit,onLog,setScreen,setData,onAddTask,showToast,onDel,onEditTask,onDelTask}){
  const ts=tod();
  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const [showDone,setShowDone]=useState(true);
  const [justDone,setJustDone]=useState(null);

const HOME_ORDER=["h1","h2","h14","h6","h5","h10","h3","h51"];
  const todayH=useMemo(()=>{
    const base=habits.filter(h=>isExpected(h,ts));
    return[
      ...HOME_ORDER.map(id=>base.find(h=>h.id===id)).filter(Boolean),
      ...base.filter(h=>!HOME_ORDER.includes(h.id))
    ];
  },[habits,ts]);

  const doneToday=todayH.filter(h=>!!((tr[h.id]||{})[ts]));
  const rem=todayH.filter(h=>!((tr[h.id]||{})[ts]));
  const pct=todayH.length?Math.round(doneToday.length/todayH.length*100):0;
  const allDone=todayH.length>0&&pct===100;

  const pending=useMemo(()=>(data.tasks||[]).filter(t=>!t.done),[data.tasks]);
  const urg=useMemo(()=>pending.filter(t=>(fmtDL(t.deadline)||{}).u),[pending]);
  const todayTasks=useMemo(()=>{
    const today=tod();
    return (data.tasks||[]).filter(t=>t.deadline&&t.deadline<=today);
  },[data.tasks]);

  const extraDone=habits.filter(h=>!todayH.find(t=>t.id===h.id)&&!!((tr[h.id]||{})[ts]));
  const allDoneList=[...doneToday,...extraDone];

  const handleToggle=useCallback((hId)=>{
    const wasDone=!!((tr[hId]||{})[ts]);
    onToggle(hId);
    if(!wasDone){setJustDone(hId);setTimeout(()=>setJustDone(null),600);}
  },[tr,ts,onToggle]);

  return(
    <div>

      {/* ABITUDINI */}
      <div className="up d1" style={{padding:"16px 16px 0",marginBottom:22}}>
        <div style={{marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:"0.12em",textTransform:"uppercase"}}>Abitudini</span>
        </div>

        {todayH.length===0?(
          <div style={{padding:"28px 0",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13}}>Nessuna abitudine prevista oggi</div>
        ):allDone?(
          <div>
            <div style={{background:"linear-gradient(135deg,rgba(0,229,160,0.09),rgba(0,229,160,0.03))",border:"1px solid rgba(0,229,160,0.12)",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(0,229,160,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{"🎉"}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#00e5a0",letterSpacing:"-0.2px"}}>Tutto completato!</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:2}}>Ottima giornata, Davide</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4,opacity:0.45}}>
              {allDoneList.map(h=>(
                <HRow key={h.id} h={h} tr={tr} logs={logs} onToggle={handleToggle} onEdit={onEditHabit} onLog={onLog} onDel={onDel} compact/>
              ))}
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {rem.map(h=>{
              const isFlash=justDone===h.id;
              return(
                <div key={h.id} style={{position:"relative",overflow:"hidden",borderRadius:10,
                  transition:"background 0.4s ease"}}>
                  {isFlash&&(
                    <div style={{position:"absolute",left:14,top:"50%",width:28,height:28,marginTop:-14,borderRadius:"50%",background:"rgba(0,229,160,0.3)",pointerEvents:"none",animation:"rippleGreen 0.5s ease-out forwards"}}/>
                  )}
                  <HRow h={h} tr={tr} logs={logs} onToggle={handleToggle} onEdit={onEditHabit} onLog={onLog} onDel={onDel} compact/>
                </div>
              );
            })}
          </div>
        )}

        {allDoneList.length>0&&!allDone&&(
          <div style={{marginTop:8}}>
            <button onClick={()=>setShowDone(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",background:"transparent",border:"none",color:"rgba(255,255,255,0.25)",fontSize:11,cursor:"pointer"}}>
              <span style={{display:"inline-block",fontSize:9,opacity:0.5,transform:showDone?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>{"▶"}</span>
              <span>Completate</span>
              <span style={{background:"rgba(0,229,160,0.08)",color:"#00e5a0",fontWeight:700,padding:"1px 7px",borderRadius:8,fontSize:10}}>{allDoneList.length}</span>
            </button>
            {showDone&&(
              <div style={{display:"flex",flexDirection:"column",gap:4,opacity:0.45,marginTop:6}}>
                {allDoneList.map(h=>(
                  <HRow key={h.id} h={h} tr={tr} logs={logs} onToggle={handleToggle} onEdit={onEditHabit} onLog={onLog} onDel={onDel} compact/>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TASK */}
      {todayTasks.length>0&&(
        <div className="up d2" style={{padding:"0 16px 0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:"0.12em",textTransform:"uppercase"}}>Task in scadenza oggi</span>
            <button onClick={onAddTask} style={{width:28,height:28,borderRadius:"50%",background:"transparent",border:"1.5px solid rgba(0,229,160,0.5)",color:"#00e5a0",fontSize:16,fontWeight:300,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{"+"}</button>
          </div>
          <div style={{borderRadius:14,overflow:"hidden",background:Z.s1}}>
            {todayTasks.map((t,i)=>{
              const isUrgent=urg.includes(t);
              const area=(data.aree||[]).find(x=>x.id===t.aId);
              const cat=area&&(area.cat||[]).find(cc=>cc.id===t.cId);
              const badgeNome=cat?cat.nome:(area&&area.nome);
              return(
                <div key={t.id} style={{borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none",background:isUrgent?"rgba(248,113,113,0.03)":Z.s1}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 16px",cursor:"pointer"}}
                    onClick={()=>{if(onEditTask)onEditTask(t);}}>
                    <button onClick={e=>{e.stopPropagation();setData(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}));}}
                      style={{width:20,height:20,borderRadius:"50%",flexShrink:0,padding:0,cursor:"pointer",marginTop:1,
                        background:t.done?"#00e5a0":"transparent",
                        border:`2px solid ${t.done?"#00e5a0":isUrgent?"rgba(248,113,113,0.4)":"rgba(255,255,255,0.15)"}`,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {t.done&&<span style={{color:"#0a0a0a",fontSize:10,fontWeight:900}}>{"✓"}</span>}
                    </button>
                    <div style={{flex:1,minWidth:0,display:"flex",
                      alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                      <div style={{fontSize:13.5,color:t.done?Z.t3:Z.t,
                        fontWeight:t.done?400:500,minWidth:0,flex:1,
                        textDecoration:t.done?"line-through":"none",
                        letterSpacing:"-0.1px",lineHeight:1.3,wordBreak:"break-word"}}>
                        {t.text}
                      </div>
                      {(badgeNome||fmtDL(t.deadline))&&(
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",
                          gap:2,flexShrink:0,fontSize:10,color:Z.t3}}>
                          {area&&(
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{width:4,height:4,borderRadius:"50%",background:area.color,flexShrink:0}}/>
                              <span>{badgeNome}</span>
                            </div>
                          )}
                          {fmtDL(t.deadline)&&<span style={{color:isUrgent&&!t.done?"#f87171":Z.t3,fontWeight:isUrgent&&!t.done?600:400}}>{fmtDL(t.deadline).txt}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todayTasks.length===0&&(
        <div style={{padding:"0 16px"}}>
          <div style={{position:"relative",overflow:"hidden",
            padding:"16px 16px",borderRadius:16,
            background:"linear-gradient(135deg,rgba(0,229,160,0.04) 0%,rgba(255,255,255,0.01) 100%)",
            border:"1px solid rgba(0,229,160,0.08)"}}>
            {/* Cerchio decorativo */}
            <div style={{position:"absolute",right:-20,top:-20,
              width:80,height:80,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(0,229,160,0.06) 0%,transparent 70%)",
              pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",fontWeight:600,
                  letterSpacing:"0.01em"}}>
                  ✦ Giornata libera
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:3,
                  letterSpacing:"0.02em"}}>
                  Nessun task in scadenza
                </div>
              </div>
              <button onClick={onAddTask}
                style={{width:32,height:32,borderRadius:"50%",
                  background:"rgba(0,229,160,0.08)",
                  border:"1.5px solid rgba(0,229,160,0.35)",
                  color:"#00e5a0",fontSize:20,fontWeight:300,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer"}}>{"+"}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
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

// ── APP ROOT ─────────────────────────────────────────────────────
function GoalCircle({avg}){
  if(avg===null||avg===undefined)return null;
  const r=7,circ=2*Math.PI*r,dash=circ*(avg/100);
  return(
    <span style={{display:"flex",alignItems:"center",gap:3}}>
      <svg width={18} height={18} style={{flexShrink:0}}>
        <circle cx={9} cy={9} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={2}/>
        <circle cx={9} cy={9} r={r} fill="none"
          stroke="#facc15" strokeWidth={2}
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
          strokeLinecap="round"
          transform="rotate(-90 9 9)"/>
      </svg>
      <span style={{fontSize:12,fontWeight:600,color:"#f0f0f0"}}>{avg}%</span>
    </span>
  );
}


function NotesModal({notes,setNotes,openNoteId,setOpenNoteId,onClose}){
  const openNote=notes.find(n=>n.id===openNoteId);
  const fmtWhen=ts=>{
    const d=new Date(ts);
    const now=new Date();
    const sameDay=d.toDateString()===now.toDateString();
    const time=d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
    if(sameDay)return`Oggi · ${time}`;
    const sameYear=d.getFullYear()===now.getFullYear();
    const datePart=d.toLocaleDateString("it-IT",sameYear?{day:"numeric",month:"short"}:{day:"numeric",month:"short",year:"numeric"});
    return`${datePart} · ${time}`;
  };
  const createNote=()=>{
    const n={id:uid(),title:"",text:"",createdAt:Date.now(),updatedAt:Date.now()};
    setNotes(prev=>[n,...prev]);
    setOpenNoteId(n.id);
  };
  const updateNoteText=(id,text)=>{
    setNotes(prev=>prev.map(n=>n.id===id?{...n,text,updatedAt:Date.now()}:n));
  };
  const updateNoteTitle=(id,title)=>{
    setNotes(prev=>prev.map(n=>n.id===id?{...n,title,updatedAt:Date.now()}:n));
  };
  const deleteNote=id=>{
    setNotes(prev=>prev.filter(n=>n.id!==id));
    setOpenNoteId(null);
  };
  const sorted=[...notes].sort((a,b)=>b.updatedAt-a.updatedAt);

  return(
    <div style={{position:"fixed",inset:0,zIndex:950,
      background:Z.bg,display:"flex",flexDirection:"column"}}>

      {openNote?(
        <>
          {/* Editor header */}
          <div style={{padding:"calc(14px + env(safe-area-inset-top)) 16px 14px",
            borderBottom:`1px solid ${Z.b}`,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            flexShrink:0}}>
            <button onClick={()=>setOpenNoteId(null)}
              style={{background:"transparent",border:"none",
                color:Z.t2,fontSize:14,fontWeight:600,padding:"4px 0",
                display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Note
            </button>
            <button onClick={()=>{
              if(window.confirm("Eliminare questa nota?"))deleteNote(openNote.id);
            }}
              style={{background:"transparent",border:"none",
                color:"#f87171",opacity:0.85,padding:"4px 6px",
                cursor:"pointer",display:"flex",alignItems:"center"}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>

          <div style={{padding:"14px 18px 0",flexShrink:0}}>
            <input
              value={openNote.title||""}
              onChange={e=>updateNoteTitle(openNote.id,e.target.value)}
              placeholder="Titolo"
              autoFocus={!openNote.title&&!openNote.text}
              style={{width:"100%",border:"none",outline:"none",
                background:"transparent",color:Z.t,
                fontSize:18,fontWeight:800,letterSpacing:"-0.3px",
                fontFamily:"inherit",boxSizing:"border-box",
                padding:0,marginBottom:4}}/>
            <span style={{fontSize:11,color:Z.t3}}>{fmtWhen(openNote.updatedAt)}</span>
          </div>

          <textarea
            value={openNote.text}
            onChange={e=>updateNoteText(openNote.id,e.target.value)}
            placeholder="Scrivi qui..."
            style={{flex:1,width:"100%",border:"none",outline:"none",
              background:"transparent",color:Z.t,
              fontSize:15,lineHeight:1.7,padding:"10px 18px 18px",
              resize:"none",fontFamily:"inherit",
              boxSizing:"border-box"}}/>

          <div style={{padding:"10px 16px calc(10px + env(safe-area-inset-bottom))",
            borderTop:`1px solid ${Z.b}`,flexShrink:0}}>
            <span style={{fontSize:11,color:Z.t3}}>
              {openNote.text.length} caratteri
            </span>
          </div>
        </>
      ):(
        <>
          {/* List header */}
          <div style={{padding:"calc(14px + env(safe-area-inset-top)) 16px 14px",
            borderBottom:`1px solid ${Z.b}`,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:Z.t,letterSpacing:"-0.3px"}}>
              Note
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={createNote}
                style={{background:"rgba(255,255,255,0.07)",border:"none",
                  borderRadius:9,padding:"6px 10px",color:Z.t,
                  fontSize:13,fontWeight:700,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:5}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nuova
              </button>
              <button onClick={onClose}
                style={{width:32,height:32,borderRadius:"50%",
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  color:Z.t2,fontSize:20,display:"flex",
                  alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          </div>

          {/* List */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px",
            WebkitOverflowScrolling:"touch"}}>
            {sorted.length===0?(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:32,marginBottom:10,opacity:0.4}}>📝</div>
                <div style={{fontSize:14,color:Z.t2,marginBottom:4,fontWeight:600}}>
                  Nessuna nota
                </div>
                <div style={{fontSize:12,color:Z.t3}}>
                  Tocca "Nuova" per iniziare a scrivere
                </div>
              </div>
            ):(
              sorted.map(n=>{
                const hasTitle=(n.title||"").trim().length>0;
                const preview=hasTitle?n.title.trim():((n.text||"").trim().split("\n")[0]||"Nota vuota");
                const secondLine=hasTitle
                  ?(n.text||"").trim().split("\n").join(" ").trim()
                  :(n.text||"").trim().split("\n").slice(1).join(" ").trim();
                return(
                  <button key={n.id} onClick={()=>setOpenNoteId(n.id)}
                    style={{width:"100%",textAlign:"left",
                      background:Z.s1,border:`1px solid ${Z.b}`,
                      borderRadius:14,padding:"13px 14px",
                      marginBottom:8,cursor:"pointer",display:"block"}}>
                    <div style={{fontSize:14,fontWeight:700,color:Z.t,
                      marginBottom:secondLine?3:6,
                      overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap"}}>
                      {preview}
                    </div>
                    {secondLine&&(
                      <div style={{fontSize:12,color:Z.t2,marginBottom:6,
                        overflow:"hidden",textOverflow:"ellipsis",
                        whiteSpace:"nowrap"}}>
                        {secondLine}
                      </div>
                    )}
                    <div style={{fontSize:11,color:Z.t3}}>
                      {fmtWhen(n.updatedAt)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

function App(){
  const [data,setData]=useState(()=>{
    try{
      const raw=localStorage.getItem("m8");
      if(!raw)return INIT;
      const p=JSON.parse(raw);
      if(!p.tasks)p.tasks=[];
      if(!p.goals)p.goals=[];
      if(!p.vita||Object.keys(p.vita).length<12)p.vita=INIT.vita;
      if(!p.snapshots)p.snapshots=[];
      // Merge abitudini: i dati salvati sono la base (preserva custom e cancellazioni dell'utente),
      // INIT aggiorna i campi delle abitudini esistenti e aggiunge eventuali novità introdotte da update dell'app
      p.aree=(INIT.aree||[]).map(initArea=>{
        const saved=(p.aree||[]).find(a=>a.id===initArea.id);
        if(!saved)return initArea; // nuova area introdotta da un aggiornamento
        return{...initArea,cat:(initArea.cat||[]).map(initCat=>{
          const savedCat=(saved.cat||[]).find(c=>c.id===initCat.id);
          if(!savedCat)return initCat; // nuova categoria introdotta da un aggiornamento
          const savedHabits=savedCat.h||[];
          const h=savedHabits.map(sv=>{
            const initH=(initCat.h||[]).find(ih=>ih.id===sv.id);
            if(!initH)return sv; // abitudine custom dell'utente: la mantengo intatta
            return{
              ...initH,
              s:sv.s||initH.s,
              dimensioni:sv.dimensioni||initH.dimensioni||[],
              nome:(initH.id==="h27"||initH.id==="h25"||initH.id==="h58"||initH.id==="h43"||initH.id==="h1")?initH.nome:(sv.nome||initH.nome),
              icon:sv.icon!==undefined?sv.icon:initH.icon,
              freq:sv.freq||initH.freq,
              note:sv.note||initH.note,
              milestones:sv.milestones||[],
              riflessioni:sv.riflessioni||"",
              patrimonio:sv.patrimonio||[],
              patrimoniStorico:sv.patrimoniStorico||[],
              spese:sv.spese||[],
              rispCfg:sv.rispCfg||{},
              rispStorico:sv.rispStorico||[],
              // Preserva dati log personalizzati
              ...(sv.aspetti  !== undefined && {aspetti:sv.aspetti}),
              ...(sv.visite   !== undefined && {visite:sv.visite}),
              ...(sv.esercizi !== undefined && {esercizi:sv.esercizi}),
            };
          });
          // abitudini nuove introdotte da INIT (aggiornamenti dell'app) non ancora viste dall'utente
          const savedIds=new Set(savedHabits.map(x=>x.id));
          const newFromInit=(initCat.h||[]).filter(ih=>!savedIds.has(ih.id));
          return{...initCat,h:[...h,...newFromInit]};
        })};
      });
      // Merge goals: i dati salvati sono la base (preserva custom e cancellazioni dell'utente),
      // INIT aggiorna i campi dei goal esistenti e aggiunge eventuali novità non ancora viste
      const savedGoals=p.goals||[];
      const savedGIds=new Set(savedGoals.map(g=>g.id));
      const mergedGoals=savedGoals.map(sv=>{
        const initG=INIT.goals.find(g=>g.id===sv.id);
        if(!initG)return sv; // goal custom dell'utente: lo mantengo intatto
        const initTaskIds=new Set((initG.tasks||[]).map(t=>t.id));
        const tasks=(initG.tasks||[]).map(initT=>{
          const svT=(sv.tasks||[]).find(t=>t.id===initT.id);
          return svT?{...initT,...svT}:{...initT};
        });
        const customTasks=(sv.tasks||[]).filter(t=>!initTaskIds.has(t.id));
        const allTasks=[...tasks,...customTasks];
        const pct=allTasks.length?Math.round(allTasks.reduce((s,t)=>s+(t.pct||0),0)/allTasks.length):0;
        return{...initG,...sv,tasks:allTasks,pct,s:sv.s||initG.s};
      });
      const newFromInitGoals=INIT.goals.filter(g=>!savedGIds.has(g.id));
      p.goals=[...mergedGoals,...newFromInitGoals];
      return p;
    }catch{return INIT;}
  });
  const [tr,setTr]=useState(()=>{try{const s=localStorage.getItem("m-tr");return s?JSON.parse(s):{};}catch{return {};}});
  const [logs,setLogs]=useState(()=>{try{const s=localStorage.getItem("m-lg");return s?JSON.parse(s):{};}catch{return {};}});
  const [screen,setScreen]=useState("home");
  const [editH,setEditH]=useState(null);
  const [wakeH,setWakeH]=useState(null);
  const [addingTask,setAddingTask]=useState(false);
  const [toast,setToast]=useState(null);

  const [editG,setEditG]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [notes,setNotes]=useState(()=>{
    try{
      const raw=localStorage.getItem("m-notes-list");
      if(raw)return JSON.parse(raw);
      // Migrazione: se esisteva la vecchia nota singola, la converto
      const old=localStorage.getItem("m-notes");
      if(old&&old.trim()){
        return[{id:uid(),text:old,createdAt:Date.now(),updatedAt:Date.now()}];
      }
      return[];
    }catch{return[];}
  });
  useEffect(()=>{try{localStorage.setItem("m-notes-list",JSON.stringify(notes));}catch{}},[notes]);
  const [openNoteId,setOpenNoteId]=useState(null);
  const [addingH,setAddingH]=useState(false);
  const [addArea,setAddArea]=useState(null);
  const [newG,setNewG]=useState(false);
  const [editT,setEditT]=useState(null);

  useEffect(()=>{try{localStorage.setItem("m8",JSON.stringify(data));}catch{}},[data]);
  useEffect(()=>{try{localStorage.setItem("m-tr",JSON.stringify(tr));}catch{}},[tr]);
  useEffect(()=>{try{localStorage.setItem("m-lg",JSON.stringify(logs));}catch{}},[logs]);
  useEffect(()=>{document.body.style.background=Z.bg;},[]);
  useEffect(()=>{if(document.getElementById("mss"))return;const el=document.createElement("style");el.id="mss";el.textContent=CSS;document.head.appendChild(el);},[]);

  const ts=tod();
  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const todayH=habits.filter(h=>isExpected(h,ts));
  const tdone=todayH.filter(h=>(tr[h.id]||{})[ts]).length;
  const tpct=todayH.length?Math.round(tdone/todayH.length*100):0;

  const showToast=(msg,onUndo=null)=>{
    setToast({msg,onUndo});
    setTimeout(()=>setToast(null),onUndo?3600:2600);
  };

  const doBackup=(silent)=>{
    try{
      const payload=JSON.stringify({data,tr,logs},null,2);
      const blob=new Blob([payload],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="meridian_"+tod()+".json";
      a.click();URL.revokeObjectURL(url);
      localStorage.setItem("m-last-backup",tod());
      setBackupBanner(false);
      if(!silent)showToast("Backup scaricato ✓");
    }catch(e){if(!silent)showToast("Errore durante il backup");}
  };

  const [backupBanner,setBackupBanner]=useState(false);
  useEffect(()=>{
    try{
      const last=localStorage.getItem("m-last-backup");
      if(!last){
        // Prima apertura assoluta: non disturbare, ma fissa una base
        localStorage.setItem("m-last-backup",tod());
        return;
      }
      const lastDate=new Date(last+"T00:00:00");
      const daysSince=Math.floor((new Date(tod()+"T00:00:00")-lastDate)/86400000);
      if(daysSince>=30){
        // Oltre 30gg: backup automatico silenzioso, poi banner comunque visibile
        doBackup(true);
        setBackupBanner(true);
      }else if(daysSince>=14){
        setBackupBanner(true);
      }
    }catch(e){}
  // eslint-disable-next-line
  },[]);

  const toggle=(hId)=>{
    const t=tod();
    setTr(prev=>{
      const cur=(prev[hId]||{})[t];
      return{...prev,[hId]:{...(prev[hId]||{}),[t]:!cur}};
    });
  };

  const saveHabit=(ch)=>{
    if(!editH)return;
    // Filtra i campi _ spuri prima di salvare
    const clean=Object.fromEntries(Object.entries(ch).filter(([k])=>!k.startsWith('_')));
    setData(d=>({...d,aree:d.aree.map(a=>({...a,
      cat:a.cat.map(cat=>({...cat,
        h:(cat.h||[]).map(h=>h.id===editH.id?{...h,...clean}:h)
      }))
    }))}));
    setEditH(null);
  };

  const delHabit=(hId)=>{
    const id=hId||(editH&&editH.id);
    if(!id)return;
    setData(d=>({...d,aree:d.aree.map(a=>({...a,
      cat:a.cat.map(cat=>({...cat,
        h:(cat.h||[]).filter(h=>h.id!==id)
      }))
    }))}));
    if(!hId)setEditH(null);
  };

  const addHabit=(catId,nome)=>{
    setData(d=>({...d,aree:d.aree.map(a=>({...a,
      cat:a.cat.map(c=>c.id!==catId?c:{...c,h:[...c.h,{id:uid(),nome,s:"green",note:"",freq:{type:"daily"},logType:"nessuno",milestones:[]}]})
    }))}));
  };

  const saveWake=(hId,entry)=>{
    const t=tod();
    setLogs(prev=>({...prev,[hId]:{...(prev[hId]||{}),[t]:{...((prev[hId]||{})[t]||{}),...entry}}}));
    setTr(prev=>{const l=prev[hId]||{};return{...prev,[hId]:{...l,[t]:true}};});
    setWakeH(null);
  };

  const saveWorkoutLog=(hId,entry)=>{
    const t=tod();
    setLogs(prev=>({...prev,[hId]:{...(prev[hId]||{}),[t]:entry}}));
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

  const addTask=(ch)=>{
    setData(d=>({...d,tasks:[...(d.tasks||[]),{id:uid(),...ch}]}));
    setAddingTask(false);
  };

  const updTask=(ch)=>{
    setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===(editT&&editT.id)?{...t,...ch}:t)}));
    setEditT(null);
  };

  const delTask=(id)=>{
    const backup=(data.tasks||[]).find(t=>t.id===id);
    setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));
    setEditT(null);
    let undoFn=null;
    if(backup){undoFn=()=>setData(d=>({...d,tasks:[...(d.tasks||[]),backup]}));}
    showToast("Task eliminato",undoFn);
  };

  const urgCount=useMemo(()=>(data.tasks||[]).filter(t=>!t.done&&(fmtDL(t.deadline)||{}).u).length,[data.tasks]);
  return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100dvh",
      background:Z.bg,fontFamily:"Inter,sans-serif",
      display:"flex",flexDirection:"column",overflow:"hidden",
      WebkitFontSmoothing:"antialiased"}}>

      {/* Modali globali */}
      {showNotes&&<NotesModal notes={notes} setNotes={setNotes}
        openNoteId={openNoteId} setOpenNoteId={setOpenNoteId}
        onClose={()=>setShowNotes(false)}/>}


      {showSettings&&(
        <div onClick={()=>setShowSettings(false)}
          style={{position:"fixed",inset:0,zIndex:950,
            background:"rgba(0,0,0,0.6)",backdropFilter:"blur(16px)",
            display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"100%",maxWidth:480,background:Z.s1,
              borderRadius:"22px 22px 0 0",
              borderTop:"1px solid rgba(255,255,255,0.1)",
              maxHeight:"90vh",overflowY:"auto",scrollbarWidth:"none"}}>

            {/* Handle */}
            <div style={{display:"flex",justifyContent:"center",paddingTop:12,paddingBottom:4}}>
              <div style={{width:36,height:4,background:Z.b2,borderRadius:2}}/>
            </div>

            {/* Header */}
            <div style={{padding:"10px 20px 14px",borderBottom:`1px solid ${Z.b}`,
              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:20,fontWeight:800,color:Z.t,letterSpacing:"-0.4px"}}>
                Impostazioni
              </div>
              <button onClick={()=>setShowSettings(false)}
                style={{width:32,height:32,borderRadius:"50%",
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  color:Z.t2,fontSize:20,display:"flex",
                  alignItems:"center",justifyContent:"center"}}>×</button>
            </div>

            {/* Sezione: Profilo */}
            <div style={{padding:"20px 20px 0"}}>
              <div style={{fontSize:10,fontWeight:800,color:Z.t3,letterSpacing:"0.12em",
                textTransform:"uppercase",marginBottom:12,
                fontFamily:"'JetBrains Mono',monospace"}}>Profilo</div>
              <div style={{background:Z.s2,borderRadius:14,overflow:"hidden",
                border:`1px solid ${Z.b}`,marginBottom:20}}>
                <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:"rgba(200,200,212,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>👤</div>
                  <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:Z.t,marginBottom:2}}>Il tuo nome</div>
                    <div style={{fontSize:11,color:Z.t3}}>Usato nei saluti</div>
                  </div>
                </div>
                <div style={{padding:"0 16px 14px"}}>
                  <input type="text"
                    defaultValue={localStorage.getItem("m-nome")||"Davide"}
                    onChange={e=>localStorage.setItem("m-nome",e.target.value)}
                    style={{width:"100%",background:Z.s1,
                      border:`1px solid ${Z.b}`,borderRadius:10,
                      padding:"11px 13px",color:Z.t,fontSize:14,
                      outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>
            </div>

            {/* Sezione: Lucius */}
            <div style={{padding:"0 20px 0"}}>
              <div style={{fontSize:10,fontWeight:800,color:Z.t3,letterSpacing:"0.12em",
                textTransform:"uppercase",marginBottom:12,
                fontFamily:"'JetBrains Mono',monospace"}}>Lucius AI</div>
              <div style={{background:Z.s2,borderRadius:14,overflow:"hidden",
                border:`1px solid ${Z.b}`,marginBottom:20}}>
                <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:"rgba(200,100,255,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>🧠</div>
                  <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:Z.t,marginBottom:2}}>API Key Groq</div>
                    <div style={{fontSize:11,color:Z.t3}}>Salvata localmente, mai condivisa</div>
                  </div>
                </div>
                <div style={{padding:"0 16px 14px"}}>
                  <input type="password"
                    defaultValue={localStorage.getItem("m-apikey")||""}
                    onChange={e=>localStorage.setItem("m-apikey",e.target.value)}
                    placeholder="gsk_api03-..."
                    style={{width:"100%",background:Z.s1,
                      border:`1px solid ${Z.b}`,borderRadius:10,
                      padding:"11px 13px",color:Z.t,fontSize:13,
                      outline:"none",boxSizing:"border-box",
                      fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em"}}/>
                </div>
              </div>
            </div>

            {/* Sezione: Dati */}
            <div style={{padding:"0 20px 0"}}>
              <div style={{fontSize:10,fontWeight:800,color:Z.t3,letterSpacing:"0.12em",
                textTransform:"uppercase",marginBottom:12,
                fontFamily:"'JetBrains Mono',monospace"}}>Dati</div>
              <div style={{background:Z.s2,borderRadius:14,overflow:"hidden",
                border:`1px solid ${Z.b}`,marginBottom:20}}>

                {/* Export */}
                <button onClick={()=>doBackup(false)}
                  style={{width:"100%",padding:"14px 16px",
                    display:"flex",alignItems:"center",gap:12,
                    background:"transparent",borderBottom:`1px solid ${Z.b}`,
                    textAlign:"left"}}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:"rgba(56,189,248,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>⬇</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#38bdf8"}}>Esporta backup</div>
                    <div style={{fontSize:11,color:Z.t3}}>Scarica tutti i dati in JSON</div>
                  </div>
                  <span style={{marginLeft:"auto",color:Z.t3,fontSize:16}}>›</span>
                </button>

                {/* Import */}
                <label style={{width:"100%",padding:"14px 16px",
                  display:"flex",alignItems:"center",gap:12,
                  background:"transparent",borderBottom:`1px solid ${Z.b}`,
                  cursor:"pointer"}}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:"rgba(250,204,21,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>⬆</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#facc15"}}>Importa backup</div>
                    <div style={{fontSize:11,color:Z.t3}}>Ripristina da file JSON</div>
                  </div>
                  <span style={{marginLeft:"auto",color:Z.t3,fontSize:16}}>›</span>
                  <input type="file" accept=".json" style={{display:"none"}}
                    onChange={e=>{
                      const file=e.target.files[0];
                      if(!file)return;
                      const reader=new FileReader();
                      reader.onload=ev=>{
                        try{
                          const parsed=JSON.parse(ev.target.result);
                          if(parsed.data)setData(parsed.data);
                          if(parsed.tr)setTr(parsed.tr);
                          if(parsed.logs)setLogs(parsed.logs);
                          showToast("Backup importato ✓");
                        }catch(err){showToast("File non valido");}
                      };
                      reader.readAsText(file);
                      e.target.value="";
                    }}/>
                </label>

                {/* Reset streak */}
                <button onClick={()=>{localStorage.removeItem("m-tr");localStorage.removeItem("m-lg");setTr({});setLogs({});showToast("Streak azzerate ✓");}} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,background:"transparent",textAlign:"left",border:"none",cursor:"pointer",borderBottom:`1px solid ${Z.b}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(201,168,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🔄</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#c9a826"}}>Reset streak</div>
                    <div style={{fontSize:11,color:Z.t3,marginTop:2}}>Azzera solo storico abitudini</div>
                  </div>
                </button>

                {/* Reset */}
                <button onClick={()=>{
                  if(window.confirm("Eliminare tutti i dati? Questa azione è irreversibile.")){
                    localStorage.removeItem("m8");
                    localStorage.removeItem("m-tr");
                    localStorage.removeItem("m-lg");
                    setData(INIT);
                    setTr({});
                    setLogs({});
                    showToast("Tutti i dati sono stati eliminati");
                  }
                }}
                  style={{width:"100%",padding:"14px 16px",
                    display:"flex",alignItems:"center",gap:12,
                    background:"transparent",textAlign:"left"}}>
                  <div style={{width:36,height:36,borderRadius:10,
                    background:"rgba(248,113,113,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:18,flexShrink:0}}>🗑</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#f87171"}}>Reset dati</div>
                    <div style={{fontSize:11,color:Z.t3}}>Elimina abitudini, task e obiettivi</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#f87171",fontSize:16}}>›</span>
                </button>
              </div>
            </div>

            <div style={{height:32}}/>
          </div>
        </div>
      )}
      {editH&&<EditHabit item={editH} logs={logs} data={data} setData={setData} onSave={saveHabit} onDel={delHabit} onClose={()=>setEditH(null)} onSaveLog={saveWorkoutLog}/>}
      {addingH&&(
        <div onClick={()=>{setAddingH(false);setAddArea(null);}}
          style={{position:"fixed",inset:0,zIndex:900,
            background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",
            display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"100%",maxWidth:480,background:Z.s1,
              borderRadius:"18px 18px 0 0",overflow:"hidden"}}>
            <div style={{height:3,background:"linear-gradient(90deg, #facc15, #f97316, #84cc16, #38bdf8)"}}/>
            <div style={{padding:"20px 20px 40px"}}>
            <div style={{width:36,height:4,background:Z.b2,borderRadius:2,
              margin:"0 auto 20px"}}/>
            <div style={{fontSize:16,fontWeight:700,color:Z.t,marginBottom:16}}>
              Nuova abitudine
            </div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {data.aree.map(area=>(
                <button key={area.id}
                  onClick={()=>setAddArea(a=>a===area.id?null:area.id)}
                  style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,
                    background:addArea===area.id?`${area.color}20`:"rgba(255,255,255,0.05)",
                    border:`1.5px solid ${addArea===area.id?area.color:"rgba(255,255,255,0.1)"}`,
                    color:addArea===area.id?area.color:Z.t3}}>
                  {area.nome}
                </button>
              ))}
            </div>
            {addArea&&data.aree.find(a=>a.id===addArea)&&(
              <AddInArea area={data.aree.find(a=>a.id===addArea)}
                onAdd={(catId,nome)=>{
                  if(!nome||!nome.trim())return;
                  addHabit(catId,nome.trim());
                  setAddingH(false);
                  setAddArea(null);
                }}
                color={data.aree.find(a=>a.id===addArea).color}/>
            )}
            {!addArea&&(
              <div style={{fontSize:13,color:Z.t3,textAlign:"center",padding:"8px 0"}}>
                {"Seleziona un'area sopra"}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
      {(editG||newG)&&<EditGoal item={editG||{}} isNew={newG} onSave={ch=>saveGoal(ch,newG)} onDel={delGoal} onClose={()=>{setEditG(null);setNewG(false);}}/>}
      {editT&&<EditTask task={editT} onSave={updTask} onDel={()=>delTask(editT.id)} onClose={()=>setEditT(null)} aree={data.aree}/>}
      {toast&&<Toast msg={toast.msg} onUndo={toast.onUndo} onDone={()=>setToast(null)}/>}
      {wakeH&&<WakeLog h={wakeH} logs={logs} onLog={saveWake} onClose={()=>setWakeH(null)}/>}
      {addingTask&&<EditTask task={{}} onSave={addTask} onDel={()=>{}} onClose={()=>setAddingTask(false)} aree={data.aree}/>}

      {/* HEADER */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,zIndex:200,
        background:"rgba(10,10,10,0.95)",
        backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
        borderBottom:`1px solid ${Z.b}`,padding:"10px 16px 8px",
        boxSizing:"border-box"}}>

        {/* Riga 1: brand+azioni (sx) — data+punteggio (dx) */}
        <div style={{display:"flex",alignItems:"center",
          justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:2,minWidth:0}}>
            <span style={{fontSize:20,fontWeight:800,color:Z.t,
              letterSpacing:"-0.5px",flexShrink:0}}>Meridian</span>
            <button onClick={()=>setShowNotes(true)}
              style={{background:"transparent",border:"none",
                opacity:0.5,padding:"6px",borderRadius:9,
                lineHeight:1,cursor:"pointer",flexShrink:0,
                display:"flex",alignItems:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{color:Z.t}}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="13" y2="17"/>
              </svg>
            </button>
            <button onClick={()=>setShowSettings(true)}
              style={{background:"transparent",border:"none",
                opacity:0.5,padding:"6px",borderRadius:9,
                lineHeight:1,cursor:"pointer",flexShrink:0,
                display:"flex",alignItems:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{color:Z.t}}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,flexShrink:0,marginLeft:8,minWidth:0,overflow:"hidden"}}>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",textTransform:"capitalize",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {(()=>{const d=new Date();
                const wd=d.toLocaleDateString("it-IT",{weekday:"long"});
                const dd=String(d.getDate()).padStart(2,"0");
                const mm=String(d.getMonth()+1).padStart(2,"0");
                const yy=d.getFullYear();
                return `${wd} ${dd}/${mm}/${yy}`;})()}
            </span>
            <span style={{fontSize:13,fontWeight:800,color:"#ffffff",
              fontFamily:"'JetBrains Mono',monospace"}}>
              {(data.vita?Math.round(Object.values(data.vita).reduce((s,v)=>s+v,0)/Object.values(data.vita).length*10)/10:0)}
              <span style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>/10</span>
            </span>
          </div>
        </div>

        {/* Riga 2: barra abitudini + task + circle obiettivi */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,height:2,background:Z.b,borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${tpct}%`,
              background:tpct===100?"#00e5a0":SILVER,borderRadius:1,transition:"width 0.4s"}}/>
          </div>
          <span style={{fontSize:12,fontWeight:600,color:"#f0f0f0",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
            {tdone}/{todayH.length}
          </span>
          <span style={{color:"rgba(255,255,255,0.25)",fontSize:11}}>·</span>
          <span style={{fontSize:12,fontWeight:600,color:"#f0f0f0",flexShrink:0}}>
            {(data.tasks||[]).filter(t=>!t.done).length} Task
          </span>
          <span style={{color:"rgba(255,255,255,0.25)",fontSize:11}}>·</span>
          <GoalCircle avg={(data.goals&&data.goals.length)?Math.round(data.goals.reduce((s,g)=>s+(g.pct||0),0)/data.goals.length):null}/>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"74px 14px 90px",
        WebkitOverflowScrolling:"touch"}}
        className={`screen-${screen}`}>
        <div style={{animation:"fadeup 0.22s cubic-bezier(0.16,1,0.3,1) both"}}
          key={screen}>
          {backupBanner&&(
            <div style={{display:"flex",alignItems:"center",gap:10,
              padding:"10px 12px",marginBottom:14,borderRadius:12,
              background:"rgba(56,189,248,0.08)",
              border:"1px solid rgba(56,189,248,0.25)"}}>
              <span style={{fontSize:16,flexShrink:0}}>🗂️</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"#38bdf8"}}>
                  Backup non aggiornato
                </div>
                <div style={{fontSize:10,color:Z.t3,marginTop:1}}>
                  Sono passati 14+ giorni dall'ultimo salvataggio
                </div>
              </div>
              <button onClick={()=>doBackup(false)}
                style={{flexShrink:0,padding:"7px 12px",fontSize:11,fontWeight:700,
                  background:"#38bdf8",color:"#0a0a0a",border:"none",
                  borderRadius:8,cursor:"pointer"}}>
                Esporta
              </button>
              <button onClick={()=>setBackupBanner(false)}
                style={{flexShrink:0,fontSize:14,color:Z.t3,background:"transparent",
                  border:"none",cursor:"pointer",padding:"0 2px"}}>×</button>
            </div>
          )}
          {screen==="home"     &&<Home data={data} tr={tr} logs={logs} showToast={showToast} onDel={delHabit} onToggle={toggle} onEditTask={setEditT} onDelTask={delTask}
            onEditHabit={h=>setEditH({...h})}
            onLog={h=>h.logType==="sveglia"?setWakeH(h):setEditH({...h})}
            setScreen={setScreen} setData={setData} onAddTask={()=>setAddingTask(true)}/>}
          {screen==="abitudini"&&<Abitudini data={data} tr={tr} logs={logs} onDel={delHabit} onToggle={toggle}
            onChangeStatus={(hId,s)=>setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(cat=>({...cat,h:(cat.h||[]).map(h=>h.id===hId?{...h,s}:h)}))}))}))}
            onEdit={h=>setEditH({...h})}
            onLog={h=>h.logType==="sveglia"?setWakeH(h):setEditH({...h})} onAdd={addHabit} addingH={addingH} setAddingH={setAddingH}/>}
          {screen==="task"     &&<TaskScreen data={data} setData={setData} onAdd={()=>setAddingTask(true)} showToast={showToast} onEditTask={setEditT} onDelTask={delTask}/>}
          {screen==="obiettivi"&&<Obiettivi data={data} setData={setData} showToast={showToast} editG={editG} setEditG={setEditG} newG={newG} setNewG={setNewG}/>}
          {screen==="visione"  &&<Vita data={data} setData={setData}/>}
          {screen==="analisi"  &&<Lucius data={data} tr={tr}/>}
        </div>
      </div>

      {/* NAV BOTTOM */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,maxWidth:480,margin:"0 auto",
        background:"rgba(10,10,10,0.97)",
        backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
        borderTop:`1px solid ${Z.b}`,
        padding:"6px 8px calc(6px + env(safe-area-inset-bottom))",
        display:"flex",gap:0}}>
        {NAV.map(n=>{
          const a=screen===n.id;
          return(
            <button key={n.id} onClick={()=>setScreen(n.id)}
              style={{flex:1,padding:"6px 2px",display:"flex",
                flexDirection:"column",alignItems:"center",gap:2,
                background:"transparent",border:"none",cursor:"pointer"}}>
              <div style={{position:"relative",display:"flex",
                alignItems:"center",justifyContent:"center"}}>
                {ICONS[n.id]&&ICONS[n.id](a)}
                {n.id==="task"&&urgCount>0&&(
                  <div style={{position:"absolute",top:-3,right:-5,
                    width:14,height:14,borderRadius:"50%",
                    background:"#f87171",
                    display:"flex",alignItems:"center",
                    justifyContent:"center",
                    fontSize:8,fontWeight:700,color:"white"}}>
                    {urgCount>9?"9+":urgCount}
                  </div>
                )}
              </div>
              <span style={{fontSize:9,fontWeight:a?700:400,
                color:a?SILVER_BRIGHT:Z.t3,letterSpacing:"0.01em"}}>
                {n.l}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
