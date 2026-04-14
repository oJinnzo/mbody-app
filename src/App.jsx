import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ── MBody AI brand palette ────────────────────────────────────────────────────
// Source: mbody.ai — deep navy background, crisp white text, electric cyan accent
const C = {
  bg:       "#050a12",   // near-black navy (site background)
  surface:  "#0c1524",   // slightly lighter panel
  card:     "#101d30",   // card background
  border:   "#1a2e47",   // subtle border
  accent:   "#4fc3f7",   // electric cyan (matches site CTA color)
  accentDim:"#0288d1",   // deeper cyan for gradients
  good:     "#22c55e",   // green — pass / good
  monitor:  "#f59e0b",   // amber — monitor
  attention:"#ef4444",   // red — attention / fail
  text:     "#e8f0fe",   // near-white body text
  muted:    "#5c7a99",   // muted secondary text
  white:    "#ffffff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};font-family:'Inter',sans-serif;color:${C.text};}
  .app{min-height:100vh;padding-bottom:80px;}

  /* ── Header ── */
  .header{
    background:${C.bg};
    border-bottom:1px solid ${C.border};
    padding:14px 20px;
    position:sticky;top:0;z-index:100;
  }
  .header-inner{max-width:700px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;}
  .logo{display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none;}
  .logo-mark{
    width:34px;height:34px;border-radius:8px;
    background:linear-gradient(135deg,${C.accentDim},${C.accent});
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#000;
    letter-spacing:-0.5px;flex-shrink:0;
  }
  .logo-text{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:${C.white};letter-spacing:0.5px;}
  .logo-text span{color:${C.accent};}
  .logo-sub{font-size:10px;color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;margin-top:1px;}
  .step-badge{background:${C.surface};border:1px solid ${C.border};color:${C.accent};font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;}

  /* ── Layout ── */
  .content{max-width:700px;margin:0 auto;padding:20px 16px;}
  .sec{
    font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;
    letter-spacing:3px;text-transform:uppercase;color:${C.accent};
    margin:26px 0 10px;display:flex;align-items:center;gap:8px;
  }
  .sec::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,${C.accent}50,transparent);}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:18px;margin-bottom:10px;}

  /* ── Form fields ── */
  .fr{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
  .fl{display:flex;flex-direction:column;gap:5px;}
  .fl label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:${C.muted};}
  .fl input{background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:10px 13px;border-radius:8px;font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;}
  .fl input:focus{border-color:${C.accent};}

  /* ── Inspection rows ── */
  .irow{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid ${C.border}25;gap:10px;}
  .irow:last-child{border-bottom:none;}
  .rlabel{flex:1;font-size:13px;color:${C.text};}
  .rg{display:flex;gap:5px;}
  .rb{
    display:flex;align-items:center;justify-content:center;
    padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;
    cursor:pointer;border:1.5px solid ${C.border};background:transparent;
    color:${C.muted};transition:all .15s;user-select:none;min-width:36px;
  }
  .rb.g{background:${C.good}18;border-color:${C.good};color:${C.good};}
  .rb.m{background:${C.monitor}18;border-color:${C.monitor};color:${C.monitor};}
  .rb.a{background:${C.attention}18;border-color:${C.attention};color:${C.attention};}
  .ni{
    background:${C.surface};border:1px solid ${C.border};color:${C.text};
    padding:7px 10px;border-radius:6px;font-size:12px;font-family:'Inter',sans-serif;
    outline:none;width:120px;flex-shrink:0;transition:border-color .2s;
  }
  .ni::placeholder{color:${C.muted};}
  .ni:focus{border-color:${C.accent};}

  /* ── Machine tabs ── */
  .tabs{display:flex;gap:8px;margin-bottom:18px;}
  .tab{
    flex:1;padding:11px;text-align:center;border-radius:10px;
    font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;
    letter-spacing:1px;cursor:pointer;border:2px solid ${C.border};
    background:transparent;color:${C.muted};transition:all .2s;
  }
  .tab.on{border-color:${C.accent};color:${C.accent};background:${C.accent}12;}

  /* ── Battery grid ── */
  .bg{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .bf{display:flex;flex-direction:column;gap:4px;}
  .bf label{font-size:10px;color:${C.muted};text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .bf input{
    background:${C.surface};border:1px solid ${C.border};color:${C.accent};
    padding:10px 13px;border-radius:8px;font-size:18px;
    font-family:'Space Grotesk',sans-serif;font-weight:700;outline:none;text-align:center;
    transition:border-color .2s;
  }
  .bf input:focus{border-color:${C.accent};}

  /* ── Textarea ── */
  textarea{
    background:${C.surface};border:1px solid ${C.border};color:${C.text};
    padding:12px 13px;border-radius:8px;font-size:14px;font-family:'Inter',sans-serif;
    outline:none;width:100%;resize:vertical;min-height:90px;transition:border-color .2s;
  }
  textarea:focus{border-color:${C.accent};}

  /* ── Status selectors ── */
  .ss{display:flex;gap:8px;}
  .sb{
    flex:1;padding:10px;text-align:center;border-radius:8px;
    font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;
    letter-spacing:1px;cursor:pointer;border:2px solid ${C.border};
    background:transparent;color:${C.muted};transition:all .2s;
  }
  .sb.sg{border-color:${C.good};color:${C.good};background:${C.good}12;}
  .sb.sm{border-color:${C.monitor};color:${C.monitor};background:${C.monitor}12;}
  .sb.sa{border-color:${C.attention};color:${C.attention};background:${C.attention}12;}
  .sb.sn{border-color:${C.good};color:${C.good};background:${C.good}12;}
  .sb.sl{border-color:#84cc16;color:#84cc16;background:#84cc1612;}
  .sb.sme{border-color:${C.monitor};color:${C.monitor};background:${C.monitor}12;}
  .sb.sh{border-color:${C.attention};color:${C.attention};background:${C.attention}12;}

  /* ── Buttons ── */
  .btn{
    width:100%;padding:15px;
    background:linear-gradient(135deg,${C.accent},${C.accentDim});
    border:none;border-radius:10px;color:#000;
    font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:18px;
    transition:opacity .2s;
  }
  .btn:hover{opacity:.88;}
  .btn:disabled{opacity:.35;cursor:not-allowed;}
  .btn2{
    width:100%;padding:12px;background:transparent;
    border:1.5px solid ${C.border};border-radius:10px;color:${C.muted};
    font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;
    transition:all .2s;
  }
  .btn2:hover{border-color:${C.accent}50;color:${C.accent};}
  .btn-pdf{
    width:100%;padding:15px;
    background:linear-gradient(135deg,${C.good},#16a34a);
    border:none;border-radius:10px;color:#000;
    font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:10px;
    transition:opacity .2s;
  }
  .btn-pdf:hover{opacity:.88;}
  .btn-pdf:disabled{opacity:.55;cursor:wait;}
  .btn-email{
    width:100%;padding:13px;background:transparent;
    border:1.5px solid #6366f1;border-radius:10px;color:#818cf8;
    font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;
    letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;
    transition:all .2s;
  }
  .btn-email:hover{background:#6366f115;}

  /* ── Report preview ── */
  .receipt-preview{
    background:${C.card};border:1px solid ${C.border};
    border-radius:14px;padding:22px;
  }
  .rh{text-align:center;border-bottom:1px solid ${C.border};padding-bottom:16px;margin-bottom:16px;}
  .rlogo{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${C.white};letter-spacing:1px;}
  .rlogo span{color:${C.accent};}
  .rlogo-sub{font-size:10px;color:${C.muted};letter-spacing:2.5px;text-transform:uppercase;margin-top:3px;}
  .rmeta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
  .mi{display:flex;flex-direction:column;gap:2px;}
  .ml{font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .mv{font-size:13px;font-weight:500;}
  .rstatus{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:10px;margin-bottom:16px;}
  .rsec{margin-bottom:14px;}
  .rsect{
    font-family:'Space Grotesk',sans-serif;font-size:10px;letter-spacing:2.5px;
    color:${C.accent};text-transform:uppercase;margin-bottom:6px;
    border-bottom:1px solid ${C.border};padding-bottom:4px;
  }
  .rrow{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid ${C.border}18;}
  .rrow:last-child{border-bottom:none;}
  .ri{font-size:13px;}
  .badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.5px;}
  .bp{background:${C.good}18;color:${C.good};}
  .bm{background:${C.monitor}18;color:${C.monitor};}
  .ba{background:${C.attention}18;color:${C.attention};}
  .bn{background:${C.border};color:${C.muted};}
  .sig{border-top:1px solid ${C.border};padding-top:12px;margin-top:16px;display:flex;justify-content:space-between;font-size:11px;color:${C.muted};}

  /* ── History cards ── */
  .hcard{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:16px;margin-bottom:10px;transition:border-color .2s;}
  .hcard:hover{border-color:${C.accent}40;}
  .hcard-top{display:flex;justify-content:space-between;align-items:flex-start;}
  .hcard-prop{font-weight:600;font-size:15px;}
  .hcard-date{font-size:11px;color:${C.muted};margin-top:2px;}
  .hcard-meta{display:flex;gap:10px;margin-top:6px;font-size:12px;color:${C.muted};flex-wrap:wrap;}
  .hcard-actions{display:flex;gap:8px;margin-top:12px;}
  .hbtn{
    flex:1;padding:9px;text-align:center;border-radius:7px;
    font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;
    letter-spacing:.5px;cursor:pointer;border:1.5px solid ${C.border};
    background:transparent;color:${C.muted};transition:all .2s;
  }
  .hbtn:hover{border-color:${C.accent}50;color:${C.accent};}

  /* ── Misc ── */
  .empty{text-align:center;padding:48px 20px;color:${C.muted};}
  .empty-icon{font-size:40px;margin-bottom:12px;}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);font-weight:700;padding:12px 24px;border-radius:30px;font-size:13px;z-index:999;white-space:nowrap;letter-spacing:.5px;}
  .toast.ok{background:${C.good};color:#000;}
  .toast.err{background:${C.attention};color:#fff;}

  /* ── Divider label ── */
  .field-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:${C.muted};margin-bottom:8px;display:block;}
`;

// ── Option sets ───────────────────────────────────────────────────────────────
const GMA=[{value:'G',label:'G'},{value:'M',label:'M'},{value:'A',label:'A'}];
const PF=[{value:'Pass',label:'Pass'},{value:'Fail',label:'Fail'}];
const WPF=[{value:'Work',label:'Work'},{value:'Partial',label:'Part'},{value:'Fail',label:'Fail'}];
const OKUF=[{value:'OK',label:'OK'},{value:'Updated',label:'Upd'},{value:'Fail',label:'Fail'}];
const CDmg=[{value:'Clean',label:'Clean'},{value:'Debris',label:'Debris'},{value:'Dmg',label:'Dmg'}];
const Body=[{value:'None',label:'None'},{value:'Cos',label:'Cosm'},{value:'Struct',label:'Struct'}];
const MovOpts=[{value:'Smooth',label:'Smooth'},{value:'Resist',label:'Resist'}];
const CamOpts=[{value:'Pass',label:'Pass'},{value:'Dirty',label:'Dirty'},{value:'Fault',label:'Fault'}];
const WF=[{value:'Work',label:'Work'},{value:'Fault',label:'Fault'},{value:'N/A',label:'N/A'}];
const RLeak=[{value:'G',label:'Good'},{value:'Leak',label:'Leak'},{value:'Crack',label:'Crack'}];
const DrainOpts=[{value:'Clean',label:'Clean'},{value:'Clog',label:'Clog'}];
const SqOpts=[{value:'Good',label:'Good'},{value:'Worn',label:'Worn'}];
const VacOpts=[{value:'Firm',label:'Firm'},{value:'Weak',label:'Weak'},{value:'Crack',label:'Crack'}];
const MagOpts=[{value:'Secure',label:'Secure'},{value:'Loose',label:'Loose'},{value:'Dmg',label:'Dmg'}];
const SensorOpts=[{value:'Clean',label:'Clean'},{value:'Fault',label:'Fault'}];

const iv=()=>({val:'',note:''});
const initSP50=()=>({filterBag:iv(),hepaFilter:iv(),rollerBrush:iv(),trashTray:iv(),trayFilter:iv(),chassis:iv(),underMachine:iv(),body:iv(),manualMove:iv(),chargingSys:iv(),chargePort:iv(),camera:iv(),lights:iv(),firmware:iv(),g4g:iv(),imu:iv(),rollerLift:iv(),rbRpm:iv(),vacMotor:iv(),sideBrush:iv(),baffleFreq:iv(),battHealth:'',battVoltage:'',battCurrent:'',leftMotor:'',rightMotor:''});
const initL50=()=>({recoveryTank:iv(),drainFilter:iv(),squeegee:iv(),vacHose:iv(),filterBag:iv(),magPad:iv(),freshSensor:iv(),autoDrain:iv(),autoFill:iv(),chassis:iv(),underMachine:iv(),body:iv(),manualMove:iv(),chargingSys:iv(),chargePort:iv(),camera:iv(),lights:iv(),firmware:iv()});

const getColor=v=>{
  if(!v) return 'bn';
  if(['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(v)) return 'bp';
  if(['M','Dirty','Weak','Loose','Updated','Partial'].includes(v)) return 'bm';
  return 'ba';
};

// ── localStorage ──────────────────────────────────────────────────────────────
const STORE='mbody_inspections';
const loadHistory=()=>{try{const r=localStorage.getItem(STORE);return r?JSON.parse(r):[];}catch{return [];}};
const saveHistory=h=>{try{localStorage.setItem(STORE,JSON.stringify(h));}catch{}};

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPDF(record){
  const{info:ri,summary:rs,sp50:rsp,l50:rl,techNotes:rn}=record;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  let y=15;

  const sRGB=rs.status==='Good'?[34,197,94]:rs.status==='Monitor'?[245,158,11]:[239,68,68];

  // Header bar
  doc.setFillColor(5,10,18);
  doc.rect(0,0,W,30,'F');
  // Accent stripe
  doc.setFillColor(79,195,247);
  doc.rect(0,28,W,2,'F');
  // Logo
  doc.setFont('helvetica','bold');
  doc.setFontSize(18);
  doc.setTextColor(255,255,255);
  doc.text('MBody',14,18);
  doc.setTextColor(79,195,247);
  doc.text(' AI',14+doc.getTextWidth('MBody'),18);
  doc.setFontSize(8);
  doc.setTextColor(92,122,153);
  doc.text('SERVICE INSPECTION REPORT',14,24);
  // Date top right
  doc.setFontSize(8);
  doc.setTextColor(92,122,153);
  doc.text(ri.date||'',W-14,18,{align:'right'});
  y=38;

  // Meta table
  doc.autoTable({
    startY:y,
    head:[],
    body:[
      ['Property',ri.property||'—','Date',ri.date||'—'],
      ['Technician',ri.technician||'—','Next Visit',ri.nextVisit||'—'],
      ['Machine',ri.model?.join(' + ')||'—','Serial #',ri.serial||'—'],
      ['Firmware',ri.firmware||'—','Visit Type','Scheduled'],
    ],
    theme:'plain',
    styles:{fontSize:9,cellPadding:2,textColor:[30,50,70]},
    columnStyles:{
      0:{fontStyle:'bold',cellWidth:28,textColor:[92,122,153]},
      1:{cellWidth:62},
      2:{fontStyle:'bold',cellWidth:28,textColor:[92,122,153]},
      3:{cellWidth:62},
    },
  });
  y=doc.lastAutoTable.finalY+6;

  // Status bar
  if(rs.status){
    doc.setFillColor(...sRGB);
    doc.roundedRect(14,y,W-28,14,3,3,'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(11);
    doc.text(`STATUS: ${rs.status}`,20,y+9);
    doc.text(`RISK LEVEL: ${rs.risk||'—'}`,W-55,y+9);
    y+=20;
  }

  // Action required
  if(rs.action){
    doc.setFillColor(254,226,226);
    doc.roundedRect(14,y,W-28,10,2,2,'F');
    doc.setTextColor(185,28,28);
    doc.setFont('helvetica','bold');
    doc.setFontSize(9);
    doc.text(`⚠ ACTION REQUIRED: ${rs.action}`,18,y+6.5);
    y+=16;
  }

  const addSection=(title,rows)=>{
    if(y>248){doc.addPage();y=15;}
    doc.autoTable({
      startY:y,
      head:[[{content:title,colSpan:3,styles:{fillColor:[10,21,36],textColor:[79,195,247],fontStyle:'bold',fontSize:9}}]],
      body:rows.map(([label,v])=>[label,v?.val||'—',v?.note||'']),
      theme:'striped',
      headStyles:{fillColor:[10,21,36]},
      styles:{fontSize:9,cellPadding:2.5},
      columnStyles:{
        0:{cellWidth:80,textColor:[40,60,80]},
        1:{cellWidth:30,fontStyle:'bold'},
        2:{cellWidth:60,textColor:[92,122,153],fontSize:8},
      },
      didParseCell:(data)=>{
        if(data.column.index===1&&data.section==='body'){
          const v=data.cell.raw;
          if(['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(v)) data.cell.styles.textColor=[22,163,74];
          else if(['M','Dirty','Weak','Loose','Updated','Partial'].includes(v)) data.cell.styles.textColor=[217,119,6];
          else if(v&&v!=='—') data.cell.styles.textColor=[220,38,38];
        }
      },
    });
    y=doc.lastAutoTable.finalY+4;
  };

  if(rsp){
    addSection('SP50 — Filtration & Cleaning',[['Filter Bag',rsp.filterBag],['HEPA Filter',rsp.hepaFilter],['Roller Brush',rsp.rollerBrush],['Trash Tray',rsp.trashTray],['Tray Filter',rsp.trayFilter]]);
    addSection('SP50 — Mechanical / Electrical / Sensors',[['Chassis / Frame',rsp.chassis],['Under Machine',rsp.underMachine],['Body Condition',rsp.body],['Manual Movement',rsp.manualMove],['Charging System',rsp.chargingSys],['Charge Port',rsp.chargePort],['Camera / Lidar',rsp.camera],['Lights',rsp.lights],['Firmware',rsp.firmware]]);
    addSection('SP50 — Diagnostics',[['4G Check',rsp.g4g],['IMU',rsp.imu],['Roller Brush Lift Height',rsp.rollerLift],['RB RPM',rsp.rbRpm],['Vac Motor Speed',rsp.vacMotor],['Side Brush RPM',rsp.sideBrush],['Baffle Movement Freq',rsp.baffleFreq]]);
    const batt=[['Health',rsp.battHealth,'%'],['Voltage',rsp.battVoltage,'V'],['Current',rsp.battCurrent,'A'],['Left Motor Load',rsp.leftMotor,''],['Right Motor Load',rsp.rightMotor,'']].filter(([,v])=>v);
    if(batt.length){
      if(y>248){doc.addPage();y=15;}
      doc.autoTable({startY:y,head:[[{content:'SP50 — Battery',colSpan:2,styles:{fillColor:[10,21,36],textColor:[79,195,247],fontStyle:'bold',fontSize:9}}]],body:batt.map(([l,v,u])=>[l,`${v}${u}`]),theme:'striped',styles:{fontSize:9,cellPadding:2.5},columnStyles:{0:{cellWidth:80},1:{fontStyle:'bold',textColor:[0,150,200]}}});
      y=doc.lastAutoTable.finalY+4;
    }
  }
  if(rl){
    addSection('L50 — Fluid & Recovery System',[['Recovery Tank',rl.recoveryTank],['Drain Filter',rl.drainFilter],['Squeegee',rl.squeegee],['Vacuum Hose',rl.vacHose]]);
    addSection('L50 — Pads, Sensors & Automation',[['Filter Bag',rl.filterBag],['Mag Pad Holders',rl.magPad],['Fresh Water Sensor',rl.freshSensor],['Auto Drain',rl.autoDrain],['Auto Fill',rl.autoFill]]);
    addSection('L50 — Mechanical / Electrical / Sensors',[['Chassis / Frame',rl.chassis],['Under Machine',rl.underMachine],['Body Condition',rl.body],['Manual Movement',rl.manualMove],['Charging System',rl.chargingSys],['Charge Port',rl.chargePort],['Camera / Lidar',rl.camera],['Lights',rl.lights],['Firmware',rl.firmware]]);
  }

  if(rn){
    if(y>240){doc.addPage();y=15;}
    doc.setFillColor(10,21,36);
    doc.roundedRect(14,y,W-28,8,2,2,'F');
    doc.setTextColor(79,195,247);
    doc.setFont('helvetica','bold');
    doc.setFontSize(9);
    doc.text('TECHNICIAN NOTES',18,y+5.5);
    y+=11;
    doc.setTextColor(40,60,80);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    const lines=doc.splitTextToSize(rn,W-28);
    doc.text(lines,14,y);
    y+=lines.length*5+6;
  }

  // Signature
  if(y>260){doc.addPage();y=15;}
  doc.setDrawColor(180,180,180);
  doc.line(14,y+10,90,y+10);
  doc.line(110,y+10,W-14,y+10);
  doc.setTextColor(150,150,150);
  doc.setFontSize(8);
  doc.text(`Technician: ${ri.technician||''}`,14,y+15);
  doc.text('Client Acknowledgment:',110,y+15);

  // Footer
  const totalPages=doc.internal.getNumberOfPages();
  for(let i=1;i<=totalPages;i++){
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(92,122,153);
    doc.text(`MBody AI  ·  Service Inspection Report  ·  ${ri.property||''}  ·  ${ri.date||''}  ·  Page ${i} of ${totalPages}`,W/2,doc.internal.pageSize.getHeight()-6,{align:'center'});
  }

  const fname=`mbody-ai-${(ri.property||'inspection').replace(/\s+/g,'-').toLowerCase()}-${ri.date||'report'}.pdf`;
  doc.save(fname);
}

// ── Email text export ─────────────────────────────────────────────────────────
function emailReport(record){
  const{info:ri,summary:rs,sp50:rsp,l50:rl,techNotes:rn}=record;
  const line=(label,v)=>`${label}: ${v?.val||'—'}${v?.note?' ('+v.note+')':''}`;
  let body=`MBODY AI — SERVICE INSPECTION REPORT\n${'='.repeat(42)}\n\n`;
  body+=`Property: ${ri.property||'—'}\nTechnician: ${ri.technician||'—'}\nDate: ${ri.date||'—'}\nNext Visit: ${ri.nextVisit||'—'}\nMachine: ${ri.model?.join(' + ')||'—'}\nSerial #: ${ri.serial||'—'}\nFirmware: ${ri.firmware||'—'}\n\n`;
  if(rs.status) body+=`STATUS: ${rs.status}   RISK: ${rs.risk||'—'}\n`;
  if(rs.action) body+=`ACTION REQUIRED: ${rs.action}\n`;
  body+='\n';
  if(rsp){
    body+=`SP50 — FILTRATION & CLEANING\n${'-'.repeat(30)}\n`;
    body+=[line('Filter Bag',rsp.filterBag),line('HEPA Filter',rsp.hepaFilter),line('Roller Brush',rsp.rollerBrush),line('Trash Tray',rsp.trashTray),line('Tray Filter',rsp.trayFilter)].join('\n')+'\n\n';
    body+=`SP50 — MECHANICAL / ELECTRICAL\n${'-'.repeat(30)}\n`;
    body+=[line('Chassis/Frame',rsp.chassis),line('Under Machine',rsp.underMachine),line('Body',rsp.body),line('Movement',rsp.manualMove),line('Charging',rsp.chargingSys),line('Charge Port',rsp.chargePort),line('Camera/Lidar',rsp.camera),line('Lights',rsp.lights),line('Firmware',rsp.firmware)].join('\n')+'\n\n';
    body+=`SP50 — DIAGNOSTICS\n${'-'.repeat(30)}\n`;
    body+=[line('4G',rsp.g4g),line('IMU',rsp.imu),line('RB Lift',rsp.rollerLift),line('RB RPM',rsp.rbRpm),line('Vac Motor',rsp.vacMotor),line('Side Brush',rsp.sideBrush),line('Baffle Freq',rsp.baffleFreq)].join('\n')+'\n\n';
  }
  if(rl){
    body+=`L50 — FLUID & RECOVERY\n${'-'.repeat(30)}\n`;
    body+=[line('Recovery Tank',rl.recoveryTank),line('Drain Filter',rl.drainFilter),line('Squeegee',rl.squeegee),line('Vac Hose',rl.vacHose)].join('\n')+'\n\n';
    body+=`L50 — PADS & AUTOMATION\n${'-'.repeat(30)}\n`;
    body+=[line('Filter Bag',rl.filterBag),line('Mag Pad Holders',rl.magPad),line('Fresh Sensor',rl.freshSensor),line('Auto Drain',rl.autoDrain),line('Auto Fill',rl.autoFill)].join('\n')+'\n\n';
    body+=`L50 — MECHANICAL / ELECTRICAL\n${'-'.repeat(30)}\n`;
    body+=[line('Chassis',rl.chassis),line('Under Machine',rl.underMachine),line('Body',rl.body),line('Movement',rl.manualMove),line('Charging',rl.chargingSys),line('Charge Port',rl.chargePort),line('Camera/Lidar',rl.camera),line('Lights',rl.lights),line('Firmware',rl.firmware)].join('\n')+'\n\n';
  }
  if(rn) body+=`TECHNICIAN NOTES\n${'-'.repeat(30)}\n${rn}\n\n`;
  body+='\nSent via MBody AI Service Inspection App · mbody.ai';
  window.location.href=`mailto:?subject=${encodeURIComponent(`MBody AI Inspection – ${ri.property||'Property'} – ${ri.date||'Today'}`)}&body=${encodeURIComponent(body)}`;
}

// ── Small reusable components ─────────────────────────────────────────────────
const RadioGroup=({options,value,onChange})=>(
  <div className="rg">
    {options.map(opt=>{
      const sel=value===opt.value;
      let cls='';
      if(sel) cls=['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(opt.value)?'g':['M','Dirty','Weak','Loose','Updated','Partial'].includes(opt.value)?'m':'a';
      return <div key={opt.value} className={`rb ${sel?cls:''}`} onClick={()=>onChange(opt.value)}>{opt.label}</div>;
    })}
  </div>
);

const IRow=({label,options,field,value,onChange})=>{
  const[note,setNote]=useState(value.note||'');
  useEffect(()=>setNote(value.note||''),[value.note]);
  return(
    <div className="irow">
      <div className="rlabel">{label}</div>
      <RadioGroup options={options} value={value.val} onChange={v=>onChange(field,{...value,val:v})}/>
      <input className="ni" placeholder="notes..." value={note} onChange={e=>{setNote(e.target.value);onChange(field,{...value,note:e.target.value});}}/>
    </div>
  );
};

const RBadge=({val})=><span className={`badge ${getColor(val)}`}>{val||'—'}</span>;

const Section=({title,rows})=>(
  <div className="rsec">
    <div className="rsect">{title}</div>
    {rows.map(([l,v])=>(
      <div className="rrow" key={l}>
        <div className="ri">{l}{v?.note?<span style={{color:C.muted,fontSize:11,marginLeft:6}}>— {v.note}</span>:''}</div>
        <RBadge val={v?.val}/>
      </div>
    ))}
  </div>
);

const Logo=()=>(
  <div className="logo" onClick={()=>{}}>
    <div className="logo-mark">MB</div>
    <div>
      <div className="logo-text">MBody <span>AI</span></div>
      <div className="logo-sub">Service Inspection</div>
    </div>
  </div>
);

const ReceiptPreview=({record})=>{
  const{info:ri,summary:rs,sp50:rsp,l50:rl,techNotes:rn}=record;
  const scolor=rs.status==='Good'?C.good:rs.status==='Monitor'?C.monitor:C.attention;
  return(
    <div className="receipt-preview">
      <div className="rh">
        <div className="rlogo">MBody <span>AI</span></div>
        <div className="rlogo-sub">Service Inspection Report</div>
      </div>
      <div className="rmeta">
        {[['Property',ri.property],['Technician',ri.technician],['Date',ri.date],['Next Visit',ri.nextVisit],['Machine',ri.model?.join(' + ')],['Serial #',ri.serial]].map(([l,v])=>(
          <div className="mi" key={l}><div className="ml">{l}</div><div className="mv">{v||'—'}</div></div>
        ))}
      </div>
      {rs.status&&<div className="rstatus" style={{background:scolor+'18',border:`1px solid ${scolor}40`}}>
        <div><div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:1.5}}>Overall Status</div><div style={{fontSize:20,fontFamily:'Space Grotesk',fontWeight:700,color:scolor}}>{rs.status}</div></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:1.5}}>Risk Level</div><div style={{fontSize:20,fontFamily:'Space Grotesk',fontWeight:700,color:scolor}}>{rs.risk||'—'}</div></div>
      </div>}
      {rs.action&&<div style={{background:C.attention+'15',border:`1px solid ${C.attention}40`,borderRadius:8,padding:'10px 13px',marginBottom:14,fontSize:13,color:C.attention}}><strong>Action Required:</strong> {rs.action}</div>}
      {rsp&&<>
        <Section title="SP50 — Filtration & Cleaning" rows={[['Filter Bag',rsp.filterBag],['HEPA Filter',rsp.hepaFilter],['Roller Brush',rsp.rollerBrush],['Trash Tray',rsp.trashTray],['Tray Filter',rsp.trayFilter]]}/>
        <Section title="SP50 — Mechanical / Electrical" rows={[['Chassis',rsp.chassis],['Under Machine',rsp.underMachine],['Body',rsp.body],['Movement',rsp.manualMove],['Charging',rsp.chargingSys],['Charge Port',rsp.chargePort],['Camera/Lidar',rsp.camera],['Lights',rsp.lights],['Firmware',rsp.firmware]]}/>
        <Section title="SP50 — Diagnostics" rows={[['4G',rsp.g4g],['IMU',rsp.imu],['RB Lift',rsp.rollerLift],['RB RPM',rsp.rbRpm],['Vac Motor',rsp.vacMotor],['Side Brush',rsp.sideBrush],['Baffle Freq',rsp.baffleFreq]]}/>
      </>}
      {rl&&<>
        <Section title="L50 — Fluid & Recovery" rows={[['Recovery Tank',rl.recoveryTank],['Drain Filter',rl.drainFilter],['Squeegee',rl.squeegee],['Vac Hose',rl.vacHose]]}/>
        <Section title="L50 — Pads & Automation" rows={[['Filter Bag',rl.filterBag],['Mag Pad Holders',rl.magPad],['Fresh Sensor',rl.freshSensor],['Auto Drain',rl.autoDrain],['Auto Fill',rl.autoFill]]}/>
        <Section title="L50 — Mechanical / Electrical" rows={[['Chassis',rl.chassis],['Under Machine',rl.underMachine],['Body',rl.body],['Movement',rl.manualMove],['Charging',rl.chargingSys],['Charge Port',rl.chargePort],['Camera/Lidar',rl.camera],['Lights',rl.lights],['Firmware',rl.firmware]]}/>
      </>}
      {rn&&<div className="rsec"><div className="rsect">Technician Notes</div><div style={{fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{rn}</div></div>}
      <div className="sig"><span>Tech: {ri.technician||'___________________'}</span><span>Client: ___________________</span></div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(){
  const[step,setStep]=useState('home');
  const[history,setHistory]=useState(()=>loadHistory());
  const[toast,setToast]=useState(null);
  const[viewingRecord,setViewingRecord]=useState(null);
  const[pdfLoading,setPdfLoading]=useState(false);

  const[info,setInfo]=useState({property:'',technician:'',date:new Date().toISOString().split('T')[0],nextVisit:'',model:[],serial:'',firmware:''});
  const[summary,setSummary]=useState({status:'',risk:'',action:''});
  const[sp50,setSp50]=useState(initSP50());
  const[l50,setL50]=useState(initL50());
  const[techNotes,setTechNotes]=useState('');

  const hasSP50=info.model.includes('SP50');
  const hasL50=info.model.includes('L50');
  const toggleModel=m=>setInfo(p=>({...p,model:p.model.includes(m)?p.model.filter(x=>x!==m):[...p.model,m]}));
  const sp50set=(f,v)=>setSp50(p=>({...p,[f]:v}));
  const l50set=(f,v)=>setL50(p=>({...p,[f]:v}));

  const resetForm=()=>{
    setInfo({property:'',technician:'',date:new Date().toISOString().split('T')[0],nextVisit:'',model:[],serial:'',firmware:''});
    setSummary({status:'',risk:'',action:''});
    setSp50(initSP50());setL50(initL50());setTechNotes('');setViewingRecord(null);
  };

  const showToast=(msg,type='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  const saveInspection=()=>{
    const id='insp_'+Date.now();
    const record={id,savedAt:new Date().toISOString(),info,summary,sp50:hasSP50?sp50:null,l50:hasL50?l50:null,techNotes};
    const updated=[record,...history];
    setHistory(updated);saveHistory(updated);
    showToast('✓ Inspection Saved');
    return record;
  };

  const deleteInspection=(id,e)=>{
    e.stopPropagation();
    if(!confirm('Delete this inspection?')) return;
    const updated=history.filter(x=>x.id!==id);
    setHistory(updated);saveHistory(updated);
  };

  const currentRecord=()=>({id:'live',savedAt:new Date().toISOString(),info,summary,sp50:hasSP50?sp50:null,l50:hasL50?l50:null,techNotes});

  const handlePDF=async(record)=>{
    setPdfLoading(true);
    try{exportPDF(record);}catch(e){showToast('PDF export failed','err');}
    setTimeout(()=>setPdfLoading(false),1500);
  };

  const labels={home:'HOME',intake:'SETUP',sp50:'SP50',l50:'L50',summary:'SUMMARY',receipt:'REPORT'};

  return(
    <>
      <style>{css}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <div className="header-inner">
            <div onClick={()=>{resetForm();setStep('home');}} style={{cursor:'pointer'}}>
              <Logo/>
            </div>
            <div className="step-badge">{labels[step]}</div>
          </div>
        </div>

        {toast&&<div className={`toast ${toast.type}`}>{toast.msg}</div>}

        {/* ── HOME ── */}
        {step==='home'&&<div className="content">
          <button className="btn" style={{marginTop:0}} onClick={()=>{resetForm();setStep('intake');}}>+ New Inspection</button>
          <div className="sec">Saved Inspections ({history.length})</div>
          {history.length===0
            ?<div className="empty"><div className="empty-icon">📋</div><div style={{fontWeight:600,fontSize:15}}>No inspections yet</div><div style={{fontSize:12,marginTop:6}}>Complete your first inspection to see it here.</div></div>
            :history.map(rec=>(
              <div className="hcard" key={rec.id}>
                <div className="hcard-top">
                  <div>
                    <div className="hcard-prop">{rec.info.property||'Unnamed Property'}</div>
                    <div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · {new Date(rec.savedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                  {rec.summary.status&&<span className={`badge ${getColor(rec.summary.status==='Good'?'Pass':rec.summary.status==='Monitor'?'M':'Fail')}`}>{rec.summary.status}</span>}
                </div>
                <div className="hcard-meta">
                  <span>🤖 {rec.info.model?.join(' + ')||'—'}</span>
                  <span>S/N: {rec.info.serial||'—'}</span>
                  <span>👤 {rec.info.technician||'—'}</span>
                </div>
                <div className="hcard-actions">
                  <div className="hbtn" onClick={()=>{setViewingRecord(rec);setStep('receipt');}}>View</div>
                  <div className="hbtn" onClick={()=>handlePDF(rec)}>⬇ PDF</div>
                  <div className="hbtn" onClick={()=>emailReport(rec)}>📧 Email</div>
                  <div className="hbtn" onClick={e=>deleteInspection(rec.id,e)}>Delete</div>
                </div>
              </div>
            ))}
        </div>}

        {/* ── INTAKE ── */}
        {step==='intake'&&<div className="content">
          <div className="sec">Visit Information</div>
          <div className="card">
            <div className="fr">
              <div className="fl"><label>Property</label><input value={info.property} onChange={e=>setInfo(p=>({...p,property:e.target.value}))} placeholder="Property name"/></div>
              <div className="fl"><label>Technician</label><input value={info.technician} onChange={e=>setInfo(p=>({...p,technician:e.target.value}))} placeholder="Your name"/></div>
            </div>
            <div className="fr">
              <div className="fl"><label>Date</label><input type="date" value={info.date} onChange={e=>setInfo(p=>({...p,date:e.target.value}))}/></div>
              <div className="fl"><label>Next Visit</label><input type="date" value={info.nextVisit} onChange={e=>setInfo(p=>({...p,nextVisit:e.target.value}))}/></div>
            </div>
            <div className="fr">
              <div className="fl"><label>Serial Number</label><input value={info.serial} onChange={e=>setInfo(p=>({...p,serial:e.target.value}))} placeholder="S/N"/></div>
              <div className="fl"><label>Firmware</label><input value={info.firmware} onChange={e=>setInfo(p=>({...p,firmware:e.target.value}))} placeholder="v0.0.0"/></div>
            </div>
          </div>
          <div className="sec">Machine Model</div>
          <div className="card">
            <div className="tabs">
              <div className={`tab ${info.model.includes('SP50')?'on':''}`} onClick={()=>toggleModel('SP50')}>SP50</div>
              <div className={`tab ${info.model.includes('L50')?'on':''}`} onClick={()=>toggleModel('L50')}>L50</div>
            </div>
            <div style={{fontSize:12,color:C.muted,textAlign:'center'}}>Tap to select one or both</div>
          </div>
          <button className="btn" disabled={info.model.length===0} onClick={()=>setStep(hasSP50?'sp50':'l50')}>Begin Inspection →</button>
          <button className="btn2" onClick={()=>setStep('home')}>← Back</button>
        </div>}

        {/* ── SP50 ── */}
        {step==='sp50'&&<div className="content">
          {hasSP50&&hasL50&&<div className="tabs"><div className="tab on">SP50</div><div className="tab" onClick={()=>setStep('l50')}>L50</div></div>}
          <div className="sec">Filtration & Cleaning</div>
          <div className="card">
            <IRow label="Filter Bag" options={GMA} field="filterBag" value={sp50.filterBag} onChange={sp50set}/>
            <IRow label="HEPA Filter" options={GMA} field="hepaFilter" value={sp50.hepaFilter} onChange={sp50set}/>
            <IRow label="Roller Brush" options={GMA} field="rollerBrush" value={sp50.rollerBrush} onChange={sp50set}/>
            <IRow label="Trash Tray" options={GMA} field="trashTray" value={sp50.trashTray} onChange={sp50set}/>
            <IRow label="Tray Filter" options={GMA} field="trayFilter" value={sp50.trayFilter} onChange={sp50set}/>
          </div>
          <div className="sec">Mechanical / Electrical / Sensors</div>
          <div className="card">
            <IRow label="Chassis / Frame" options={GMA} field="chassis" value={sp50.chassis} onChange={sp50set}/>
            <IRow label="Under Machine" options={CDmg} field="underMachine" value={sp50.underMachine} onChange={sp50set}/>
            <IRow label="Body Condition" options={Body} field="body" value={sp50.body} onChange={sp50set}/>
            <IRow label="Manual Movement" options={MovOpts} field="manualMove" value={sp50.manualMove} onChange={sp50set}/>
            <IRow label="Charging System" options={PF} field="chargingSys" value={sp50.chargingSys} onChange={sp50set}/>
            <IRow label="Charge Port" options={PF} field="chargePort" value={sp50.chargePort} onChange={sp50set}/>
            <IRow label="Camera / Lidar" options={CamOpts} field="camera" value={sp50.camera} onChange={sp50set}/>
            <IRow label="Lights" options={WPF} field="lights" value={sp50.lights} onChange={sp50set}/>
            <IRow label="Firmware" options={OKUF} field="firmware" value={sp50.firmware} onChange={sp50set}/>
          </div>
          <div className="sec">Diagnostics</div>
          <div className="card">
            <IRow label="4G Check" options={GMA} field="g4g" value={sp50.g4g} onChange={sp50set}/>
            <IRow label="IMU" options={GMA} field="imu" value={sp50.imu} onChange={sp50set}/>
            <IRow label="Roller Brush Lift Height" options={GMA} field="rollerLift" value={sp50.rollerLift} onChange={sp50set}/>
            <IRow label="RB RPM" options={GMA} field="rbRpm" value={sp50.rbRpm} onChange={sp50set}/>
            <IRow label="Vac Motor Speed" options={GMA} field="vacMotor" value={sp50.vacMotor} onChange={sp50set}/>
            <IRow label="Side Brush RPM" options={GMA} field="sideBrush" value={sp50.sideBrush} onChange={sp50set}/>
            <IRow label="Baffle Movement Freq" options={GMA} field="baffleFreq" value={sp50.baffleFreq} onChange={sp50set}/>
          </div>
          <div className="sec">Battery Check</div>
          <div className="card">
            <div className="bg">
              {[['Health (%)','battHealth'],['Voltage (V)','battVoltage'],['Current (A)','battCurrent'],['Left Motor Load','leftMotor'],['Right Motor Load','rightMotor']].map(([lbl,key])=>(
                <div className="bf" key={key}><label>{lbl}</label><input type="number" placeholder="—" value={sp50[key]} onChange={e=>setSp50(p=>({...p,[key]:e.target.value}))}/></div>
              ))}
            </div>
          </div>
          {hasL50?<button className="btn" onClick={()=>setStep('l50')}>Continue to L50 →</button>:<button className="btn" onClick={()=>setStep('summary')}>Review & Summary →</button>}
        </div>}

        {/* ── L50 ── */}
        {step==='l50'&&<div className="content">
          {hasSP50&&hasL50&&<div className="tabs"><div className="tab" onClick={()=>setStep('sp50')}>SP50</div><div className="tab on">L50</div></div>}
          <div className="sec">Fluid & Recovery System</div>
          <div className="card">
            <IRow label="Recovery Tank" options={RLeak} field="recoveryTank" value={l50.recoveryTank} onChange={l50set}/>
            <IRow label="Drain Filter" options={DrainOpts} field="drainFilter" value={l50.drainFilter} onChange={l50set}/>
            <IRow label="Squeegee" options={SqOpts} field="squeegee" value={l50.squeegee} onChange={l50set}/>
            <IRow label="Vacuum Hose" options={VacOpts} field="vacHose" value={l50.vacHose} onChange={l50set}/>
          </div>
          <div className="sec">Pads, Sensors & Automation</div>
          <div className="card">
            <IRow label="Filter Bag" options={GMA} field="filterBag" value={l50.filterBag} onChange={l50set}/>
            <IRow label="Mag Pad Holders" options={MagOpts} field="magPad" value={l50.magPad} onChange={l50set}/>
            <IRow label="Fresh Water Sensor" options={SensorOpts} field="freshSensor" value={l50.freshSensor} onChange={l50set}/>
            <IRow label="Auto Drain" options={WF} field="autoDrain" value={l50.autoDrain} onChange={l50set}/>
            <IRow label="Auto Fill" options={WF} field="autoFill" value={l50.autoFill} onChange={l50set}/>
          </div>
          <div className="sec">Mechanical / Electrical / Sensors</div>
          <div className="card">
            <IRow label="Chassis / Frame" options={GMA} field="chassis" value={l50.chassis} onChange={l50set}/>
            <IRow label="Under Machine" options={CDmg} field="underMachine" value={l50.underMachine} onChange={l50set}/>
            <IRow label="Body Condition" options={Body} field="body" value={l50.body} onChange={l50set}/>
            <IRow label="Manual Movement" options={MovOpts} field="manualMove" value={l50.manualMove} onChange={l50set}/>
            <IRow label="Charging System" options={PF} field="chargingSys" value={l50.chargingSys} onChange={l50set}/>
            <IRow label="Charge Port" options={PF} field="chargePort" value={l50.chargePort} onChange={l50set}/>
            <IRow label="Camera / Lidar" options={CamOpts} field="camera" value={l50.camera} onChange={l50set}/>
            <IRow label="Lights" options={WPF} field="lights" value={l50.lights} onChange={l50set}/>
            <IRow label="Firmware" options={OKUF} field="firmware" value={l50.firmware} onChange={l50set}/>
          </div>
          <button className="btn" onClick={()=>setStep('summary')}>Review & Summary →</button>
        </div>}

        {/* ── SUMMARY ── */}
        {step==='summary'&&<div className="content">
          <div className="sec">Executive Summary</div>
          <div className="card">
            <div style={{marginBottom:16}}>
              <span className="field-label">Overall Status</span>
              <div className="ss">
                {[['Good','sg'],['Monitor','sm'],['Attention','sa']].map(([s,cls])=><div key={s} className={`sb ${summary.status===s?cls:''}`} onClick={()=>setSummary(p=>({...p,status:s}))}>{s}</div>)}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <span className="field-label">Risk Level</span>
              <div className="ss">
                {[['None','sn'],['Low','sl'],['Med','sme'],['High','sh']].map(([r,cls])=><div key={r} className={`sb ${summary.risk===r?cls:''}`} onClick={()=>setSummary(p=>({...p,risk:r}))}>{r}</div>)}
              </div>
            </div>
            <div className="fl">
              <label>Action Required</label>
              <input value={summary.action} onChange={e=>setSummary(p=>({...p,action:e.target.value}))} placeholder="Describe any required actions..." style={{background:C.surface,border:`1px solid ${C.border}`,color:C.text,padding:'10px 13px',borderRadius:8,fontSize:14,fontFamily:'Inter',outline:'none'}}/>
            </div>
          </div>
          <div className="sec">Technician Notes</div>
          <div className="card"><textarea placeholder="Diagnosis, observations, recommendations..." value={techNotes} onChange={e=>setTechNotes(e.target.value)}/></div>
          <button className="btn" onClick={()=>{saveInspection();setViewingRecord(null);setStep('receipt');}}>Save & Generate Report →</button>
          <button className="btn2" onClick={()=>setStep(hasSP50?'sp50':'l50')}>← Back</button>
        </div>}

        {/* ── RECEIPT ── */}
        {step==='receipt'&&<div className="content">
          <ReceiptPreview record={viewingRecord||currentRecord()}/>
          <button className="btn-pdf" disabled={pdfLoading} onClick={()=>handlePDF(viewingRecord||currentRecord())}>
            {pdfLoading?'Generating PDF...':'⬇ Download PDF'}
          </button>
          <button className="btn-email" onClick={()=>emailReport(viewingRecord||currentRecord())}>
            📧 Email This Report
          </button>
          <button className="btn2" onClick={()=>{setViewingRecord(null);setStep('home');}}>← Home</button>
          {!viewingRecord&&<button className="btn2" onClick={()=>setStep('summary')}>← Edit Summary</button>}
        </div>}

      </div>
    </>
  );
}
