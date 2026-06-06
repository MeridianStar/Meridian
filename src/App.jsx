import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ================================================================
// MERIDIAN — Simple, beautiful, fast
// Dark only. Inter font. Touch-first.
// ================================================================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body{height:100%;background:#0a0a0a;overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{display:none;}scrollbar-width:none;
  input,textarea,button{font-family:inherit;}
  button{cursor:pointer;border:none;background:none;}
  button:active{opacity:0.65;}
  @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes in{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
  .up{animation:up 0.35s cubic-bezier(0.16,1,0.3,1) both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
  .in{animation:in 0.25s cubic-bezier(0.16,1,0.3,1) both}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:transparent;outline:none;border:none;}
  input[type=range]::-webkit-slider-track{height:4px;border-radius:2px;background:var(--t,#222);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;margin-top:-8px;border-radius:50%;background:var(--c,#818cf8);cursor:pointer;}
`;

// ── TOKENS ──────────────────────────────────────────────────────
const Z = {
  bg: "#0a0a0a",
  s1: "#111111",
  s2: "#1a1a1a",
  s3: "#222222",
  b: "#2a2a2a",
  b2: "#333333",
  t: "#ffffff",
  t2: "#999999",
  t3: "#666666",
};

const ACCENT = {
  home: "#818cf8",
  abitudini: "#34d399",
  goals: "#fbbf24",
  task: "#a78bfa",
  vita: "#f472b6",
  stats: "#38bdf8",
};

const STATUS = {
  red: {l:"Critico", c:"#f87171"},
  orange:{l:"Scarso", c:"#fb923c"},
  yellow:{l:"Buono", c:"#fbbf24"},
  green: {l:"Ottimo", c:"#34d399"},
};

const AREA_COL = {
  salute:"#34d399", lavoro:"#fb923c",
  relazioni:"#f472b6", gioia:"#fbbf24",
};

// ── UTILS ───────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,"0");
function tod(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function ago(n){ const d=new Date(); d.setDate(d.getDate()-n); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
const d7 = ()=>Array.from({length:7}, (_,i)=>ago(6-i));
const d30 = ()=>Array.from({length:30},(_,i)=>ago(29-i));
const d84 = ()=>Array.from({length:84},(_,i)=>ago(83-i));
const uid = ()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const noE = s=>s.replace(/\p{Emoji_Presentation}/gu,"").trim();

function strk(id,tr){
  let n=0,d=new Date();
  if(!tr[id]?.[tod()])d.setDate(d.getDate()-1);
  while(true){const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;if(!tr[id]?.[k])break;n++;d.setDate(d.getDate()-1);}
  return n;
}
function wscr(habits,tr,off=0){
  const days=Array.from({length:7},(_,i)=>ago(off*7+6-i));
  if(!habits.length)return 0;
  const tot=habits.reduce((s,h)=>s+expectedInWeek(h,days),0);
  if(!tot)return 0;
  return Math.round(habits.reduce((s,h)=>s+days.filter(d=>tr[h.id]?.[d]).length,0)/tot*100);
}
function dl(s){
  if(!s)return null;
  const d=new Date(s+"T00:00:00"),t=new Date();t.setHours(0,0,0,0);
  const diff=Math.round((d-t)/86400000);
  const mo=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
  if(diff<0) return{txt:`Scaduta`, c:"#f87171",u:true};
  if(diff===0)return{txt:"Oggi", c:Z.t2, u:false};
  if(diff<=3) return{txt:`Tra ${diff}g`,c:"#fbbf24", u:false};
  return {txt:`${d.getDate()} ${mo[d.getMonth()]}`,c:Z.t3,u:false};
}
function greet(){const h=new Date().getHours();return h<5?"Buonanotte":h<12?"Buongiorno":h<17?"Buon pomeriggio":h<21?"Buonasera":"Buonanotte";}
function flatH(aree){const r=[];(aree||[]).forEach(a=>(a.cat||[]).forEach(c=>(c.h||[]).forEach(h=>r.push({...h,aId:a.id,aN:a.nome,cN:c.nome}))));return r;}

// ── FREQUENZA HELPERS ────────────────────────────────────────────
// freq: {type:"daily"} | {type:"weekly",n:3} | {type:"days",d:[1,3,5]}
// d: 0=dom,1=lun,2=mar,3=mer,4=gio,5=ven,6=sab
function isExpected(h, dateStr){
  const freq = h.freq || {type:"daily"};
  if(freq.type==="daily") return true;
  const dow = new Date(dateStr+"T00:00:00").getDay(); // 0=dom
  if(freq.type==="days") return (freq.d||[]).includes(dow);
  // weekly(n): attesa ogni giorno, ma il calcolo completamento usa n/7
  if(freq.type==="weekly") return true;
  return true;
}

function expectedInWeek(h, days){
  const freq = h.freq || {type:"daily"};
  if(freq.type==="daily") return days.length;
  if(freq.type==="weekly") return Math.min(freq.n||1, days.length);
  if(freq.type==="days") return days.filter(d=>(freq.d||[]).includes(new Date(d+"T00:00:00").getDay())).length;
  return days.length;
}

// Streak rispettosa della frequenza: non si spezza nei giorni non attesi
function strkF(h, tr){
  const freq = h.freq || {type:"daily"};
  let n=0, d=new Date();
  // Se oggi non è completato e non è atteso, torna a ieri
  const todayStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  if(!tr[h.id]?.[todayStr]) d.setDate(d.getDate()-1);
  let safety = 0;
  while(safety++ < 400){
    const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const expected = isExpected(h, k);
    const done = !!(tr[h.id]?.[k]);
    if(expected && !done) break; // giorno atteso non completato → streak finita
    if(expected && done) n++; // giorno atteso e completato → incrementa
    // giorno non atteso → salta senza rompere
    d.setDate(d.getDate()-1);
  }
  return n;
}


const INIT = {
  tasks:[],
  vita:{"v-mente":5,"v-corpo":5,"v-salute":5,"v-carriera":5,"v-finanze":5,"v-progetto":5,"v-amore":5,"v-famiglia":5,"v-sociale":5,"v-apprendimento":5,"v-passioni":5,"v-spirito":5,"v-casa":5,"v-citta":5,"v-natura":5},
  goals:[
    {id:"g1",text:"💪 Massa grassa al 15%",s:"red",note:"",pct:0,tasks:[
      {id:"g1t1",text:"Visita medica baseline",done:false},
      {id:"g1t2",text:"Piano alimentare con nutrizionista",done:false},
      {id:"g1t3",text:"Allenamento 3x settimana",done:false},
      {id:"g1t4",text:"Pesarsi ogni lunedì mattina",done:false},
      {id:"g1t5",text:"Target: -1% BF ogni mese",done:false},
    ]},
    {id:"g2",text:"🚀 Top #3 Senior Manager",s:"red",note:"",pct:0,tasks:[
      {id:"g2t1",text:"Aggiornare CV e LinkedIn",done:false},
      {id:"g2t2",text:"3 colloqui interni entro Q3",done:false},
      {id:"g2t3",text:"Trovare un mentore dirigente",done:false},
      {id:"g2t4",text:"Completare corso leadership",done:false},
    ]},
    {id:"g3",text:"💍 Matrimonio con Costanza",s:"red",note:"",pct:0,tasks:[
      {id:"g3t1",text:"Scegliere la location",done:false},
      {id:"g3t2",text:"Definire lista invitati",done:false},
      {id:"g3t3",text:"Fotografo e catering",done:false},
      {id:"g3t4",text:"Abiti e accessori",done:false},
      {id:"g3t5",text:"Destinazione luna di miele",done:false},
    ]},
    {id:"g4",text:"🏦 Risparmio 30.000€ CD",s:"red",note:"",pct:0,tasks:[
      {id:"g4t1",text:"Aprire conto deposito",done:false},
      {id:"g4t2",text:"Bonifico mensile automatico",done:false},
      {id:"g4t3",text:"Eliminare 2 spese fisse",done:false},
    ]},
    {id:"g5",text:"📖 Lettura 10 libri",s:"red",note:"",pct:0,tasks:[
      {id:"g5t1",text:"La lezione del Giappone",done:false},
      {id:"g5t2",text:"Il nome della rosa",done:false},
      {id:"g5t3",text:"Siddharta",done:false},
      {id:"g5t4",text:"L'arte della guerra",done:false},
      {id:"g5t5",text:"Il conte di Montecristo",done:false},
      {id:"g5t6",text:"Sapiens",done:false},
      {id:"g5t7",text:"La fattoria degli animali",done:false},
      {id:"g5t8",text:"Dune",done:false},
      {id:"g5t9",text:"Cent'anni di solitudine",done:false},
      {id:"g5t10",text:"Il Signore degli Anelli",done:false},
    ]},
  ],
  aree:[
    {id:"salute", nome:"Salute", color:"#34d399",cat:[{id:"mente", nome:"Mente", h:[]},{id:"fisico",nome:"Fisico",h:[]},{id:"vita2",nome:"Benessere",h:[]}]},
    {id:"lavoro", nome:"Ingegno", color:"#fb923c",cat:[{id:"ricch", nome:"Ricchezza",h:[]},{id:"carr", nome:"Carriera",h:[]},{id:"proj", nome:"Progetti",h:[]}]},
    {id:"relazioni",nome:"Legami",color:"#f472b6",cat:[{id:"amore", nome:"Amore", h:[]},{id:"fam", nome:"Famiglia",h:[]},{id:"amici",nome:"Amici", h:[]}]},
    {id:"gioia", nome:"Armonia", color:"#fbbf24",cat:[{id:"amb", nome:"Ambiente",h:[]},{id:"pass", nome:"Passioni",h:[]},{id:"svil", nome:"Crescita",h:[]}]},
  ],
};


// ================================================================
// ATOMS
// ================================================================
function Ring({pct,size=64,sw=5,color,bg,children}){
  const r=(size-sw*2)/2,ci=2*Math.PI*r,p=Math.min(100,Math.max(0,pct||0));
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute",inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg||`${color}22`} strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={ci} strokeDashoffset={ci*(1-p/100)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>
    </div>
  );
}

function Dot({c,size=8}){return <div style={{width:size,height:size,borderRadius:"50%",background:c,flexShrink:0}}/>;}

function Num({v,size=22,color}){
  return <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:size,fontWeight:700,color,lineHeight:1}}>{v}</span>;
}

// ── WAKE TIME LOG ────────────────────────────────────────────────
function WakeLog({h,logs,onLog,onClose}){
  const ts=tod();
  const existing=logs[h.id]?.[ts]?.wakeTime||"";
  const [time,setTime]=useState(existing);
  const hist=d7().map(d=>({d,t:logs[h.id]?.[d]?.wakeTime})).filter(x=>x.t);
  return(
    <Modal onClose={onClose} title="Ora sveglia" accent={AREA_COL[h.aId]||ACCENT.home}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)}
          style={{background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:12,
            padding:"16px 20px",color:Z.t,fontSize:32,fontWeight:700,
            fontFamily:"'JetBrains Mono',monospace",boxSizing:"border-box",
            textAlign:"center",width:"100%",outline:"none"}}/>
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
                alignItems:"center",padding:"7px 0",
                borderBottom:`1px solid ${Z.b}`}}>
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
        <button onClick={()=>{
          if(time)onLog(h.id,{wakeTime:time});
          onClose();
        }} style={{flex:2,padding:13,background:AREA_COL[h.aId]||ACCENT.home,
          border:"none",borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>
          Salva
        </button>
      </div>
    </Modal>
  );
}

// ── MODAL OVERLAY (used for Edit sheets only) ────────────────────
// NOT used for adding habits — that's inline
function Modal({onClose,title,accent,children}){
  useEffect(()=>{const p=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=p||"";};},[]);
  const col=accent||ACCENT.home;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:800,
      background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="in"
        style={{width:"100%",maxWidth:480,background:Z.s1,
          borderRadius:"18px 18px 0 0",
          borderTop:`2px solid ${col}`,
          paddingBottom:"env(safe-area-inset-bottom,12px)",
          maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{width:36,height:4,background:Z.b2,borderRadius:2,margin:"12px auto 0",flexShrink:0}}/>
        {title&&<div style={{padding:"14px 20px 0",fontSize:15,fontWeight:700,color:Z.t,flexShrink:0}}>{title}</div>}
        <div style={{padding:"12px 20px 20px",overflowY:"auto",overscrollBehavior:"contain",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

// ── HABIT ROW ────────────────────────────────────────────────────
function HRow({h,tr,logs,onToggle,onEdit,onLog,compact}){
  const ts=tod(),done=!!(tr[h.id]?.[ts]);
  const wk=!compact?d7().filter(d=>tr[h.id]?.[d]).length:0;
  const sk=!compact?strkF(h,tr):0;
  const sc=STATUS[h.s]||STATUS.red;
  const col=AREA_COL[h.aId]||ACCENT.home;

  // Swipe
  const swX=useRef(0),swS=useRef(0),[tx,setTx]=useState(0),[swiping,setSwiping]=useState(false);
  const prog=Math.min(1,tx/60);

  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:10,marginBottom:5}}>
      {/* Swipe bg */}
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",paddingLeft:14,pointerEvents:"none",
        background:done?`rgba(248,113,113,${prog*0.25})`:`rgba(52,211,153,${prog*0.25})`}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:done?"#f87171":"#34d399",
          display:"flex",alignItems:"center",justifyContent:"center",
          transform:`scale(${0.3+prog*0.7})`,opacity:prog}}>
          <span style={{color:"white",fontSize:13,fontWeight:800}}>{done?"✕":"✓"}</span>
        </div>
      </div>

      <div
        onTouchStart={e=>{swS.current=e.touches[0].clientX;swX.current=0;setSwiping(true);}}
        onTouchMove={e=>{if(!swiping)return;const dx=Math.max(0,Math.min(80,e.touches[0].clientX-swS.current));swX.current=dx;setTx(dx);}}
        onTouchEnd={()=>{setSwiping(false);if(swX.current>60){onToggle(h.id);if(navigator.vibrate)navigator.vibrate([8,4,8]);}swX.current=0;setTx(0);}}
        style={{display:"flex",alignItems:"center",gap:11,
          padding:compact?"11px 13px":"12px 14px",
          background:done?"rgba(52,211,153,0.07)":Z.s1,
          border:`1px solid ${done?"rgba(52,211,153,0.2)":Z.b}`,
          borderRadius:10,
          transform:`translateX(${tx}px)`,
          transition:swiping?"none":"transform 0.28s cubic-bezier(0.16,1,0.3,1)"}}>

        <button onClick={e=>{e.stopPropagation();onToggle(h.id);}}
          style={{width:26,height:26,borderRadius:"50%",flexShrink:0,padding:0,
            background:done?"#34d399":"transparent",
            border:`1.5px solid ${done?"#34d399":Z.b2}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"white",fontSize:13,fontWeight:700,transition:"all 0.18s"}}>
          {done&&"✓"}
        </button>

        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>swX.current<8&&onEdit(h)}>
          <div style={{fontSize:15,fontWeight:done?400:500,color:done?Z.t3:Z.t,
            textDecoration:done?"line-through":"none",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {h.nome}
          </div>
          {!compact&&h.freq&&h.freq.type!=="daily"&&(
            <div style={{fontSize:10,color:Z.t3,marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>
              {h.freq.type==="weekly"?`${h.freq.n||3}x settimana`:
               ["D","L","M","M","G","V","S"].filter((_,i)=>(h.freq.d||[]).includes(i)).join(" ")}
            </div>
          )}
          {!compact&&(
            <div style={{display:"flex",gap:3,marginTop:5,alignItems:"center"}}>
              {d7().map(d=>{
                const exp=isExpected(h,d),dn=!!(tr[h.id]?.[d]);
                return <div key={d} style={{width:7,height:7,borderRadius:2,
                  background:dn?col:exp?Z.b:"transparent",
                  border:exp?"none":`1px dashed ${Z.b}`,
                  opacity:exp?1:0.35,transition:"background 0.2s"}}/>;
              })}
              <span style={{fontSize:10,color:Z.t3,marginLeft:5,fontFamily:"'JetBrains Mono',monospace"}}>{wk}/{d7().filter(d=>isExpected(h,d)).length}</span>
              {sk>1&&<span style={{fontSize:11,color:"#fb923c",marginLeft:6,fontWeight:600}}>🔥{sk}</span>}
            </div>
          )}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          {onLog&&h.logType==="sveglia"&&(()=>{
            const todayWake=(logs||{})[h.id]?.[tod()]?.wakeTime;
            return(
              <button onClick={e=>{e.stopPropagation();onLog(h);}}
                style={{fontSize:12,padding:"2px 7px",background:todayWake?AREA_COL[h.aId]+"22":Z.s2,
                  border:`1px solid ${todayWake?AREA_COL[h.aId]+"55":Z.b}`,
                  borderRadius:6,color:todayWake?AREA_COL[h.aId]:Z.t2,
                  fontFamily:"'JetBrains Mono',monospace",lineHeight:1.4,
                  fontWeight:todayWake?700:400}}>
                {todayWake||"⏰"}
              </button>
            );
          })()}
          <Dot c={sc.c} size={7}/>
        </div>
      </div>
    </div>
  );
}

// ── AREA SECTION (for Abitudini screen) ─────────────────────────
function AreaSection({area,tr,logs,onToggle,onEdit,onLog,onReorder,onAdd}){
  const [open,setOpen]=useState(false);
  const [adding,setAdding]=useState(null); // catId
  const [newName,setNewName]=useState("");
  const inputRef=useRef(null);
  const col=area.color||ACCENT.home;
  const ts=tod();
  const habits=flatH([area]);
  const dn=habits.filter(h=>tr[h.id]?.[ts]).length;
  const todayH=habits.filter(h=>isExpected(h,ts));
  const pct=todayH.length?Math.round(todayH.filter(h=>tr[h.id]?.[ts]).length/todayH.length*100):habits.length?100:0;

  const tmr=useRef(null),drag=useRef(false);
  const [dI,setDI]=useState(null),[oI,setOI]=useState(null);
  useEffect(()=>()=>clearTimeout(tmr.current),[]);
  const hDS=idx=>{tmr.current=setTimeout(()=>{setDI(idx);drag.current=true;if(navigator.vibrate)navigator.vibrate(30);},400);};
  const hDE=()=>{clearTimeout(tmr.current);drag.current=false;setDI(null);setOI(null);};
  const hDM=e=>{if(!drag.current)return;const pt=e.touches[0],els=document.elementsFromPoint(pt.clientX,pt.clientY);for(const el of els){const i=el.getAttribute("data-i");if(i!=null){setOI(+i);break;}}};

  const startAdd=(catId)=>{
    setAdding(catId);
    setNewName("");
    setTimeout(()=>inputRef.current?.focus(),60);
  };

  const doAdd=()=>{
    if(newName.trim()&&adding){onAdd(adding,newName.trim());}
    setAdding(null);setNewName("");
  };

  return(
    <div style={{marginBottom:8}}>
      {/* Header */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",display:"flex",alignItems:"center",gap:12,
          padding:"14px 16px",background:Z.s1,
          border:`1px solid ${open?col+"55":Z.b}`,
          borderRadius:open?"14px 14px 0 0":14,
          textAlign:"left",transition:"border-color 0.2s,border-radius 0.2s"}}>
        {/* Mini ring */}
        <Ring pct={pct} size={38} sw={3.5} color={col}>
          <span style={{fontSize:9,fontWeight:700,color:col,fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</span>
        </Ring>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:600,color:Z.t}}>{area.nome}</div>
          <div style={{fontSize:12,color:Z.t2,marginTop:1}}>{habits.length} abitudini · {dn} oggi</div>
        </div>
        <span style={{color:Z.t3,fontSize:16,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
      </button>

      {/* Expanded */}
      {open&&(
        <div style={{background:Z.s1,border:`1px solid ${col}55`,borderTop:"none",
          borderRadius:"0 0 14px 14px",padding:"8px 14px 14px"}}
          onTouchMove={hDM} onTouchEnd={hDE} onTouchCancel={hDE}>
          {area.cat.map(cat=>{
            const catHabits=cat.h||[];
            return(
              <div key={cat.id} style={{marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600,color:col,letterSpacing:"0.08em",
                  textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>
                  {cat.nome}
                </div>

                {catHabits.map((h,i)=>(
                  <div key={h.id} data-i={i} onTouchStart={()=>hDS(i)}
                    style={{opacity:dI===i?0.2:1,transition:"opacity 0.15s"}}>
                    <HRow h={h} tr={tr} logs={logs} onToggle={onToggle}
                      onEdit={()=>!drag.current&&onEdit({...h,aId:area.id})}
                      onLog={onLog?h2=>onLog({...h2,aId:area.id}):null}/>
                  </div>
                ))}

                {/* Add inline — no modal, no bottom sheet */}
                {adding===cat.id?(
                  <div className="in" style={{background:Z.s2,borderRadius:10,
                    border:`1.5px solid ${col}60`,padding:"10px 12px",marginTop:4}}>
                    <input ref={inputRef}
                      value={newName} onChange={e=>setNewName(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")doAdd();if(e.key==="Escape"){setAdding(null);setNewName("");}}}
                      placeholder="Nome abitudine..."
                      style={{width:"100%",background:"transparent",border:"none",
                        color:Z.t,fontSize:16,outline:"none",marginBottom:10,
                        WebkitTextSizeAdjust:"100%"}}/>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setAdding(null);setNewName("");}}
                        style={{flex:1,padding:"9px",background:Z.b,borderRadius:8,
                          color:Z.t2,fontSize:14}}>
                        Annulla
                      </button>
                      <button onClick={doAdd}
                        style={{flex:2,padding:"9px",
                          background:newName.trim()?col:Z.b,
                          borderRadius:8,color:newName.trim()?"white":Z.t3,
                          fontSize:14,fontWeight:600,transition:"background 0.15s"}}>
                        Aggiungi
                      </button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>startAdd(cat.id)}
                    style={{width:"100%",padding:"9px 0",marginTop:4,
                      background:"transparent",border:`1px dashed ${Z.b2}`,
                      borderRadius:10,color:Z.t3,fontSize:14,
                      display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span style={{color:col,fontSize:16,lineHeight:1}}>+</span>
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

// ================================================================
// SCREENS
// ================================================================

// ── HOME ─────────────────────────────────────────────────────────
function Home({data,tr,logs,onToggle,onEdit,onLog,setScreen,setData}){
  const ts=tod();
  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const done=habits.filter(h=>tr[h.id]?.[ts]);
  const rem=habits.filter(h=>!tr[h.id]?.[ts]&&isExpected(h,ts));
  const todayExp=habits.filter(h=>isExpected(h,ts));
  const pct=todayExp.length?Math.round(done.filter(h=>isExpected(h,ts)).length/todayExp.length*100):0;
  const pending=(data.tasks||[]).filter(t=>!t.done);
  const urg=pending.filter(t=>t.deadline&&dl(t.deadline)?.u);
  const [editT,setEditT]=useState(null);
  const [addTask,setAddTask]=useState(false);
  const [newTxt,setNewTxt]=useState("");
  const [newDl,setNewDl]=useState("");
  const togT=id=>setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const delT=id=>setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));
  const addT=()=>{if(!newTxt.trim())return;setData(d=>({...d,tasks:[...(d.tasks||[]),{id:uid(),text:newTxt.trim(),done:false,deadline:newDl}]}));setNewTxt("");setNewDl("");setAddTask(false);};
  const ac=pct===100?ACCENT.abitudini:ACCENT.home;
  const dateStr=new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"});

  return(
    <div>
      {editT&&(
        <Modal onClose={()=>setEditT(null)} title="Task" accent={ACCENT.task}>
          <input defaultValue={editT.text} id="ht-txt"
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
              padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:500,
              boxSizing:"border-box",marginBottom:12}}/>
          <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Scadenza</div>
          <input type="date" defaultValue={editT.deadline||""} id="ht-dl"
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,
              padding:"12px 13px",color:Z.t,fontSize:14,boxSizing:"border-box",marginBottom:16}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{delT(editT.id);setEditT(null);}}
              style={{padding:"11px 14px",background:Z.s2,borderRadius:10,color:Z.t2,fontSize:17,lineHeight:1}}>🗑</button>
            <button onClick={()=>setEditT(null)}
              style={{flex:1,padding:11,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>{
              const txt=document.getElementById("ht-txt")?.value.trim()||editT.text;
              const ddl=document.getElementById("ht-dl")?.value||editT.deadline;
              setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===editT.id?{...t,text:txt,deadline:ddl}:t)}));
              setEditT(null);
            }} style={{flex:2,padding:11,background:ACCENT.task,borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>Salva</button>
          </div>
        </Modal>
      )}

      {/* ── HEADER COMPATTO ── */}
      <div className="up" style={{display:"flex",alignItems:"baseline",
        justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:11,color:Z.t3,marginBottom:3,textTransform:"capitalize",
            fontFamily:"'JetBrains Mono',monospace"}}>{dateStr}</div>
          <h1 style={{fontSize:24,fontWeight:800,color:Z.t,lineHeight:1.15,
            letterSpacing:"-0.4px",margin:0}}>
            {greet()}, <span style={{color:ac}}>Davide</span>
          </h1>
        </div>
        {habits.length>0&&(
          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
            <div style={{fontSize:26,fontWeight:800,color:ac,
              fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>
              {pct}<span style={{fontSize:14,fontWeight:400,color:Z.t3}}>%</span>
            </div>
            <div style={{fontSize:11,color:Z.t3,marginTop:1}}>oggi</div>
          </div>
        )}
      </div>

      {/* ── ABITUDINI DA FARE ── */}
      <div className="up d1" style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,fontWeight:700,color:Z.t}}>Abitudini</span>
            {habits.length>0&&(
              <div style={{height:3,width:60,background:Z.s3,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:ac,
                  borderRadius:2,transition:"width 0.6s cubic-bezier(.4,0,.2,1)"}}/>
              </div>
            )}
          </div>
          <button onClick={()=>setScreen("abitudini")}
            style={{fontSize:12,color:ACCENT.abitudini,fontWeight:600}}>
            Gestisci →
          </button>
        </div>

        {habits.length===0?(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14,
            padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:14,color:Z.t2,marginBottom:10}}>Nessuna abitudine ancora</div>
            <button onClick={()=>setScreen("abitudini")}
              style={{padding:"9px 20px",background:ACCENT.abitudini,border:"none",
                borderRadius:10,color:"white",fontSize:13,fontWeight:700}}>
              Aggiungi →
            </button>
          </div>
        ):pct===100?(
          <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",
            borderRadius:14,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#34d399"}}>Tutto completato! 🎉</div>
            {done.length>0&&(
              <div style={{fontSize:12,color:Z.t3,marginTop:4}}>
                {done.length} abitudini completate oggi
              </div>
            )}
          </div>
        ):(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
            borderRadius:14,overflow:"hidden"}}>
            {rem.slice(0,6).map((h,i)=>(
              <div key={h.id}
                style={{borderTop:i>0?`1px solid ${Z.b}`:"none"}}>
                <HRow h={h} tr={tr} logs={logs} onToggle={onToggle}
                  onEdit={onEdit} onLog={onLog} compact/>
              </div>
            ))}
            {rem.length>6&&(
              <button onClick={()=>setScreen("abitudini")}
                style={{width:"100%",padding:"11px",borderTop:`1px solid ${Z.b}`,
                  background:"transparent",color:Z.t3,fontSize:13}}>
                + altre {rem.length-6} →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── TASK ── */}
      <div className="up d2" style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:700,color:Z.t}}>Task</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setAddTask(t=>!t)}
              style={{fontSize:12,color:ACCENT.task,fontWeight:600,
                padding:"4px 10px",background:`${ACCENT.task}15`,
                border:`1px solid ${ACCENT.task}44`,borderRadius:20}}>
              + Aggiungi
            </button>
            {pending.length>0&&(
              <button onClick={()=>setScreen("task")}
                style={{fontSize:12,color:Z.t3,fontWeight:500}}>Tutte →</button>
            )}
          </div>
        </div>

        {addTask&&(
          <div className="in" style={{background:Z.s1,border:`1px solid ${Z.b}`,
            borderRadius:12,padding:"12px",marginBottom:8}}>
            <input value={newTxt} onChange={e=>setNewTxt(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addT()}
              placeholder="Nuova task..."
              style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,
                borderRadius:8,padding:"10px 12px",color:Z.t,fontSize:15,
                boxSizing:"border-box",marginBottom:8}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setAddTask(false);setNewTxt("");}}
                style={{flex:1,padding:"9px",background:Z.s2,borderRadius:8,
                  color:Z.t2,fontSize:13}}>Annulla</button>
              <button onClick={addT}
                style={{flex:2,padding:"9px",background:ACCENT.task,borderRadius:8,
                  color:"white",fontSize:13,fontWeight:600}}>Aggiungi</button>
            </div>
          </div>
        )}

        {pending.length===0&&!addTask?(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14,
            padding:"16px",textAlign:"center",color:Z.t3,fontSize:13}}>
            Nessuna task aperta
          </div>
        ):(
          <div style={{background:Z.s1,border:`1px solid ${Z.b}`,
            borderRadius:14,overflow:"hidden"}}>
            {[...urg,...pending.filter(t=>!urg.includes(t))].slice(0,5).map((t,i)=>{
              const d2=dl(t.deadline);
              const isU=urg.includes(t);
              return(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:11,
                  padding:"11px 14px",
                  borderTop:i>0?`1px solid ${Z.b}`:"none",
                  background:isU?"rgba(248,113,113,0.05)":"transparent"}}>
                  <button onClick={()=>togT(t.id)}
                    style={{width:22,height:22,borderRadius:"50%",flexShrink:0,padding:0,
                      border:`1.5px solid ${isU?"#f87171":Z.b2}`,background:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center"}}/>
                  <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditT(t)}>
                    <div style={{fontSize:14,color:isU?"#fca5a5":Z.t,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      fontWeight:isU?500:400}}>{t.text}</div>
                    {d2&&<span style={{fontSize:11,color:d2.c,
                      fontFamily:"'JetBrains Mono',monospace"}}>{d2.txt}</span>}
                  </div>
                  <button onClick={()=>delT(t.id)}
                    style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.5}}>×</button>
                </div>
              );
            })}
            {pending.length>5&&(
              <button onClick={()=>setScreen("task")}
                style={{width:"100%",padding:"11px",borderTop:`1px solid ${Z.b}`,
                  background:"transparent",color:Z.t3,fontSize:13}}>
                + altre {pending.length-5}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── OBIETTIVI ── */}
      <div className="up d3">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:700,color:Z.t}}>Obiettivi</span>
          <button onClick={()=>setScreen("goals")}
            style={{fontSize:12,color:ACCENT.goals,fontWeight:600}}>Vedi →</button>
        </div>
        {data.goals.map(g=>{
          const st=STATUS[g.s]||STATUS.red;
          const gt=g.tasks||[];
          const dn=gt.filter(t=>t.done).length;
          const tp=gt.length?Math.round(dn/gt.length*100):g.pct||0;
          return(
            <div key={g.id} onClick={()=>setScreen("goals")}
              style={{marginBottom:7,padding:"11px 14px",
                background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:12,
                position:"relative",overflow:"hidden",cursor:"pointer"}}>
              <div style={{position:"absolute",top:0,left:0,height:2,
                width:`${tp}%`,background:st.c,transition:"width 0.5s"}}/>
              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:14,color:Z.t,fontWeight:500,flex:1,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                  marginRight:10}}>{g.text}</span>
                <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                  {gt.length>0&&(
                    <span style={{fontSize:11,color:Z.t3,
                      fontFamily:"'JetBrains Mono',monospace"}}>{dn}/{gt.length}</span>
                  )}
                  <Dot c={st.c} size={7}/>
                </div>
              </div>
              <div style={{height:2,background:Z.s3,borderRadius:1}}>
                <div style={{height:"100%",width:`${tp}%`,background:st.c,
                  borderRadius:1,transition:"width 0.5s"}}/>
              </div>
            </div>
          );
        })}
      </div>

      {done.length>0&&rem.length>0&&(
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:Z.t3,
          fontFamily:"'JetBrains Mono',monospace"}}>
          ✓ {done.length} completate oggi
        </div>
      )}
    </div>
  );
}

// ── ABITUDINI ────────────────────────────────────────────────────
function Abitudini({data,tr,logs,onToggle,onEdit,onLog,onReorder,onAdd}){
  return(
    <div>
      {data.aree.map(area=>(
        <AreaSection key={area.id} area={area} tr={tr} logs={logs}
          onToggle={onToggle} onEdit={onEdit} onLog={onLog}
          onReorder={onReorder} onAdd={onAdd}/>
      ))}
    </div>
  );
}

// ── GOALS ────────────────────────────────────────────────────────
function Goals({data,setData,onEdit}){
  const [open,setOpen]=useState(null);
  const [addTo,setAddTo]=useState(null);
  const [newT,setNewT]=useState("");
  const inputRef=useRef(null);
  const avg=data.goals.length?Math.round(data.goals.reduce((s,g)=>s+(g.pct||0),0)/data.goals.length):0;

  const togT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>{
    if(g.id!==gId)return g;
    const tasks=(g.tasks||[]).map(t=>t.id===tId?{...t,done:!t.done}:t);
    return{...g,tasks,pct:tasks.length?Math.round(tasks.filter(t=>t.done).length/tasks.length*100):g.pct||0};
  })}));
  const delT=(gId,tId)=>setData(d=>({...d,goals:d.goals.map(g=>g.id!==gId?g:{...g,tasks:(g.tasks||[]).filter(t=>t.id!==tId)})}));
  const addT=gId=>{if(!newT.trim())return;setData(d=>({...d,goals:d.goals.map(g=>g.id!==gId?g:{...g,tasks:[...(g.tasks||[]),{id:uid(),text:newT.trim(),done:false}]})}));setNewT("");setAddTo(null);};

  return(
    <div>
      <div className="up" style={{background:Z.s1,border:`1px solid ${ACCENT.goals}33`,borderRadius:18,padding:"18px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:16}}>
        <Ring pct={avg} size={72} sw={5} color={ACCENT.goals}>
          <Num v={`${avg}%`} size={14} color={ACCENT.goals}/>
        </Ring>
        <div>
          <h2 style={{fontSize:16,color:Z.t,fontWeight:700,margin:"0 0 3px"}}>Obiettivi 2026</h2>
          <div style={{fontSize:13,color:Z.t2}}>{data.goals.length} obiettivi · <span style={{color:ACCENT.goals,fontWeight:600}}>{data.goals.reduce((s,g)=>s+(g.tasks||[]).filter(t=>t.done).length,0)}/{data.goals.reduce((s,g)=>s+(g.tasks||[]).length,0)}</span> task</div>
        </div>
      </div>

      {data.goals.map((g,gi)=>{
        const st=STATUS[g.s]||STATUS.red;
        const isOpen=open===g.id;
        const gt=g.tasks||[];
        const dn=gt.filter(t=>t.done).length;
        const tp=gt.length?Math.round(dn/gt.length*100):g.pct||0;
        return(
          <div key={g.id} style={{marginBottom:8}}>
            <div onClick={()=>setOpen(isOpen?null:g.id)}
              className={`up${gi>0?" d"+Math.min(gi,4):""}`}
              style={{padding:"14px 16px",borderRadius:isOpen?"14px 14px 0 0":14,
                background:Z.s1,border:`1px solid ${isOpen?st.c+"55":Z.b}`,
                cursor:"pointer",position:"relative",overflow:"hidden",transition:"border-radius 0.2s,border-color 0.2s"}}>
              <div style={{position:"absolute",top:0,left:0,height:2,background:st.c,width:`${tp}%`,transition:"width 0.5s"}}/>
              <div style={{display:"flex",alignItems:"flex-start",gap:11,marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,color:Z.t,fontWeight:600,lineHeight:1.3,marginBottom:isOpen?0:4}}>{g.text}</div>
                  {g.note&&<div style={{fontSize:12,color:Z.t2,marginTop:3}}>{g.note}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                  <Num v={`${tp}%`} size={17} color={st.c}/>
                  <button onClick={e=>{e.stopPropagation();onEdit(g);}}
                    style={{fontSize:11,color:Z.t3,padding:"2px 8px",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:20,fontWeight:500}}>
                    Modifica
                  </button>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,height:3,background:Z.s3,borderRadius:2}}>
                  <div style={{height:"100%",width:`${tp}%`,background:st.c,borderRadius:2,transition:"width 0.5s"}}/>
                </div>
                <span style={{fontSize:11,color:Z.t3,fontFamily:"'JetBrains Mono',monospace"}}>{dn}/{gt.length}</span>
              </div>
            </div>

            {isOpen&&(
              <div style={{background:Z.s1,border:`1px solid ${st.c}55`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
                {gt.map((t,ti)=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
                    borderBottom:ti<gt.length-1?`1px solid ${Z.b}`:"none",opacity:t.done?0.5:1}}>
                    <button onClick={()=>togT(g.id,t.id)}
                      style={{width:22,height:22,borderRadius:"50%",flexShrink:0,padding:0,
                        background:t.done?"#34d399":"transparent",
                        border:`1.5px solid ${t.done?"#34d399":Z.b2}`,
                        display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>
                      {t.done&&"✓"}
                    </button>
                    <span style={{flex:1,fontSize:14,color:t.done?Z.t3:Z.t,textDecoration:t.done?"line-through":"none",fontWeight:t.done?400:500}}>{t.text}</span>
                    <button onClick={()=>delT(g.id,t.id)} style={{color:Z.t3,fontSize:18,opacity:0.4,lineHeight:1}}>×</button>
                  </div>
                ))}
                {addTo===g.id?(
                  <div style={{padding:"10px 16px",background:Z.s2,borderTop:`1px solid ${Z.b}`}}>
                    <input ref={inputRef} value={newT} onChange={e=>setNewT(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")addT(g.id);if(e.key==="Escape"){setAddTo(null);setNewT("");}}}
                      autoFocus placeholder="Nuova task..."
                      style={{width:"100%",background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:8,
                        padding:"9px 12px",color:Z.t,fontSize:14,boxSizing:"border-box",marginBottom:8}}/>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setAddTo(null);setNewT("");}} style={{flex:1,padding:"8px",background:Z.b,borderRadius:8,color:Z.t2,fontSize:13}}>Annulla</button>
                      <button onClick={()=>addT(g.id)} style={{flex:2,padding:"8px",background:st.c,borderRadius:8,color:"white",fontSize:13,fontWeight:600}}>Aggiungi</button>
                    </div>
                  </div>
                ):(
                  <button onClick={e=>{e.stopPropagation();setAddTo(g.id);setNewT(""); setTimeout(()=>inputRef.current?.focus(),50);}}
                    style={{width:"100%",padding:"11px 16px",borderTop:`1px solid ${Z.b}`,background:"transparent",color:Z.t3,fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{color:st.c,fontSize:15,lineHeight:1}}>+</span> Aggiungi task
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

// ── TASK ─────────────────────────────────────────────────────────
function TaskScreen({data,setData}){
  const [adding,setAdding]=useState(false),[txt,setTxt]=useState(""),[ddl,setDdl]=useState("");
  const [editT,setEditT]=useState(null);
  const tog=id=>setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const del=id=>{setData(d=>({...d,tasks:(d.tasks||[]).filter(t=>t.id!==id)}));setEditT(null);};
  const add=()=>{if(!txt.trim())return;setData(d=>({...d,tasks:[...(d.tasks||[]),{id:uid(),text:txt.trim(),done:false,deadline:ddl}]}));setTxt("");setDdl("");setAdding(false);};
  const upd=ch=>{setData(d=>({...d,tasks:(d.tasks||[]).map(t=>t.id===editT.id?{...t,...ch}:t)}));setEditT(null);};
  const tasks=data.tasks||[];
  const pend=[...tasks.filter(t=>!t.done)].sort((a,b)=>{if(!a.deadline&&!b.deadline)return 0;if(!a.deadline)return 1;if(!b.deadline)return -1;return a.deadline.localeCompare(b.deadline);});
  const dn=tasks.filter(t=>t.done);
  const urg=pend.filter(t=>dl(t.deadline)?.u);

  return(
    <div>
      {editT&&(
        <Modal onClose={()=>setEditT(null)} title="Modifica task" accent={ACCENT.task}>
          <input defaultValue={editT.text} id="et-txt"
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"12px 13px",color:Z.t,fontSize:15,fontWeight:500,boxSizing:"border-box",marginBottom:12}}/>
          <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Scadenza</div>
          <input type="date" defaultValue={editT.deadline||""} id="et-dl"
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"12px 13px",color:Z.t,fontSize:14,boxSizing:"border-box",marginBottom:16}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>del(editT.id)} style={{padding:"11px 14px",background:Z.s2,borderRadius:10,color:Z.t2,fontSize:17,lineHeight:1}}>🗑</button>
            <button onClick={()=>setEditT(null)} style={{flex:1,padding:11,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>upd({text:document.getElementById("et-txt")?.value.trim()||editT.text,deadline:document.getElementById("et-dl")?.value||editT.deadline})}
              style={{flex:2,padding:11,background:ACCENT.task,borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>Salva</button>
          </div>
        </Modal>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:0,letterSpacing:"-0.4px"}}>Task</h1>
        <button onClick={()=>setAdding(!adding)} style={{padding:"9px 18px",background:ACCENT.task,border:"none",borderRadius:20,color:"white",fontSize:13,fontWeight:600}}>+ Aggiungi</button>
      </div>

      {adding&&(
        <div className="in" style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14,padding:14,marginBottom:14}}>
          <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Descrivi la task..."
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"11px 13px",color:Z.t,fontSize:15,boxSizing:"border-box",marginBottom:10}}/>
          <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:7,fontFamily:"'JetBrains Mono',monospace"}}>Scadenza (opzionale)</div>
          <input type="date" value={ddl} onChange={e=>setDdl(e.target.value)}
            style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"10px 13px",color:Z.t,fontSize:14,boxSizing:"border-box",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setAdding(false)} style={{flex:1,padding:"10px",background:Z.s2,borderRadius:9,color:Z.t2,fontSize:13}}>Annulla</button>
            <button onClick={add} style={{flex:2,padding:"10px",background:ACCENT.task,borderRadius:9,color:"white",fontSize:13,fontWeight:600}}>Aggiungi</button>
          </div>
        </div>
      )}

      {tasks.length===0&&!adding&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:Z.s1,borderRadius:16,border:`1px solid ${Z.b}`}}>
          <div style={{fontSize:18,fontWeight:700,color:Z.t,marginBottom:8}}>Nessuna task</div>
          <div style={{fontSize:14,color:Z.t2}}>Tocca + per aggiungerne una</div>
        </div>
      )}

      {urg.length>0&&(
        <div style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:14,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"10px 14px 4px",fontSize:11,color:"#f87171",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>Scadute · {urg.length}</div>
          {urg.map((t,i)=>{const d2=dl(t.deadline);return(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:`1px solid rgba(248,113,113,0.12)`}}>
              <button onClick={()=>tog(t.id)} style={{width:22,height:22,borderRadius:"50%",border:"1.5px solid rgba(248,113,113,0.5)",background:"transparent",flexShrink:0,padding:0}}/>
              <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditT(t)}>
                <div style={{fontSize:14,color:"#fca5a5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{t.text}</div>
              </div>
              <button onClick={()=>del(t.id)} style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.5}}>×</button>
            </div>
          );})}
        </div>
      )}

      {pend.filter(t=>!urg.includes(t)).length>0&&(
        <div style={{marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:600,color:Z.t2,marginBottom:8}}>Da fare · {pend.filter(t=>!urg.includes(t)).length}</div>
          {pend.filter(t=>!urg.includes(t)).map(t=>{const d2=dl(t.deadline);return(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,marginBottom:5,background:Z.s1,border:`1px solid ${Z.b}`}}>
              <button onClick={()=>tog(t.id)} style={{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${Z.b2}`,background:"transparent",flexShrink:0,padding:0}}/>
              <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setEditT(t)}>
                <div style={{fontSize:14,color:Z.t,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{t.text}</div>
                {d2&&<span style={{fontSize:11,color:d2.c,fontFamily:"'JetBrains Mono',monospace"}}>{d2.txt}</span>}
              </div>
              <button onClick={()=>del(t.id)} style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.5}}>×</button>
            </div>
          );})}
        </div>
      )}

      {dn.length>0&&(
        <div>
          <div style={{fontSize:13,fontWeight:600,color:Z.t3,marginBottom:8}}>Completate · {dn.length}</div>
          {dn.map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:4,background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.15)",opacity:0.65}}>
              <button onClick={()=>tog(t.id)} style={{width:22,height:22,borderRadius:"50%",background:"#34d399",border:"none",flexShrink:0,padding:0,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>✓</button>
              <span style={{flex:1,fontSize:14,color:Z.t3,textDecoration:"line-through",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
              <button onClick={()=>del(t.id)} style={{color:Z.t3,fontSize:18,lineHeight:1,opacity:0.4}}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VITA ─────────────────────────────────────────────────────────

// ── VITA — stessa logica di Abitudini: 5 aree con categorie ──────
// I punteggi sono per categoria (vita.scores[catId] = 0-10)
// Il radar mostra le 5 aree (media delle loro categorie)
const VITA_AREE = [
  { id:"salute", nome:"Salute", color:"#34d399", cat:[
    {id:"v-mente", nome:"Mente", desc:"Chiarezza mentale, concentrazione, gestione dello stress"},
    {id:"v-fisico", nome:"Fisico", desc:"Energia, forma fisica, allenamento, sonno"},
    {id:"v-vita", nome:"Benessere",desc:"Alimentazione, prevenzione, benessere generale"},
  ]},
  { id:"lavoro", nome:"Ingegno", color:"#fb923c", cat:[
    {id:"v-ricch", nome:"Ricchezza",desc:"Reddito, risparmi, sicurezza economica"},
    {id:"v-carr", nome:"Carriera", desc:"Crescita professionale, ruolo, riconoscimento"},
    {id:"v-proj", nome:"Progetti", desc:"Realizzazioni personali, impatto, soddisfazione"},
  ]},
  { id:"relazioni", nome:"Legami", color:"#f472b6", cat:[
    {id:"v-amore", nome:"Amore", desc:"Relazione di coppia, intimità, connessione"},
    {id:"v-fam", nome:"Famiglia", desc:"Rapporti familiari, presenza, qualità del tempo"},
    {id:"v-amici", nome:"Amici", desc:"Vita sociale, amicizie, comunità"},
  ]},
  { id:"gioia", nome:"Armonia", color:"#fbbf24", cat:[
    {id:"v-amb", nome:"Ambiente", desc:"Casa, spazio vissuto, ordine, comfort"},
    {id:"v-pass", nome:"Passioni", desc:"Hobby, creatività, tempo per sé"},
    {id:"v-svil", nome:"Crescita", desc:"Apprendimento, curiosità, crescita personale"},
  ]}
];

// Punteggio area = media delle sue categorie
function vitaAreaScore(areaId, scores) {
  const area = VITA_AREE.find(a=>a.id===areaId);
  if(!area) return 0;
  const vals = area.cat.map(c=>scores[c.id]||0);
  return Math.round(vals.reduce((s,v)=>s+v,0)/vals.length*10)/10;
}

function Vita({data,setData}){
  const scores = data.vita||{};
  const setScore = (id,v)=>setData(d=>({...d,vita:{...d.vita,[id]:v}}));
  const [openArea,setOpenArea]=useState(null);

  const areaScore=a=>{
    const vals=a.cat.map(c=>scores[c.id]||0);
    return Math.round(vals.reduce((s,v)=>s+v,0)/vals.length*10)/10;
  };

  const areaPcts = VITA_AREE.map(a=>areaScore(a));
  const globalAvg = Math.round(areaPcts.reduce((s,v)=>s+v,0)/VITA_AREE.length*10)/10;

  // ── Geometria — 12 assi (3 cat × 4 aree) con gap tra aree ───
  const SIZE=290, CX=145, CY=145, R=98, GAP=0.18;
  const TOTAL=VITA_AREE.reduce((s,a)=>s+a.cat.length,0); // 12

  const areaA=(()=>{
    let cur=-Math.PI/2;
    return VITA_AREE.map(area=>{
      const span=(2*Math.PI/TOTAL)*area.cat.length;
      const s=cur+GAP/2, e=cur+span-GAP/2, mid=cur+span/2;
      const catA=area.cat.map((_,ci)=>s+((span-GAP)/area.cat.length)*(ci+0.5));
      cur+=span;
      return{s,e,mid,catA};
    });
  })();

  // Lista piatta categoria+angolo
  const ALL=VITA_AREE.flatMap((area,ai)=>
    area.cat.map((cat,ci)=>({...cat,aColor:area.color,aId:area.id,ang:areaA[ai].catA[ci]}))
  );
  const vals=ALL.map(x=>scores[x.id]||0);

  const px=(a,v)=>CX+(v/10)*R*Math.cos(a);
  const py=(a,v)=>CY+(v/10)*R*Math.sin(a);
  const f2=n=>n.toFixed(2);

  const poly=ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,vals[i]))},${f2(py(x.ang,vals[i]))}`).join(" ")+"Z";
  const ring=v=>ALL.map((x,i)=>`${i===0?"M":"L"}${f2(px(x.ang,v))},${f2(py(x.ang,v))}`).join(" ")+"Z";

  return(
    <div>
      <div style={{display:"flex",alignItems:"baseline",
        justifyContent:"space-between",marginBottom:16}}>
        <h1 style={{fontSize:24,fontWeight:800,color:Z.t,
          margin:0,letterSpacing:"-0.4px"}}>La tua Vita</h1>
        <span style={{fontSize:13,color:Z.t2}}>Tocca un'area</span>
      </div>

      {/* ── RADAR CARD ── */}
      <div className="up" style={{
        background:"#0c0c0c",border:"1px solid #1c1c1c",
        borderRadius:22,padding:"24px 8px 20px",
        marginBottom:14}}>

        {/* SVG radar — labels in HTML wrapper */}
        <div style={{position:"relative",
          width:SIZE+90,maxWidth:"100%",
          margin:"0 auto",height:SIZE+90}}>

          {/* SVG centrato nel wrapper */}
          <svg
            width={SIZE} height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{position:"absolute",
              top:45,left:45,
              overflow:"visible",display:"block"}}>
            <defs>
              <filter id="gdot">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feComposite in="SourceGraphic" in2="b" operator="over"/>
              </filter>
              <radialGradient id="polyfill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="white" stopOpacity="0.03"/>
              </radialGradient>
            </defs>

            {/* Spicchi area — sfondo colorato */}
            {VITA_AREE.map((area,ai)=>{
              const{s,e}=areaA[ai];
              const large=(e-s)>Math.PI?1:0;
              const x1=f2(CX+R*Math.cos(s)),y1=f2(CY+R*Math.sin(s));
              const x2=f2(CX+R*Math.cos(e)),y2=f2(CY+R*Math.sin(e));
              const sel=openArea===area.id;
              return(
                <path key={ai}
                  d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`}
                  fill={area.color}
                  opacity={sel?0.14:0.06}
                  style={{transition:"opacity 0.22s",cursor:"pointer"}}
                  onClick={()=>setOpenArea(sel?null:area.id)}/>
              );
            })}

            {/* Separatori tra aree — netti */}
            {VITA_AREE.map((_,ai)=>(
              <line key={`sep${ai}`}
                x1={f2(CX+5*Math.cos(areaA[ai].s))}
                y1={f2(CY+5*Math.sin(areaA[ai].s))}
                x2={f2(CX+R*Math.cos(areaA[ai].s))}
                y2={f2(CY+R*Math.sin(areaA[ai].s))}
                stroke="#222" strokeWidth={2}/>
            ))}

            {/* Anelli griglia — 2 livelli */}
            {[5,10].map(v=>(
              <path key={v} d={ring(v)} fill="none"
                stroke={v===10?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)"}
                strokeWidth={v===10?1:0.6}/>
            ))}

            {/* Assi categoria — colorati per area */}
            {ALL.map((x,i)=>(
              <line key={`ax${i}`}
                x1={f2(CX)} y1={f2(CY)}
                x2={f2(CX+(R+2)*Math.cos(x.ang))}
                y2={f2(CY+(R+2)*Math.sin(x.ang))}
                stroke={x.aColor+"40"} strokeWidth={0.8}/>
            ))}

            {/* Poligono score */}
            <path d={poly}
              fill="url(#polyfill)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={1.8}
              strokeLinejoin="round"/>

            {/* Dot con glow per ogni categoria */}
            {ALL.map((x,i)=>(
              <g key={`d${i}`}>
                <circle
                  cx={f2(px(x.ang,vals[i]))} cy={f2(py(x.ang,vals[i]))}
                  r={8} fill={x.aColor} opacity={0.2} filter="url(#gdot)"/>
                <circle
                  cx={f2(px(x.ang,vals[i]))} cy={f2(py(x.ang,vals[i]))}
                  r={3.5} fill={x.aColor} stroke="#0c0c0c" strokeWidth={1.5}/>
              </g>
            ))}

            {/* Centro — score globale */}
            <circle cx={CX} cy={CY} r={26}
              fill="#0c0c0c" stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>
            <text x={CX} y={CY+1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={17} fontWeight={800} fill="white"
              fontFamily="'JetBrains Mono',monospace">
              {globalAvg}
            </text>
            <text x={CX} y={CY+16}
              textAnchor="middle" fontSize={8}
              fill="rgba(255,255,255,0.35)" fontFamily="Inter,sans-serif">
              / 10
            </text>
          </svg>

          {/* Label HTML per ogni categoria — fuori dal SVG */}
          {ALL.map((x,i)=>{
            const lr=R+22;
            // Posizione nel wrapper (SVG è offset di 45px)
            const lx=45+CX+lr*Math.cos(x.ang);
            const ly=45+CY+lr*Math.sin(x.ang);
            const cosA=Math.cos(x.ang), sinA=Math.sin(x.ang);
            const anchor=cosA<-0.2?"right":cosA>0.2?"left":"center";
            const tx=anchor==="right"?"-100%":anchor==="center"?"-50%":"0%";
            const ty=sinA>0.2?"0%":sinA<-0.2?"-100%":"-50%";
            return(
              <div key={`lc${i}`}
                style={{
                  position:"absolute",
                  left:lx, top:ly,
                  transform:`translate(${tx},${ty})`,
                  pointerEvents:"none",
                  textAlign:anchor==="right"?"right":anchor==="center"?"center":"left",
                  lineHeight:1.2}}>
                <div style={{
                  fontSize:9,fontWeight:600,
                  color:x.aColor+"cc",
                  letterSpacing:"0.02em",
                  whiteSpace:"nowrap"}}>
                  {x.nome}
                </div>
                <div style={{
                  fontSize:10,fontWeight:700,
                  color:x.aColor,
                  fontFamily:"'JetBrains Mono',monospace"}}>
                  {vals[i]}
                </div>
              </div>
            );
          })}

          {/* Label HTML per area — più esterne */}
          {VITA_AREE.map((area,ai)=>{
            const lr=R+50;
            const lx=45+CX+lr*Math.cos(areaA[ai].mid);
            const ly=45+CY+lr*Math.sin(areaA[ai].mid);
            const cosA=Math.cos(areaA[ai].mid);
            const sinA=Math.sin(areaA[ai].mid);
            const anchor=cosA<-0.2?"right":cosA>0.2?"left":"center";
            const tx=anchor==="right"?"-100%":anchor==="center"?"-50%":"0%";
            const ty=sinA>0.2?"0%":sinA<-0.2?"-100%":"-50%";
            const sel=openArea===area.id;
            return(
              <div key={`la${ai}`}
                onClick={()=>setOpenArea(sel?null:area.id)}
                style={{
                  position:"absolute",
                  left:lx,top:ly,
                  transform:`translate(${tx},${ty})`,
                  cursor:"pointer",
                  textAlign:anchor==="right"?"right":anchor==="center"?"center":"left",
                  lineHeight:1.1}}>
                <div style={{
                  fontSize:11,fontWeight:800,
                  color:sel?area.color:area.color+"99",
                  letterSpacing:"0.02em",whiteSpace:"nowrap",
                  transition:"color 0.2s"}}>
                  {area.nome}
                </div>
                <div style={{
                  fontSize:12,fontWeight:700,
                  color:sel?area.color:area.color+"77",
                  fontFamily:"'JetBrains Mono',monospace",
                  transition:"color 0.2s"}}>
                  {areaPcts[ai]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pills area */}
        <div style={{display:"flex",gap:6,justifyContent:"center",
          flexWrap:"wrap",marginTop:8,paddingTop:8,
          borderTop:"1px solid #1a1a1a"}}>
          {VITA_AREE.map((area,i)=>{
            const sel=openArea===area.id;
            return(
              <button key={area.id}
                onClick={()=>setOpenArea(sel?null:area.id)}
                style={{display:"flex",alignItems:"center",gap:5,
                  padding:"5px 11px",borderRadius:20,
                  background:sel?`${area.color}18`:"rgba(255,255,255,0.04)",
                  border:`1px solid ${sel?area.color+"66":"rgba(255,255,255,0.07)"}`,
                  transition:"all 0.18s"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:area.color}}/>
                <span style={{fontSize:11,fontWeight:600,
                  color:sel?area.color:"rgba(255,255,255,0.5)"}}>
                  {area.nome}
                </span>
                <span style={{fontSize:10,fontWeight:700,
                  fontFamily:"'JetBrains Mono',monospace",marginLeft:1,
                  color:sel?area.color:"rgba(255,255,255,0.3)"}}>
                  {areaPcts[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* AREE ACCORDION */}
      {VITA_AREE.map(area=>{
        const isOpen = openArea===area.id;
        const as = areaScore(area);
        const pct = Math.round(as*10);
        return(
          <div key={area.id} style={{marginBottom:8}}>
            <button onClick={()=>setOpenArea(isOpen?null:area.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:12,
                padding:"14px 16px",background:Z.s1,
                border:`1px solid ${isOpen?area.color+"66":Z.b}`,
                borderRadius:isOpen?"14px 14px 0 0":14,
                textAlign:"left",transition:"border-color 0.2s,border-radius 0.2s",
                boxShadow:isOpen?`inset 3px 0 0 ${area.color}`:"none"}}>
              <Ring pct={pct} size={38} sw={3.5} color={area.color}>
                <span style={{fontSize:9,fontWeight:700,color:area.color,
                  fontFamily:"'JetBrains Mono',monospace"}}>{as}</span>
              </Ring>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:Z.t}}>{area.nome}</div>
                <div style={{fontSize:12,color:Z.t2,marginTop:1}}>
                  {area.cat.length} categorie · media {as}/10
                </div>
              </div>
              <span style={{color:Z.t3,fontSize:16,lineHeight:1,
                transform:isOpen?"rotate(180deg)":"none",
                transition:"transform 0.2s"}}>⌄</span>
            </button>

            {isOpen&&(
              <div style={{background:Z.s1,
                border:`1px solid ${area.color}55`,borderTop:"none",
                borderRadius:"0 0 14px 14px",padding:"8px 14px 16px"}}>
                {area.cat.map((cat,ci)=>{
                  const val = scores[cat.id]||0;
                  const barCol = val>=7?area.color:val>=4?"#fbbf24":"#f87171";
                  return(
                    <div key={cat.id} style={{marginTop:ci===0?8:10,
                      background:Z.s2,borderRadius:12,padding:"12px 14px",
                      border:`1px solid ${Z.b}`}}>
                      <div style={{display:"flex",alignItems:"flex-start",
                        justifyContent:"space-between",marginBottom:6}}>
                        <div style={{flex:1,marginRight:12}}>
                          <div style={{fontSize:14,fontWeight:600,color:Z.t}}>{cat.nome}</div>
                          <div style={{fontSize:11,color:Z.t2,marginTop:2,lineHeight:1.4}}>{cat.desc}</div>
                        </div>
                        <Num v={val} size={22} color={barCol}/>
                      </div>
                      <div style={{height:3,background:Z.s3,borderRadius:2,overflow:"hidden",marginBottom:10}}>
                        <div style={{height:"100%",width:`${val*10}%`,
                          background:barCol,borderRadius:2,transition:"width 0.2s"}}/>
                      </div>
                      <input type="range" min={0} max={10} step={1} value={val}
                        onChange={e=>setScore(cat.id,+e.target.value)}
                        style={{"--c":area.color,"--t":Z.s3,width:"100%"}}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* RIEPILOGO */}
      <div style={{marginTop:12,background:Z.s1,border:`1px solid ${Z.b}`,
        borderRadius:14,padding:"13px 15px"}}>
        <div style={{fontSize:11,fontWeight:600,color:Z.t2,letterSpacing:"0.08em",
          textTransform:"uppercase",marginBottom:11,fontFamily:"'JetBrains Mono',monospace"}}>
          Da migliorare
        </div>
        {[...VITA_AREE].sort((a,b)=>areaScore(a)-areaScore(b)).slice(0,3).map(area=>{
          const s=areaScore(area);
          return(
            <div key={area.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:area.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:13,color:Z.t2,fontWeight:500}}>{area.nome}</span>
              <div style={{width:80,height:3,background:Z.s3,borderRadius:2,overflow:"hidden",flexShrink:0}}>
                <div style={{height:"100%",width:`${s*10}%`,background:area.color,borderRadius:2}}/>
              </div>
              <Num v={`${s}/10`} size={12} color={area.color}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────
function Stats({data,tr}){
  const [period,setPeriod]=useState(7);
  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const days=useMemo(()=>period===7?d7():d30(),[period]);
  const cnt=id=>days.filter(d=>tr[id]?.[d]).length;
  const pct=id=>Math.round(cnt(id)/days.length*100);
  const sorted=useMemo(()=>[...habits].sort((a,b)=>pct(b.id)-pct(a.id)),[habits,period,tr]);
  const global=sorted.length?Math.round(sorted.reduce((s,h)=>s+pct(h.id),0)/sorted.length):0;
  const ws=wscr(habits,tr,0),ps=wscr(habits,tr,1),trend=ws-ps;
  const calDays=useMemo(()=>d84(),[]),calW=useMemo(()=>{const w=[];for(let i=0;i<calDays.length;i+=7)w.push(calDays.slice(i,i+7));return w;},[calDays]);
  const ts=tod();
  const calV=d=>habits.length?habits.filter(h=>tr[h.id]?.[d]).length/habits.length:0;
  const calC=v=>v===0?Z.b:v<.25?"rgba(52,211,153,0.22)":v<.5?"rgba(52,211,153,0.5)":v<.75?"rgba(52,211,153,0.75)":"#34d399";

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:Z.t,margin:"0 0 18px",letterSpacing:"-0.4px"}}>Statistiche</h1>

      {/* Period toggle */}
      <div style={{display:"flex",gap:5,marginBottom:14,background:Z.s1,padding:4,borderRadius:12,border:`1px solid ${Z.b}`}}>
        {[{v:7,l:"7 giorni"},{v:30,l:"30 giorni"}].map(p=>(
          <button key={p.v} onClick={()=>setPeriod(p.v)}
            style={{flex:1,padding:"9px",borderRadius:9,
              background:period===p.v?Z.s3:"transparent",
              color:period===p.v?Z.t:Z.t2,fontSize:13,fontWeight:period===p.v?600:400,transition:"all 0.15s"}}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Global */}
      <div className="up" style={{background:Z.s1,border:`1px solid ${ACCENT.stats}33`,borderRadius:18,padding:"18px 20px",marginBottom:12,display:"flex",alignItems:"center",gap:16}}>
        <Ring pct={global} size={72} sw={5} color={ACCENT.stats}>
          <Num v={`${global}%`} size={14} color={ACCENT.stats}/>
        </Ring>
        <div>
          <div style={{fontSize:15,color:Z.t,fontWeight:700,marginBottom:3}}>Score globale</div>
          <div style={{fontSize:12,color:Z.t2,marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>{habits.length} abitudini · {period}g</div>
          <div style={{fontSize:13,color:trend>=0?"#34d399":"#f87171",fontWeight:600}}>{trend>0?`↑ +${trend}%`:trend<0?`↓ ${trend}%`:"Stabile"} vs sett. prec.</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{background:Z.s1,border:`1px solid ${Z.b}`,borderRadius:14,padding:"13px 14px",marginBottom:12}}>
        <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:11,fontFamily:"'JetBrains Mono',monospace"}}>Ultimi 84 giorni</div>
        <div style={{overflowX:"auto"}}>
          <div style={{display:"flex",gap:3,minWidth:"fit-content"}}>
            {calW.map((wk,wi)=>(
              <div key={wi} style={{display:"flex",flexDirection:"column",gap:3}}>
                {wk.map(d=><div key={d} style={{width:10,height:10,borderRadius:2,background:calC(calV(d)),border:d===ts?`1.5px solid #34d399`:"none"}}/>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:9,justifyContent:"flex-end"}}>
          <span style={{fontSize:10,color:Z.t3}}>Meno</span>
          {["rgba(52,211,153,0.2)","rgba(52,211,153,0.45)","rgba(52,211,153,0.7)","#34d399"].map(c=><div key={c} style={{width:9,height:9,borderRadius:2,background:c}}/>)}
          <span style={{fontSize:10,color:Z.t3}}>Più</span>
        </div>
      </div>

      {sorted.length===0?(
        <div style={{textAlign:"center",padding:"32px",background:Z.s1,borderRadius:14,border:`1px solid ${Z.b}`}}>
          <div style={{fontSize:15,color:Z.t2}}>Aggiungi abitudini per vedere le statistiche</div>
        </div>
      ):(
        <>
          <div style={{fontSize:13,fontWeight:600,color:Z.t2,marginBottom:8}}>Dettaglio · {sorted.length}</div>
          {sorted.map(h=>{
            const c=cnt(h.id),p=pct(h.id),sk=strk(h.id,tr);
            const bc=p>=80?"#34d399":p>=50?"#fbbf24":p>=25?"#fb923c":"#f87171";
            const ac=AREA_COL[h.aId]||ACCENT.home;
            return(
              <div key={h.id} style={{marginBottom:5,padding:"11px 13px",background:Z.s1,borderRadius:12,border:`1px solid ${Z.b}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:2.5,background:bc}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7,paddingLeft:8}}>
                  <span style={{fontSize:14,color:Z.t,fontWeight:500,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.nome}</span>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0,marginLeft:10}}>
                    {sk>1&&<span style={{fontSize:11,color:"#fb923c",fontWeight:600}}>🔥{sk}</span>}
                    <Num v={`${c}/${days.length}`} size={11} color={bc}/>
                    <span style={{fontSize:10,fontWeight:700,color:bc,background:`${bc}18`,border:`1px solid ${bc}30`,padding:"1px 7px",borderRadius:20,fontFamily:"'JetBrains Mono',monospace"}}>{p}%</span>
                  </div>
                </div>
                <div style={{height:2.5,background:Z.s3,borderRadius:2,marginLeft:8}}>
                  <div style={{height:"100%",width:`${p}%`,background:bc,borderRadius:2,transition:"width 0.5s"}}/>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── EDIT HABIT / GOAL ────────────────────────────────────────────
function EditSheet({item,isGoal,onSave,onDel,onClose}){
  const [st,setSt]=useState(item.s||"red");
  const [note,setNote]=useState(item.note||"");
  const [pct,setPct]=useState(item.pct||0);
  const [logType,setLogType]=useState(item.logType||"nessuno");
  const [freq,setFreq]=useState(item.freq||{type:"daily"});
  const [conf,setConf]=useState(false);
  const nameRef=useRef(null);
  const col=AREA_COL[item.aId]||ACCENT.home;

  const LOG_P={"nessuno":{l:"Solo spunta",icon:"✓"},"vasche":{l:"Vasche",icon:"🏊"},"km":{l:"Km",icon:"🏃"},"minuti":{l:"Minuti",icon:"⏱"},"kg":{l:"Peso (kg)",icon:"⚖️"},"pagine":{l:"Pagine",icon:"📖"},"calorie":{l:"Calorie",icon:"🍎"},"bicchieri":{l:"Acqua",icon:"💧"},"ore":{l:"Ore",icon:"🕐"},"passi":{l:"Passi",icon:"👟"}};

  return(
    <Modal onClose={onClose} title={isGoal?"Obiettivo":"Abitudine"} accent={col}>
      {!isGoal&&<input ref={nameRef} defaultValue={item.nome||""} placeholder="Nome..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"11px 13px",color:Z.t,fontSize:16,fontWeight:600,boxSizing:"border-box",marginBottom:14}}/>}
      {isGoal&&<p style={{fontSize:17,color:Z.t,fontWeight:700,marginBottom:16,lineHeight:1.3}}>{item.text}</p>}

      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:9,fontFamily:"'JetBrains Mono',monospace"}}>Livello</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:16}}>
        {Object.entries(STATUS).map(([k,v])=>{const sel=st===k;return(
          <button key={k} onClick={()=>setSt(k)} style={{padding:"11px 4px",borderRadius:11,background:sel?`${v.c}18`:Z.s2,border:`1.5px solid ${sel?v.c:Z.b}`,display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.15s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:v.c}}/>
            <span style={{fontSize:10,color:sel?v.c:Z.t3,fontWeight:sel?700:400}}>{v.l}</span>
          </button>
        );})}
      </div>

      {isGoal&&<div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>Avanzamento</span>
          <Num v={`${pct}%`} size={22} color={col}/>
        </div>
        <div style={{height:4,background:Z.s3,borderRadius:2,overflow:"hidden",marginBottom:12}}>
          <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:2,transition:"width 0.1s"}}/>
        </div>
        <input type="range" min={0} max={100} value={pct} onChange={e=>setPct(+e.target.value)} style={{"--c":col,"--t":Z.s3}}/>
      </div>}

      <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>Nota</div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Aggiungi nota..."
        style={{width:"100%",background:Z.s2,border:`1px solid ${Z.b}`,borderRadius:9,padding:"11px 13px",color:Z.t,fontSize:14,resize:"none",height:68,boxSizing:"border-box",lineHeight:1.5,marginBottom:14}}/>

      {/* ── FREQUENZA ── */}
      {!isGoal&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:Z.t2,fontWeight:600,letterSpacing:"0.08em",
            textTransform:"uppercase",marginBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>
            Frequenza
          </div>
          {/* Tipo */}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{v:"daily",l:"Ogni giorno"},{v:"weekly",l:"N volte/sett."},{v:"days",l:"Giorni fissi"}].map(({v,l})=>{
              const sel=freq.type===v;
              return(
                <button key={v} onClick={()=>setFreq(v==="daily"?{type:"daily"}:v==="weekly"?{type:"weekly",n:freq.n||3}:{type:"days",d:freq.d||[1,2,3,4,5]})}
                  style={{flex:1,padding:"9px 4px",borderRadius:9,fontSize:12,fontWeight:sel?600:400,
                    background:sel?`${col}20`:Z.s2,border:`1.5px solid ${sel?col:Z.b}`,
                    color:sel?col:Z.t2,transition:"all 0.15s"}}>
                  {l}
                </button>
              );
            })}
          </div>
          {/* N volte */}
          {freq.type==="weekly"&&(
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <span style={{fontSize:13,color:Z.t2,whiteSpace:"nowrap"}}>Volte a settimana:</span>
              <div style={{display:"flex",gap:5,flex:1}}>
                {[1,2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>setFreq({type:"weekly",n})}
                    style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:13,fontWeight:freq.n===n?700:400,
                      background:freq.n===n?col:Z.s2,border:`1px solid ${freq.n===n?col:Z.b}`,
                      color:freq.n===n?"white":Z.t2,transition:"all 0.15s"}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Giorni fissi */}
          {freq.type==="days"&&(
            <div style={{display:"flex",gap:5}}>
              {["D","L","M","M","G","V","S"].map((label,dow)=>{
                const sel=(freq.d||[]).includes(dow);
                const toggleDay=()=>{
                  const cur=freq.d||[];
                  const nd=sel?cur.filter(x=>x!==dow):[...cur,dow].sort();
                  setFreq({type:"days",d:nd});
                };
                return(
                  <button key={dow} onClick={toggleDay}
                    style={{flex:1,padding:"9px 0",borderRadius:9,fontSize:13,fontWeight:sel?700:400,
                      background:sel?col:Z.s2,border:`1px solid ${sel?col:Z.b}`,
                      color:sel?"white":Z.t2,transition:"all 0.15s"}}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        {conf?(
          <>
            <button onClick={()=>setConf(false)} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={onDel} style={{flex:1,padding:12,background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,color:"#f87171",fontSize:14,fontWeight:600}}>Elimina</button>
          </>
        ):(
          <>
            <button onClick={()=>setConf(true)} style={{padding:"12px 14px",background:Z.s2,borderRadius:10,color:Z.t2,fontSize:16,lineHeight:1}}>🗑</button>
            <button onClick={onClose} style={{flex:1,padding:12,background:Z.s2,borderRadius:10,color:Z.t2,fontSize:14}}>Annulla</button>
            <button onClick={()=>{const nome=nameRef.current?.value.trim()||item.nome;onSave({s:st,note,pct,nome,logType,freq});}}
              style={{flex:2,padding:12,background:col,borderRadius:10,color:"white",fontSize:14,fontWeight:700}}>Salva</button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ================================================================
// APP ROOT
// ================================================================
export default function App(){
  const [data,setData]=useState(()=>{
    try{
      let raw=localStorage.getItem("m7");
      if(!raw){
        const old=localStorage.getItem("m6");
        if(old){
          try{
            const o=JSON.parse(old);
            const migrated={
              ...INIT,
              tasks:o.tasks||[],
              vita:{...INIT.vita,...(o.vita||{})},
              goals:(o.goals||INIT.goals).map(g=>({tasks:[],...g,pct:g.pct||0,s:g.s||"red",note:g.note||""})),
              aree:INIT.aree.map(ia=>{
                const oa=(o.aree||[]).find(a=>a.id===ia.id);
                if(!oa)return ia;
                return{...ia,cat:ia.cat.map(ic=>{
                  const oc=(oa.cat||oa.categorie||[]).find(c=>c.id===ic.id);
                  return{...ic,h:oc?.h||oc?.abitudini||[]};
                })};
              }),
            };
            localStorage.setItem("m7",JSON.stringify(migrated));
            return migrated;
          }catch{return INIT;}
        }
        return INIT;
      }
      const p=JSON.parse(raw);
      if(!p.tasks)p.tasks=[];
      if(!p.goals)p.goals=INIT.goals;
      if(!p.vita||Object.keys(p.vita).length<10)p.vita={...INIT.vita,...(p.vita||{})};
      if(!p.aree)p.aree=INIT.aree;
      p.goals=p.goals.map(g=>({tasks:[],...g,pct:g.pct||0,s:g.s||"red",note:g.note||""}));
      p.goals=p.goals.map(g=>{if(g.tasks?.length){const dn=g.tasks.filter(t=>t.done).length;return{...g,pct:Math.round(dn/g.tasks.length*100)};}return g;});
      p.aree=p.aree.map(a=>({...a,color:AREA_COL[a.id]||a.color,cat:(a.cat||a.categorie||[]).map(c=>({...c,h:(c.h||c.abitudini||[]).map(h=>({freq:{type:'daily'},...h}))}))}));
      return p;
    }catch{return INIT;}
  });

  const [tr,setTr]=useState(()=>{try{const s=localStorage.getItem("m-tr");return s?JSON.parse(s):{};}catch{return {};}});
  const [logs,setLogs]=useState(()=>{try{const s=localStorage.getItem("m-lg");return s?JSON.parse(s):{};}catch{return {};}});
  const [screen,setScreen]=useState("home");
  const [editing,setEditing]=useState(null);
  const [wakeHabit,setWakeHabit]=useState(null);
  const [editType,setEditType]=useState(null);

  useEffect(()=>{try{localStorage.setItem("m7",JSON.stringify(data));}catch{}},[data]);
  useEffect(()=>{try{localStorage.setItem("m-tr",JSON.stringify(tr));}catch{}},[tr]);
  useEffect(()=>{try{localStorage.setItem("m-lg",JSON.stringify(logs));}catch{}},[logs]);
  useEffect(()=>{document.body.style.background=Z.bg;},[]);
  useEffect(()=>{if(document.getElementById("mss"))return;const el=document.createElement("style");el.id="mss";el.textContent=CSS;document.head.appendChild(el);},[]);

  const habits=useMemo(()=>flatH(data.aree),[data.aree]);
  const ts=tod();
  const tdone=habits.filter(h=>tr[h.id]?.[ts]).length;
  const texp=habits.filter(h=>isExpected(h,ts));
  const tpct=texp.length?Math.round(texp.filter(h=>tr[h.id]?.[ts]).length/texp.length*100):habits.length?100:0;
  const ac=ACCENT[screen]||ACCENT.home;

  const toggle=useCallback(id=>{const t=tod();setTr(prev=>{const l=prev[id]||{};return{...prev,[id]:{...l,[t]:!l[t]}};});},[]);
  const saveWake=(hId,entry)=>{
    const t=tod();
    setLogs(prev=>({...prev,[hId]:{...(prev[hId]||{}),[t]:{...(prev[hId]?.[t]||{}),...entry}}}));
    setTr(prev=>{const l=prev[hId]||{};return{...prev,[hId]:{...l,[t]:true}};});
    setWakeHabit(null);
  };

  const saveEdit=({s,note,pct,nome,logType,freq})=>{
    if(!editing)return;
    if(editType==="goal")setData(d=>({...d,goals:d.goals.map(g=>g.id===editing.id?{...g,s,note,pct}:g)}));
    else setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>({...c,h:c.h.map(h=>h.id===editing.id?{...h,s,note,nome:nome||h.nome,logType:logType||h.logType,freq:freq||h.freq||{type:'daily'}}:h)}))}))}));
    setEditing(null);
  };
  const delEdit=()=>{
    if(!editing)return;
    if(editType==="goal")setData(d=>({...d,goals:d.goals.filter(g=>g.id!==editing.id)}));
    else setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>({...c,h:c.h.filter(h=>h.id!==editing.id)}))}))}));
    setEditing(null);
  };
  const reorder=(catId,from,to)=>setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>{if(c.id!==catId)return c;const arr=[...c.h],[m]=arr.splice(from,1);arr.splice(to,0,m);return{...c,h:arr};})}))}));
  const addHabit=(catId,nome)=>setData(d=>({...d,aree:d.aree.map(a=>({...a,cat:a.cat.map(c=>c.id!==catId?c:{...c,h:[...c.h,{id:uid(),nome,s:"red",note:"",logType:"nessuno",freq:{type:"daily"}}]})}))}));

  const NAV=[
    {id:"home",l:"Home"},
    {id:"abitudini",l:"Abitudini"},
    {id:"goals",l:"Obiettivi"},
    {id:"task",l:"Task"},
    {id:"vita",l:"Mappa"},
    {id:"stats",l:"Statistiche"},
  ];

  const ICO={
    home: a=><svg width="21" height="21" viewBox="0 0 24 24" fill={a?"currentColor":"none"} stroke="currentColor" strokeWidth={a?0:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 10L12 3l9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/><polyline points="9 21 9 12 15 12 15 21" stroke="currentColor" strokeWidth={1.8} fill="none"/></svg>,
    abitudini:a=><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9"/></svg>,
    goals: a=><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    task: a=><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-5"/></svg>,
    vita: a=><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    stats: a=><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="14" width="3" height="7" rx="1"/><rect x="10.5" y="9" width="3" height="12" rx="1"/><rect x="17" y="3" width="3" height="18" rx="1"/></svg>,
  };

  return(
    <div style={{height:"100dvh",maxWidth:480,margin:"0 auto",
      background:Z.bg,color:Z.t,
      fontFamily:"Inter,-apple-system,BlinkMacSystemFont,sans-serif",
      display:"flex",flexDirection:"column",overflow:"hidden",
      WebkitFontSmoothing:"antialiased"}}>

      {/* Ambient */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
        background:`radial-gradient(ellipse 80% 28% at 50% -5%,${ac}12,transparent)`,
        transition:"background 0.45s"}}/>

      {/* HEADER */}
      <div style={{flexShrink:0,zIndex:20,
        background:"rgba(10,10,10,0.9)",backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${Z.b}`}}>
        <div style={{display:"flex",alignItems:"center",padding:"13px 18px 11px"}}>
          <span style={{fontSize:20,fontWeight:800,letterSpacing:"-0.5px",color:Z.t,flex:1}}>
            <span style={{color:ac,transition:"color 0.3s"}}>M</span>eridian
          </span>
          {habits.length>0&&(
            <div style={{textAlign:"right"}}>
              <span style={{fontSize:18,fontWeight:700,color:tpct===100?"#34d399":ac,fontFamily:"'JetBrains Mono',monospace",transition:"color 0.3s"}}>
                {tdone}<span style={{fontSize:11,color:Z.t3,fontWeight:400}}>/{habits.length}</span>
              </span>
              <div style={{fontSize:9,color:Z.t3,marginTop:1,letterSpacing:"0.06em",fontFamily:"'JetBrains Mono',monospace"}}>OGGI</div>
            </div>
          )}
        </div>
        {habits.length>0&&(
          <div style={{height:2,background:Z.s2}}>
            <div style={{height:"100%",width:`${tpct}%`,background:ac,transition:"width 0.7s cubic-bezier(.4,0,.2,1),background 0.3s"}}/>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div key={screen} style={{flex:1,overflowY:"auto",overflowX:"hidden",zIndex:1,
        padding:"18px 15px 0",WebkitOverflowScrolling:"touch"}}>
        {screen==="home" &&<Home data={data} tr={tr} logs={logs} onToggle={toggle} onEdit={h=>{setEditing(h);setEditType("habit");}} onLog={h=>h.logType==="sveglia"?setWakeHabit(h):null} setScreen={setScreen} setData={setData}/>}
        {screen==="abitudini" &&<Abitudini data={data} tr={tr} logs={logs} onToggle={toggle} onEdit={h=>{setEditing({...h});setEditType("habit");}} onLog={h=>h.logType==="sveglia"?setWakeHabit(h):null} onReorder={reorder} onAdd={addHabit}/>}
        {screen==="goals" &&<Goals data={data} setData={setData} onEdit={g=>{setEditing(g);setEditType("goal");}}/>}
        {screen==="task" &&<TaskScreen data={data} setData={setData}/>}
        {screen==="vita" &&<Vita data={data} setData={setData}/>}
        {screen==="stats" &&<Stats data={data} tr={tr}/>}
        <div style={{height:88}}/>
      </div>

      {/* BOTTOM NAV */}
      <div style={{flexShrink:0,zIndex:20,
        background:"rgba(10,10,10,0.95)",backdropFilter:"blur(20px)",
        borderTop:`1px solid ${Z.b}`,
        paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{display:"flex"}}>
          {NAV.map(n=>{
            const a=screen===n.id,c=ACCENT[n.id]||ACCENT.home;
            return(
              <button key={n.id} onClick={()=>setScreen(n.id)}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                  padding:"8px 4px 6px",color:a?c:Z.t3,transition:"color 0.2s"}}>
                <div style={{width:42,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",
                  background:a?`${c}1a`:"transparent",transition:"background 0.2s"}}>
                  {ICO[n.id]?.(a)}
                </div>
                <span style={{fontSize:9,fontWeight:a?600:400,letterSpacing:"0.01em",lineHeight:1}}>{n.l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {editing&&<EditSheet item={editing} isGoal={editType==="goal"} onSave={saveEdit} onDel={delEdit} onClose={()=>setEditing(null)}/>}
      {wakeHabit&&<WakeLog h={wakeHabit} logs={logs} onLog={saveWake} onClose={()=>setWakeHabit(null)}/>}
    </div>
  );
}
