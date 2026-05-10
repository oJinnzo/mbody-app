import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SOPTab from "./SOPTab.jsx";

const C = {
  bg:"#050a12", surface:"#0c1524", card:"#101d30", border:"#1a2e47",
  accent:"#4fc3f7", accentDim:"#0288d1", good:"#22c55e", monitor:"#f59e0b",
  attention:"#ef4444", text:"#e8f0fe", muted:"#5c7a99", white:"#ffffff",
};

const DEFAULT_INVENTORY = [
  {id:'p1', category:'Universal', name:'SSD', partNumber:'103080007', qty:2, lowStock:1},
  {id:'p2', category:'Universal', name:'Charging Brush Board Assembly', partNumber:'301100001', qty:5, lowStock:2},
  {id:'p3', category:'Universal', name:'ECU', partNumber:'301050004', qty:2, lowStock:1},
  {id:'p4', category:'Universal', name:'MCU', partNumber:'301050003', qty:2, lowStock:1},
  {id:'p5', category:'Universal', name:'IMU', partNumber:'301050006', qty:2, lowStock:1},
  {id:'p6', category:'Universal', name:'Manual Charging Cable', partNumber:'552910000', qty:5, lowStock:2},
  {id:'p7', category:'Universal', name:'50-Stroke Electric Push Rod', partNumber:'103170004', qty:2, lowStock:1},
  {id:'p8', category:'Universal', name:'Touch Screen', partNumber:'103080001', qty:1, lowStock:1},
  {id:'p9', category:'Universal', name:'Blinking Light', partNumber:'552920004', qty:5, lowStock:2},
  {id:'p10', category:'Universal', name:'ACU', partNumber:'103080000', qty:1, lowStock:1},
  {id:'p11', category:'Universal', name:'CCU', partNumber:'301050005', qty:2, lowStock:1},
  {id:'p12', category:'Universal', name:'3D LiDAR', partNumber:'103090003', qty:1, lowStock:1},
  {id:'p13', category:'Universal', name:'Battery', partNumber:'103010008', qty:1, lowStock:1},
  {id:'p14', category:'Universal', name:'Key Switch', partNumber:'552910026', qty:1, lowStock:1},
  {id:'p15', category:'Universal', name:'Emergency Stop Button', partNumber:'', qty:5, lowStock:2},
  {id:'p16', category:'SP50', name:'Drive Wheel - SP50', partNumber:'103170003', qty:2, lowStock:1},
  {id:'p17', category:'SP50', name:'SP50 Sweeping Mechanism Unit', partNumber:'301030050', qty:5, lowStock:2},
  {id:'p18', category:'SP50', name:'Limiter Wire Rope - SP50', partNumber:'251120015', qty:4, lowStock:2},
  {id:'p19', category:'SP50', name:'Side Brush Knob - SP50', partNumber:'102060059', qty:20, lowStock:5},
  {id:'p20', category:'SP50', name:'Coupling - SP50', partNumber:'102020004', qty:2, lowStock:1},
  {id:'p21', category:'SP50', name:'Vacuum Motor - SP50', partNumber:'103170008', qty:2, lowStock:1},
  {id:'p22', category:'SP50', name:'Manual Charging Adapter Cable - SP50', partNumber:'104100015', qty:5, lowStock:2},
  {id:'p23', category:'SP50', name:'Bumper Sensor - SP50', partNumber:'551315190', qty:3, lowStock:1},
  {id:'p24', category:'SP50', name:'Side Camera - SP50', partNumber:'', qty:4, lowStock:1},
  {id:'p25', category:'SP50', name:'Side Panel Only - SP50', partNumber:'', qty:4, lowStock:1},
  {id:'p26', category:'SP50', name:'Front Bumper Only - SP50', partNumber:'', qty:3, lowStock:1},
  {id:'p27', category:'SP50', name:'Top Cover Panel - SP50', partNumber:'', qty:4, lowStock:1},
  {id:'p28', category:'L50', name:'Solenoid Valve', partNumber:'103170011', qty:2, lowStock:1},
  {id:'p29', category:'L50', name:'L50 Dredger', partNumber:'102050115', qty:10, lowStock:3},
  {id:'p30', category:'L50', name:'L50 Manual Charging Dock', partNumber:'552910000', qty:4, lowStock:2},
  {id:'p31', category:'L50', name:'Front Linear Actuator - L50', partNumber:'103170016', qty:2, lowStock:1},
  {id:'p32', category:'L50', name:'Rear Linear Actuator - L50', partNumber:'103170004', qty:2, lowStock:1},
  {id:'p33', category:'L50', name:'Drain Pump N - L50', partNumber:'552920009', qty:3, lowStock:1},
  {id:'p34', category:'L50', name:'Drain Pump S - L50', partNumber:'552920014', qty:4, lowStock:1},
  {id:'p35', category:'L50', name:'Recovery Tank Filter - L50', partNumber:'252040050', qty:4, lowStock:2},
  {id:'p36', category:'L50', name:'L50 Wheel', partNumber:'103170009', qty:4, lowStock:2},
  {id:'p37', category:'L50', name:'Motor Controller - L50', partNumber:'103010006', qty:1, lowStock:1},
  {id:'p38', category:'L50', name:'Front Camera - L50', partNumber:'103130000', qty:1, lowStock:1},
  {id:'p39', category:'L50', name:'Depth Camera - L50', partNumber:'103130001', qty:1, lowStock:1},
  {id:'p40', category:'L50', name:'Side Camera - L50', partNumber:'103130002', qty:1, lowStock:1},
  {id:'p41', category:'L50', name:'Scrubber Motor - L50', partNumber:'103170010', qty:1, lowStock:1},
  {id:'p42', category:'L50', name:'Brush Motor - L50', partNumber:'103170015', qty:1, lowStock:1},
  {id:'p43', category:'L50', name:'Recovery Tank Float Sensor - L50', partNumber:'552040024', qty:1, lowStock:1},
  {id:'p44', category:'L50', name:'Solution Tank Float Sensor - L50', partNumber:'552040027', qty:1, lowStock:1},
  {id:'p45', category:'L50', name:'Solution Tank Filter - L50', partNumber:'102100020', qty:5, lowStock:2},
  {id:'p46', category:'L50', name:'Chain Sling for Lifting Squeegee', partNumber:'255020011', qty:4, lowStock:1},
  {id:'p47', category:'L50', name:'Solenoid Valve 2 - L50', partNumber:'552920010', qty:2, lowStock:1},
  {id:'p48', category:'L50', name:'Motorized Ball Valves - L50', partNumber:'552920011', qty:2, lowStock:1},
  {id:'p49', category:'L50', name:'Contactor - L50', partNumber:'103110001', qty:2, lowStock:1},
  {id:'p50', category:'L50', name:'Bumper Sensor - L50', partNumber:'301070001', qty:3, lowStock:1},
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};font-family:'Inter',sans-serif;color:${C.text};}
  .app{min-height:100vh;padding-bottom:90px;}
  .header{background:${C.bg};border-bottom:1px solid ${C.border};padding:14px 20px;position:sticky;top:0;z-index:100;}
  .header-inner{max-width:700px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;}
  .logo{display:flex;align-items:center;gap:10px;cursor:pointer;}
  .logo-mark{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,${C.accentDim},${C.accent});display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#000;flex-shrink:0;}
  .logo-text{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:${C.white};}
  .logo-text span{color:${C.accent};}
  .logo-sub{font-size:10px;color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;margin-top:1px;}
  .step-badge{background:${C.surface};border:1px solid ${C.border};color:${C.accent};font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;}
  .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:${C.surface};border-top:1px solid ${C.border};display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom);}
  .nav-btn{flex:1;padding:12px 6px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;border:none;background:transparent;color:${C.muted};transition:color .2s;position:relative;}
  .nav-btn.active{color:${C.accent};}
  .nav-icon{font-size:20px;line-height:1;}
  .nav-label{font-size:9px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;font-family:'Space Grotesk',sans-serif;}
  .nav-badge{position:absolute;top:6px;right:calc(50% - 22px);background:${C.attention};color:#fff;border-radius:10px;font-size:9px;font-weight:700;padding:1px 5px;min-width:16px;text-align:center;}
  .content{max-width:700px;margin:0 auto;padding:20px 16px;}
  .sec{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.accent};margin:26px 0 10px;display:flex;align-items:center;gap:8px;}
  .sec::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,${C.accent}50,transparent);}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:18px;margin-bottom:10px;}
  .fr{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
  .fl{display:flex;flex-direction:column;gap:5px;}
  .fl label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:${C.muted};}
  .fl input,.fl select{background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:10px 13px;border-radius:8px;font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;}
  .fl input:focus,.fl select:focus{border-color:${C.accent};}
  .fl select option{background:${C.surface};}
  .irow{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid ${C.border}25;gap:10px;}
  .irow:last-child{border-bottom:none;}
  .rlabel{flex:1;font-size:13px;color:${C.text};}
  .rg{display:flex;gap:5px;}
  .rb{display:flex;align-items:center;justify-content:center;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid ${C.border};background:transparent;color:${C.muted};transition:all .15s;user-select:none;min-width:36px;}
  .rb.g{background:${C.good}18;border-color:${C.good};color:${C.good};}
  .rb.m{background:${C.monitor}18;border-color:${C.monitor};color:${C.monitor};}
  .rb.a{background:${C.attention}18;border-color:${C.attention};color:${C.attention};}
  .ni{background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:7px 10px;border-radius:6px;font-size:12px;font-family:'Inter',sans-serif;outline:none;width:110px;flex-shrink:0;}
  .ni::placeholder{color:${C.muted};}
  .ni:focus{border-color:${C.accent};}
  .tabs{display:flex;gap:8px;margin-bottom:18px;}
  .tab{flex:1;padding:11px;text-align:center;border-radius:10px;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;cursor:pointer;border:2px solid ${C.border};background:transparent;color:${C.muted};transition:all .2s;}
  .tab.on{border-color:${C.accent};color:${C.accent};background:${C.accent}12;}
  .bg{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .bf{display:flex;flex-direction:column;gap:4px;}
  .bf label{font-size:10px;color:${C.muted};text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .bf input{background:${C.surface};border:1px solid ${C.border};color:${C.accent};padding:10px 13px;border-radius:8px;font-size:18px;font-family:'Space Grotesk',sans-serif;font-weight:700;outline:none;text-align:center;}
  textarea{background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:12px 13px;border-radius:8px;font-size:14px;font-family:'Inter',sans-serif;outline:none;width:100%;resize:vertical;min-height:80px;}
  textarea:focus{border-color:${C.accent};}
  .ss{display:flex;gap:8px;}
  .sb{flex:1;padding:10px;text-align:center;border-radius:8px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;cursor:pointer;border:2px solid ${C.border};background:transparent;color:${C.muted};transition:all .2s;}
  .sb.sg{border-color:${C.good};color:${C.good};background:${C.good}12;}
  .sb.sm{border-color:${C.monitor};color:${C.monitor};background:${C.monitor}12;}
  .sb.sa{border-color:${C.attention};color:${C.attention};background:${C.attention}12;}
  .sb.sn{border-color:${C.good};color:${C.good};background:${C.good}12;}
  .sb.sl{border-color:#84cc16;color:#84cc16;background:#84cc1612;}
  .sb.sme{border-color:${C.monitor};color:${C.monitor};background:${C.monitor}12;}
  .sb.sh{border-color:${C.attention};color:${C.attention};background:${C.attention}12;}
  .btn{width:100%;padding:15px;background:linear-gradient(135deg,${C.accent},${C.accentDim});border:none;border-radius:10px;color:#000;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:18px;}
  .btn:disabled{opacity:.35;cursor:not-allowed;}
  .btn2{width:100%;padding:12px;background:transparent;border:1.5px solid ${C.border};border-radius:10px;color:${C.muted};font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;}
  .btn2:hover{border-color:${C.accent}50;color:${C.accent};}
  .btn-pdf{width:100%;padding:15px;background:linear-gradient(135deg,${C.good},#16a34a);border:none;border-radius:10px;color:#000;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:10px;}
  .btn-pdf:disabled{opacity:.55;cursor:wait;}
  .btn-email{width:100%;padding:13px;background:transparent;border:1.5px solid #6366f1;border-radius:10px;color:#818cf8;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;}
  .modal-overlay{position:fixed;inset:0;background:#000c;z-index:200;display:flex;align-items:flex-end;justify-content:center;}
  .modal-box{background:${C.card};border:1px solid ${C.attention}60;border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:500px;}
  .modal-title{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:${C.attention};margin-bottom:6px;}
  .modal-sub{font-size:13px;color:${C.muted};margin-bottom:20px;line-height:1.5;}
  .modal-component{background:${C.surface};border:1px solid ${C.attention}40;border-radius:8px;padding:10px 14px;font-size:14px;color:${C.attention};font-weight:600;margin-bottom:16px;}
  .modal-btns{display:flex;gap:10px;}
  .modal-btn-yes{flex:1;padding:13px;background:linear-gradient(135deg,${C.attention},#b91c1c);border:none;border-radius:10px;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;cursor:pointer;}
  .modal-btn-no{flex:1;padding:13px;background:transparent;border:1.5px solid ${C.border};border-radius:10px;color:${C.muted};font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;cursor:pointer;}
  .parts-table{width:100%;border-collapse:collapse;margin-top:8px;}
  .parts-table th{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${C.muted};padding:6px 8px;text-align:left;border-bottom:1px solid ${C.border};}
  .parts-table td{padding:6px 4px;border-bottom:1px solid ${C.border}18;vertical-align:middle;}
  .parts-table select,.parts-table input{background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:7px 9px;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;outline:none;width:100%;}
  .parts-table input[type=number]{width:60px;text-align:center;}
  .add-part-btn{padding:7px 14px;background:transparent;border:1.5px solid ${C.border};border-radius:7px;color:${C.accent};font-size:12px;font-weight:600;cursor:pointer;margin-top:10px;font-family:'Space Grotesk',sans-serif;}
  .del-btn{padding:4px 8px;background:transparent;border:none;color:${C.attention};cursor:pointer;font-size:16px;}
  .stock-tag{font-size:11px;font-weight:700;padding:2px 7px;border-radius:12px;margin-left:6px;}
  .stock-low{background:${C.monitor}18;color:${C.monitor};}
  .stock-out{background:${C.attention}18;color:${C.attention};}
  .inv-filters{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
  .inv-filter{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid ${C.border};background:transparent;color:${C.muted};transition:all .2s;font-family:'Space Grotesk',sans-serif;}
  .inv-filter.on{border-color:${C.accent};color:${C.accent};background:${C.accent}12;}
  .inv-row{display:flex;align-items:center;padding:11px 0;border-bottom:1px solid ${C.border}20;gap:10px;}
  .inv-row:last-child{border-bottom:none;}
  .inv-name{flex:1;font-size:13px;}
  .inv-pn{font-size:11px;color:${C.muted};margin-top:2px;}
  .inv-qty{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${C.accent};min-width:36px;text-align:center;}
  .inv-qty.low{color:${C.monitor};}
  .inv-qty.out{color:${C.attention};}
  .qty-btns{display:flex;gap:6px;align-items:center;}
  .qty-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid ${C.border};background:transparent;color:${C.text};font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
  .qty-btn:hover{border-color:${C.accent};color:${C.accent};}
  .qty-btn.minus:hover{border-color:${C.attention};color:${C.attention};}
  .inv-search{width:100%;background:${C.surface};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:10px;font-size:14px;font-family:'Inter',sans-serif;outline:none;margin-bottom:12px;}
  .inv-search:focus{border-color:${C.accent};}
  .low-stock-banner{background:${C.monitor}15;border:1px solid ${C.monitor}40;border-radius:10px;padding:12px 16px;margin-bottom:14px;font-size:13px;color:${C.monitor};}
  .receipt-preview{background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:22px;}
  .rh{text-align:center;border-bottom:1px solid ${C.border};padding-bottom:16px;margin-bottom:16px;}
  .rlogo{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${C.white};}
  .rlogo span{color:${C.accent};}
  .rlogo-sub{font-size:10px;color:${C.muted};letter-spacing:2.5px;text-transform:uppercase;margin-top:3px;}
  .rmeta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
  .mi{display:flex;flex-direction:column;gap:2px;}
  .ml{font-size:9px;color:${C.muted};text-transform:uppercase;letter-spacing:1px;font-weight:600;}
  .mv{font-size:13px;font-weight:500;}
  .rstatus{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:10px;margin-bottom:16px;}
  .rsec{margin-bottom:14px;}
  .rsect{font-family:'Space Grotesk',sans-serif;font-size:10px;letter-spacing:2.5px;color:${C.accent};text-transform:uppercase;margin-bottom:6px;border-bottom:1px solid ${C.border};padding-bottom:4px;}
  .rrow{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid ${C.border}18;}
  .rrow:last-child{border-bottom:none;}
  .ri{font-size:13px;}
  .badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.5px;}
  .bp{background:${C.good}18;color:${C.good};}
  .bm{background:${C.monitor}18;color:${C.monitor};}
  .ba{background:${C.attention}18;color:${C.attention};}
  .bn{background:${C.border};color:${C.muted};}
  .sig{border-top:1px solid ${C.border};padding-top:12px;margin-top:16px;display:flex;justify-content:space-between;font-size:11px;color:${C.muted};}
  .hcard{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:16px;margin-bottom:10px;transition:border-color .2s;}
  .hcard.sr-card{border-left:3px solid ${C.attention};}
  .hcard-top{display:flex;justify-content:space-between;align-items:flex-start;}
  .hcard-prop{font-weight:600;font-size:15px;}
  .hcard-date{font-size:11px;color:${C.muted};margin-top:2px;}
  .hcard-meta{display:flex;gap:10px;margin-top:6px;font-size:12px;color:${C.muted};flex-wrap:wrap;}
  .hcard-actions{display:flex;gap:8px;margin-top:12px;}
  .hbtn{flex:1;padding:9px;text-align:center;border-radius:7px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:.5px;cursor:pointer;border:1.5px solid ${C.border};background:transparent;color:${C.muted};transition:all .2s;}
  .hbtn:hover{border-color:${C.accent}50;color:${C.accent};}
  .empty{text-align:center;padding:48px 20px;color:${C.muted};}
  .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);font-weight:700;padding:12px 24px;border-radius:30px;font-size:13px;z-index:999;white-space:nowrap;}
  .toast.ok{background:${C.good};color:#000;}
  .toast.err{background:${C.attention};color:#fff;}
  .toast.warn{background:${C.monitor};color:#000;}
  .field-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:${C.muted};margin-bottom:8px;display:block;}
  .linked-badge{background:${C.accent}18;border:1px solid ${C.accent}40;border-radius:6px;padding:4px 10px;font-size:11px;color:${C.accent};display:inline-block;margin-bottom:12px;}
`;

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
const initSR=()=>({date:new Date().toISOString().split('T')[0],technician:'',property:'',machineName:'',serial:'',unit:'',issueReported:'',workPerformed:'',parts:[],startTime:'',finishTime:'',totalDowntime:'',testingVerification:'',additionalNotes:'',linkedComponent:'',linkedInspectionId:''});

const getColor=v=>{if(!v)return'bn';if(['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(v))return'bp';if(['M','Dirty','Weak','Loose','Updated','Partial'].includes(v))return'bm';return'ba';};

const INSP_KEY='mbody_inspections';
const SR_KEY='mbody_service_reports';
const INV_KEY='mbody_inventory';
const SOP_KEY='mbody_sop_properties';
const loadLS=key=>{try{const r=localStorage.getItem(key);return r?JSON.parse(r):null;}catch{return null;}};
const saveLS=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));}catch{}};

function exportInspectionPDF(record){
  const{info:ri,summary:rs,sp50:rsp,l50:rl,techNotes:rn}=record;
  const doc=new jsPDF({unit:'mm',format:'a4'});const W=doc.internal.pageSize.getWidth();let y=15;
  const sRGB=rs.status==='Good'?[34,197,94]:rs.status==='Monitor'?[245,158,11]:[239,68,68];
  doc.setFillColor(5,10,18);doc.rect(0,0,W,30,'F');doc.setFillColor(79,195,247);doc.rect(0,28,W,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(255,255,255);doc.text('MBody',14,18);doc.setTextColor(79,195,247);doc.text(' AI',14+doc.getTextWidth('MBody'),18);
  doc.setFontSize(8);doc.setTextColor(92,122,153);doc.text('SERVICE INSPECTION REPORT',14,24);doc.text(ri.date||'',W-14,18,{align:'right'});y=38;
  doc.autoTable({startY:y,head:[],body:[['Property',ri.property||'—','Date',ri.date||'—'],['Technician',ri.technician||'—','Next Visit',ri.nextVisit||'—'],['Machine',ri.model?.join(' + ')||'—','Serial #',ri.serial||'—'],['Firmware',ri.firmware||'—','Visit Type','Scheduled']],theme:'plain',styles:{fontSize:9,cellPadding:2,textColor:[30,50,70]},columnStyles:{0:{fontStyle:'bold',cellWidth:28,textColor:[92,122,153]},1:{cellWidth:62},2:{fontStyle:'bold',cellWidth:28,textColor:[92,122,153]},3:{cellWidth:62}}});
  y=doc.lastAutoTable.finalY+6;
  if(rs.status){doc.setFillColor(...sRGB);doc.roundedRect(14,y,W-28,14,3,3,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(`STATUS: ${rs.status}`,20,y+9);doc.text(`RISK: ${rs.risk||'—'}`,W-55,y+9);y+=20;}
  if(rs.action){doc.setFillColor(254,226,226);doc.roundedRect(14,y,W-28,10,2,2,'F');doc.setTextColor(185,28,28);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(`ACTION REQUIRED: ${rs.action}`,18,y+6.5);y+=16;}
  const addSec=(title,rows)=>{if(y>248){doc.addPage();y=15;}doc.autoTable({startY:y,head:[[{content:title,colSpan:3,styles:{fillColor:[10,21,36],textColor:[79,195,247],fontStyle:'bold',fontSize:9}}]],body:rows.map(([l,v])=>[l,v?.val||'—',v?.note||'']),theme:'striped',styles:{fontSize:9,cellPadding:2.5},columnStyles:{0:{cellWidth:80,textColor:[40,60,80]},1:{cellWidth:30,fontStyle:'bold'},2:{cellWidth:60,textColor:[92,122,153],fontSize:8}},didParseCell:(d)=>{if(d.column.index===1&&d.section==='body'){const v=d.cell.raw;if(['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(v))d.cell.styles.textColor=[22,163,74];else if(['M','Dirty','Weak','Loose','Updated','Partial'].includes(v))d.cell.styles.textColor=[217,119,6];else if(v&&v!=='—')d.cell.styles.textColor=[220,38,38];}}});y=doc.lastAutoTable.finalY+4;};
  if(rsp){addSec('SP50 — Filtration & Cleaning',[['Filter Bag',rsp.filterBag],['HEPA Filter',rsp.hepaFilter],['Roller Brush',rsp.rollerBrush],['Trash Tray',rsp.trashTray],['Tray Filter',rsp.trayFilter]]);addSec('SP50 — Mechanical / Electrical',[['Chassis',rsp.chassis],['Under Machine',rsp.underMachine],['Body',rsp.body],['Movement',rsp.manualMove],['Charging',rsp.chargingSys],['Charge Port',rsp.chargePort],['Camera/Lidar',rsp.camera],['Lights',rsp.lights],['Firmware',rsp.firmware]]);addSec('SP50 — Diagnostics',[['4G',rsp.g4g],['IMU',rsp.imu],['RB Lift',rsp.rollerLift],['RB RPM',rsp.rbRpm],['Vac Motor',rsp.vacMotor],['Side Brush',rsp.sideBrush],['Baffle Freq',rsp.baffleFreq]]);}
  if(rl){addSec('L50 — Fluid & Recovery',[['Recovery Tank',rl.recoveryTank],['Drain Filter',rl.drainFilter],['Squeegee',rl.squeegee],['Vac Hose',rl.vacHose]]);addSec('L50 — Pads & Automation',[['Filter Bag',rl.filterBag],['Mag Pad Holders',rl.magPad],['Fresh Sensor',rl.freshSensor],['Auto Drain',rl.autoDrain],['Auto Fill',rl.autoFill]]);addSec('L50 — Mechanical / Electrical',[['Chassis',rl.chassis],['Under Machine',rl.underMachine],['Body',rl.body],['Movement',rl.manualMove],['Charging',rl.chargingSys],['Charge Port',rl.chargePort],['Camera/Lidar',rl.camera],['Lights',rl.lights],['Firmware',rl.firmware]]);}
  if(rn){if(y>240){doc.addPage();y=15;}doc.setFillColor(10,21,36);doc.roundedRect(14,y,W-28,8,2,2,'F');doc.setTextColor(79,195,247);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('TECHNICIAN NOTES',18,y+5.5);y+=11;doc.setTextColor(40,60,80);doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(rn,W-28);doc.text(lines,14,y);y+=lines.length*5+6;}
  doc.save(`mbody-inspection-${(ri.property||'report').replace(/\s+/g,'-').toLowerCase()}-${ri.date||'report'}.pdf`);
}

function exportServicePDF(sr){
  const doc=new jsPDF({unit:'mm',format:'a4'});const W=doc.internal.pageSize.getWidth();let y=15;
  doc.setFillColor(5,10,18);doc.rect(0,0,W,30,'F');doc.setFillColor(239,68,68);doc.rect(0,28,W,2,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(255,255,255);doc.text('MBody',14,18);doc.setTextColor(79,195,247);doc.text(' AI',14+doc.getTextWidth('MBody'),18);
  doc.setFontSize(8);doc.setTextColor(239,68,68);doc.text('MACHINE SERVICE & REPAIR REPORT',14,24);doc.setTextColor(92,122,153);doc.text(sr.date||'',W-14,18,{align:'right'});y=38;
  doc.autoTable({startY:y,head:[],body:[['Date',sr.date||'—','Technician',sr.technician||'—'],['Property',sr.property||'—','Unit',sr.unit||'—'],['Machine',sr.machineName||'—','Serial #',sr.serial||'—']],theme:'plain',styles:{fontSize:9,cellPadding:2.5,textColor:[30,50,70]},columnStyles:{0:{fontStyle:'bold',cellWidth:35,textColor:[92,122,153]},1:{cellWidth:55},2:{fontStyle:'bold',cellWidth:35,textColor:[92,122,153]},3:{cellWidth:55}}});
  y=doc.lastAutoTable.finalY+6;
  if(sr.linkedComponent){doc.setFillColor(20,30,50);doc.roundedRect(14,y,W-28,10,2,2,'F');doc.setTextColor(79,195,247);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(`Flagged: ${sr.linkedComponent}`,18,y+6.5);y+=16;}
  const tb=(label,text)=>{if(!text)return;if(y>255){doc.addPage();y=15;}doc.setFillColor(10,21,36);doc.roundedRect(14,y,W-28,8,2,2,'F');doc.setTextColor(79,195,247);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(label,18,y+5.5);y+=11;doc.setTextColor(40,60,80);doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(text,W-28);doc.text(lines,14,y);y+=lines.length*5+6;};
  tb('ISSUE REPORTED',sr.issueReported);tb('WORK PERFORMED',sr.workPerformed);
  if(sr.parts?.length){if(y>230){doc.addPage();y=15;}doc.autoTable({startY:y,head:[[{content:'PARTS REPLACED',colSpan:3,styles:{fillColor:[10,21,36],textColor:[79,195,247],fontStyle:'bold',fontSize:9}}],['Part','P/N','Qty']],body:sr.parts.map(p=>[p.name||'—',p.partNumber||'—',p.qty||'—']),theme:'striped',styles:{fontSize:9,cellPadding:2.5}});y=doc.lastAutoTable.finalY+6;}
  tb('TESTING / VERIFICATION',sr.testingVerification);tb('NOTES',sr.additionalNotes);
  doc.save(`mbody-service-${(sr.property||'report').replace(/\s+/g,'-').toLowerCase()}-${sr.date||'report'}.pdf`);
}

function emailSR(sr){let b=`MBODY AI — SERVICE REPORT\nProperty: ${sr.property||'—'}\nTech: ${sr.technician||'—'}\nDate: ${sr.date||'—'}\nMachine: ${sr.machineName||'—'}\nS/N: ${sr.serial||'—'}\n\n`;if(sr.linkedComponent)b+=`Flagged: ${sr.linkedComponent}\n\n`;if(sr.issueReported)b+=`Issue:\n${sr.issueReported}\n\n`;if(sr.workPerformed)b+=`Work:\n${sr.workPerformed}\n\n`;if(sr.parts?.length){b+='Parts:\n';sr.parts.forEach(p=>{b+=`- ${p.name} x${p.qty}\n`;});}window.location.href=`mailto:?subject=${encodeURIComponent('MBody AI Service Report - '+(sr.property||'')+' '+(sr.date||''))}&body=${encodeURIComponent(b)}`;}

const RadioGroup=({options,value,onChange})=>(<div className="rg">{options.map(opt=>{const sel=value===opt.value;let cls='';if(sel)cls=['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(opt.value)?'g':['M','Dirty','Weak','Loose','Updated','Partial'].includes(opt.value)?'m':'a';return<div key={opt.value} className={`rb ${sel?cls:''}`} onClick={()=>onChange(opt.value)}>{opt.label}</div>;})}</div>);
const IRow=({label,options,field,value,onChange,onAttention})=>{const[note,setNote]=useState(value.note||'');useEffect(()=>setNote(value.note||''),[value.note]);const handleChange=v=>{onChange(field,{...value,val:v});if(v==='A'&&onAttention)onAttention(label);};return(<div className="irow"><div className="rlabel">{label}</div><RadioGroup options={options} value={value.val} onChange={handleChange}/><input className="ni" placeholder="notes..." value={note} onChange={e=>{setNote(e.target.value);onChange(field,{...value,note:e.target.value});}}/></div>);};
const RBadge=({val})=><span className={`badge ${getColor(val)}`}>{val||'—'}</span>;
const Section=({title,rows})=>(<div className="rsec"><div className="rsect">{title}</div>{rows.map(([l,v])=>(<div className="rrow" key={l}><div className="ri">{l}{v?.note?<span style={{color:C.muted,fontSize:11,marginLeft:6}}>— {v.note}</span>:''}</div><RBadge val={v?.val}/></div>))}</div>);
const Logo=({onClick})=>(<div onClick={onClick} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:10}}><div className="logo-mark">MB</div><div><div className="logo-text">MBody <span>AI</span></div><div className="logo-sub">Service Inspection</div></div></div>);

const InspPreview=({record})=>{const{info:ri,summary:rs,sp50:rsp,l50:rl,techNotes:rn}=record;const sc=rs.status==='Good'?C.good:rs.status==='Monitor'?C.monitor:C.attention;return(<div className="receipt-preview"><div className="rh"><div className="rlogo">MBody <span>AI</span></div><div className="rlogo-sub">Service Inspection Report</div></div><div className="rmeta">{[['Property',ri.property],['Technician',ri.technician],['Date',ri.date],['Next Visit',ri.nextVisit],['Machine',ri.model?.join(' + ')],['Serial #',ri.serial]].map(([l,v])=><div className="mi" key={l}><div className="ml">{l}</div><div className="mv">{v||'—'}</div></div>)}</div>{rs.status&&<div className="rstatus" style={{background:sc+'18',border:`1px solid ${sc}40`}}><div><div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:1.5}}>Status</div><div style={{fontSize:20,fontFamily:'Space Grotesk',fontWeight:700,color:sc}}>{rs.status}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:1.5}}>Risk</div><div style={{fontSize:20,fontFamily:'Space Grotesk',fontWeight:700,color:sc}}>{rs.risk||'—'}</div></div></div>}{rs.action&&<div style={{background:C.attention+'15',border:`1px solid ${C.attention}40`,borderRadius:8,padding:'10px 13px',marginBottom:14,fontSize:13,color:C.attention}}><strong>Action Required:</strong> {rs.action}</div>}{rsp&&<><Section title="SP50 — Filtration & Cleaning" rows={[['Filter Bag',rsp.filterBag],['HEPA Filter',rsp.hepaFilter],['Roller Brush',rsp.rollerBrush],['Trash Tray',rsp.trashTray],['Tray Filter',rsp.trayFilter]]}/><Section title="SP50 — Mechanical / Electrical" rows={[['Chassis',rsp.chassis],['Under Machine',rsp.underMachine],['Body',rsp.body],['Movement',rsp.manualMove],['Charging',rsp.chargingSys],['Charge Port',rsp.chargePort],['Camera/Lidar',rsp.camera],['Lights',rsp.lights],['Firmware',rsp.firmware]]}/><Section title="SP50 — Diagnostics" rows={[['4G',rsp.g4g],['IMU',rsp.imu],['RB Lift',rsp.rollerLift],['RB RPM',rsp.rbRpm],['Vac Motor',rsp.vacMotor],['Side Brush',rsp.sideBrush],['Baffle Freq',rsp.baffleFreq]]}/></>}{rl&&<><Section title="L50 — Fluid & Recovery" rows={[['Recovery Tank',rl.recoveryTank],['Drain Filter',rl.drainFilter],['Squeegee',rl.squeegee],['Vac Hose',rl.vacHose]]}/><Section title="L50 — Pads & Automation" rows={[['Filter Bag',rl.filterBag],['Mag Pad Holders',rl.magPad],['Fresh Sensor',rl.freshSensor],['Auto Drain',rl.autoDrain],['Auto Fill',rl.autoFill]]}/><Section title="L50 — Mechanical / Electrical" rows={[['Chassis',rl.chassis],['Under Machine',rl.underMachine],['Body',rl.body],['Movement',rl.manualMove],['Charging',rl.chargingSys],['Charge Port',rl.chargePort],['Camera/Lidar',rl.camera],['Lights',rl.lights],['Firmware',rl.firmware]]}/></>}{rn&&<div className="rsec"><div className="rsect">Tech Notes</div><div style={{fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{rn}</div></div>}<div className="sig"><span>Tech: {ri.technician||'_______'}</span><span>Client: _______</span></div></div>);};

const SRPreview=({sr})=>(<div className="receipt-preview"><div className="rh"><div className="rlogo">MBody <span>AI</span></div><div className="rlogo-sub" style={{color:C.attention}}>Machine Service & Repair Report</div></div><div className="rmeta">{[['Date',sr.date],['Technician',sr.technician],['Property',sr.property],['Unit',sr.unit],['Machine',sr.machineName],['Serial #',sr.serial]].map(([l,v])=><div className="mi" key={l}><div className="ml">{l}</div><div className="mv">{v||'—'}</div></div>)}</div>{sr.linkedComponent&&<div className="linked-badge">🔗 Flagged: {sr.linkedComponent}</div>}{sr.issueReported&&<div className="rsec"><div className="rsect">Issue Reported</div><div style={{fontSize:13,lineHeight:1.6}}>{sr.issueReported}</div></div>}{sr.workPerformed&&<div className="rsec"><div className="rsect">Work Performed</div><div style={{fontSize:13,lineHeight:1.6}}>{sr.workPerformed}</div></div>}{sr.parts?.length>0&&<div className="rsec"><div className="rsect">Parts Replaced</div>{sr.parts.map((p,i)=><div className="rrow" key={i}><div className="ri">{p.name||'—'}</div><span style={{fontSize:12,color:C.accent,fontWeight:700}}>×{p.qty||1}</span></div>)}</div>}{sr.testingVerification&&<div className="rsec"><div className="rsect">Testing</div><div style={{fontSize:13,lineHeight:1.6}}>{sr.testingVerification}</div></div>}{sr.additionalNotes&&<div className="rsec"><div className="rsect">Notes</div><div style={{fontSize:13,lineHeight:1.6}}>{sr.additionalNotes}</div></div>}<div className="sig"><span>Tech: {sr.technician||'_______'}</span><span>Customer: _______</span></div></div>);

export default function App(){
  const[tab,setTab]=useState('inspections');
  const[step,setStep]=useState('home');
  const[inspHistory,setInspHistory]=useState(()=>loadLS(INSP_KEY)||[]);
  const[srHistory,setSRHistory]=useState(()=>loadLS(SR_KEY)||[]);
  const[inventory,setInventory]=useState(()=>loadLS(INV_KEY)||DEFAULT_INVENTORY);
  const[sopProperties,setSopProperties]=useState(()=>loadLS(SOP_KEY)||[]);
  const[toast,setToast]=useState(null);
  const[pdfLoading,setPdfLoading]=useState(false);
  const[viewingInsp,setViewingInsp]=useState(null);
  const[viewingSR,setViewingSR]=useState(null);
  const[invFilter,setInvFilter]=useState('All');
  const[invSearch,setInvSearch]=useState('');
  const[showAddPart,setShowAddPart]=useState(false);
  const[newPart,setNewPart]=useState({name:'',partNumber:'',category:'Universal',qty:'1',lowStock:'1'});
  const[info,setInfo]=useState({property:'',technician:'',date:new Date().toISOString().split('T')[0],nextVisit:'',model:[],serial:'',firmware:''});
  const[summary,setSummary]=useState({status:'',risk:'',action:''});
  const[sp50,setSp50]=useState(initSP50());
  const[l50,setL50]=useState(initL50());
  const[techNotes,setTechNotes]=useState('');
  const[sr,setSR]=useState(initSR());
  const[showAPrompt,setShowAPrompt]=useState(false);
  const[promptComponent,setPromptComponent]=useState('');
  const[currentInspId,setCurrentInspId]=useState(null);

  const hasSP50=info.model.includes('SP50');const hasL50=info.model.includes('L50');
  const toggleModel=m=>setInfo(p=>({...p,model:p.model.includes(m)?p.model.filter(x=>x!==m):[...p.model,m]}));
  const sp50set=(f,v)=>setSp50(p=>({...p,[f]:v}));const l50set=(f,v)=>setL50(p=>({...p,[f]:v}));
  const showToast=(msg,type='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const saveInv=(u)=>{setInventory(u);saveLS(INV_KEY,u);};
  const adjustQty=(id,d)=>{const u=inventory.map(p=>p.id===id?{...p,qty:Math.max(0,p.qty+d)}:p);saveInv(u);};
  const resetInsp=()=>{setInfo({property:'',technician:'',date:new Date().toISOString().split('T')[0],nextVisit:'',model:[],serial:'',firmware:''});setSummary({status:'',risk:'',action:''});setSp50(initSP50());setL50(initL50());setTechNotes('');setViewingInsp(null);setCurrentInspId(null);};
  const saveInspection=()=>{const id='insp_'+Date.now();const r={id,savedAt:new Date().toISOString(),info,summary,sp50:hasSP50?sp50:null,l50:hasL50?l50:null,techNotes};const u=[r,...inspHistory];setInspHistory(u);saveLS(INSP_KEY,u);setCurrentInspId(id);showToast('✓ Inspection Saved');return r;};
  const saveSR=(data)=>{if(data.parts?.length>0){let inv=[...inventory];data.parts.forEach(p=>{if(p.inventoryId){const idx=inv.findIndex(x=>x.id===p.inventoryId);if(idx>=0){inv[idx]={...inv[idx],qty:Math.max(0,inv[idx].qty-parseInt(p.qty||1))};}}});saveInv(inv);}const id='sr_'+Date.now();const r={...data,id,savedAt:new Date().toISOString()};const u=[r,...srHistory];setSRHistory(u);saveLS(SR_KEY,u);showToast('✓ Service Report Saved');return r;};
  const deleteInsp=(id,e)=>{e.stopPropagation();if(!confirm('Delete?'))return;const u=inspHistory.filter(x=>x.id!==id);setInspHistory(u);saveLS(INSP_KEY,u);};
  const deleteSR=(id,e)=>{e.stopPropagation();if(!confirm('Delete?'))return;const u=srHistory.filter(x=>x.id!==id);setSRHistory(u);saveLS(SR_KEY,u);};
  const handleAttention=(label)=>{setPromptComponent(label);setShowAPrompt(true);};
  const handleStartSR=()=>{setShowAPrompt(false);setSR({...initSR(),date:info.date||new Date().toISOString().split('T')[0],technician:info.technician||'',property:info.property||'',machineName:info.model?.join(' + ')||'',serial:info.serial||'',linkedComponent:promptComponent,linkedInspectionId:currentInspId||''});setTab('service');setStep('sr_form');};
  const currentRecord=()=>({id:'live',savedAt:new Date().toISOString(),info,summary,sp50:hasSP50?sp50:null,l50:hasL50?l50:null,techNotes});
  const handleInspPDF=async(r)=>{setPdfLoading(true);try{exportInspectionPDF(r);}catch{showToast('PDF failed','err');}setTimeout(()=>setPdfLoading(false),1500);};
  const handleSRPDF=async(r)=>{setPdfLoading(true);try{exportServicePDF(r);}catch{showToast('PDF failed','err');}setTimeout(()=>setPdfLoading(false),1500);};
  const navTo=(t)=>{setTab(t);setStep('home');};
  const lowStockCount=inventory.filter(p=>p.qty<=p.lowStock).length;
  const outOfStockCount=inventory.filter(p=>p.qty===0).length;
  const filteredInv=inventory.filter(p=>{const mc=invFilter==='All'||p.category===invFilter||(invFilter==='Low Stock'&&p.qty<=p.lowStock);const ms=!invSearch||p.name.toLowerCase().includes(invSearch.toLowerCase())||p.partNumber.includes(invSearch);return mc&&ms;});

  const stepLabel=()=>{if(tab==='service'){if(step==='sr_form')return'NEW REPORT';if(step==='sr_receipt')return'REPORT';return'SERVICE';}if(tab==='inventory')return'INVENTORY';if(tab==='sop')return'SOP';const m={home:'HOME',intake:'SETUP',sp50:'SP50',l50:'L50',summary:'SUMMARY',receipt:'REPORT'};return m[step]||'';};

  return(<>
    <style>{css}</style>
    <div className="app">
      <div className="header"><div className="header-inner"><Logo onClick={()=>{resetInsp();setSR(initSR());setStep('home');}}/><div className="step-badge">{stepLabel()}</div></div></div>
      {toast&&<div className={`toast ${toast.type}`}>{toast.msg}</div>}
      {showAPrompt&&(<div className="modal-overlay" onClick={()=>setShowAPrompt(false)}><div className="modal-box" onClick={e=>e.stopPropagation()}><div className="modal-title">⚠ Attention Flagged</div><div className="modal-sub">Do you want to file a Service & Repair Report?</div><div className="modal-component">🔧 {promptComponent}</div><div className="modal-btns"><button className="modal-btn-yes" onClick={handleStartSR}>Yes, File Report</button><button className="modal-btn-no" onClick={()=>setShowAPrompt(false)}>Skip for Now</button></div></div></div>)}

      {tab==='inspections'&&<>
        {step==='home'&&<div className="content"><button className="btn" style={{marginTop:0}} onClick={()=>{resetInsp();setStep('intake');}}>+ New Inspection</button><div className="sec">Saved ({inspHistory.length})</div>{inspHistory.length===0?<div className="empty"><div style={{fontSize:36,marginBottom:10}}>📋</div><div style={{fontWeight:600}}>No inspections yet</div></div>:inspHistory.map(rec=>(<div className="hcard" key={rec.id}><div className="hcard-top"><div><div className="hcard-prop">{rec.info.property||'Unnamed'}</div><div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString()}</div></div>{rec.summary.status&&<span className={`badge ${getColor(rec.summary.status==='Good'?'Pass':rec.summary.status==='Monitor'?'M':'Fail')}`}>{rec.summary.status}</span>}</div><div className="hcard-meta"><span>🤖 {rec.info.model?.join(' + ')||'—'}</span><span>S/N: {rec.info.serial||'—'}</span></div><div className="hcard-actions"><div className="hbtn" onClick={()=>{setViewingInsp(rec);setStep('receipt');}}>View</div><div className="hbtn" onClick={()=>handleInspPDF(rec)}>⬇ PDF</div><div className="hbtn" onClick={e=>deleteInsp(rec.id,e)}>Delete</div></div></div>))}</div>}
        {step==='intake'&&<div className="content"><div className="sec">Visit Info</div><div className="card"><div className="fr"><div className="fl"><label>Property</label><input value={info.property} onChange={e=>setInfo(p=>({...p,property:e.target.value}))}/></div><div className="fl"><label>Technician</label><input value={info.technician} onChange={e=>setInfo(p=>({...p,technician:e.target.value}))}/></div></div><div className="fr"><div className="fl"><label>Date</label><input type="date" value={info.date} onChange={e=>setInfo(p=>({...p,date:e.target.value}))}/></div><div className="fl"><label>Next Visit</label><input type="date" value={info.nextVisit} onChange={e=>setInfo(p=>({...p,nextVisit:e.target.value}))}/></div></div><div className="fr"><div className="fl"><label>Serial</label><input value={info.serial} onChange={e=>setInfo(p=>({...p,serial:e.target.value}))}/></div><div className="fl"><label>Firmware</label><input value={info.firmware} onChange={e=>setInfo(p=>({...p,firmware:e.target.value}))}/></div></div></div><div className="sec">Machine</div><div className="card"><div className="tabs"><div className={`tab ${info.model.includes('SP50')?'on':''}`} onClick={()=>toggleModel('SP50')}>SP50</div><div className={`tab ${info.model.includes('L50')?'on':''}`} onClick={()=>toggleModel('L50')}>L50</div></div></div><button className="btn" disabled={info.model.length===0} onClick={()=>setStep(hasSP50?'sp50':'l50')}>Begin →</button><button className="btn2" onClick={()=>setStep('home')}>← Back</button></div>}
        {step==='sp50'&&<div className="content">{hasSP50&&hasL50&&<div className="tabs"><div className="tab on">SP50</div><div className="tab" onClick={()=>setStep('l50')}>L50</div></div>}<div className="sec">Filtration & Cleaning</div><div className="card"><IRow label="Filter Bag" options={GMA} field="filterBag" value={sp50.filterBag} onChange={sp50set} onAttention={handleAttention}/><IRow label="HEPA Filter" options={GMA} field="hepaFilter" value={sp50.hepaFilter} onChange={sp50set} onAttention={handleAttention}/><IRow label="Roller Brush" options={GMA} field="rollerBrush" value={sp50.rollerBrush} onChange={sp50set} onAttention={handleAttention}/><IRow label="Trash Tray" options={GMA} field="trashTray" value={sp50.trashTray} onChange={sp50set} onAttention={handleAttention}/><IRow label="Tray Filter" options={GMA} field="trayFilter" value={sp50.trayFilter} onChange={sp50set} onAttention={handleAttention}/></div><div className="sec">Mechanical</div><div className="card"><IRow label="Chassis" options={GMA} field="chassis" value={sp50.chassis} onChange={sp50set} onAttention={handleAttention}/><IRow label="Under Machine" options={CDmg} field="underMachine" value={sp50.underMachine} onChange={sp50set} onAttention={handleAttention}/><IRow label="Body" options={Body} field="body" value={sp50.body} onChange={sp50set} onAttention={handleAttention}/><IRow label="Manual Movement" options={MovOpts} field="manualMove" value={sp50.manualMove} onChange={sp50set} onAttention={handleAttention}/><IRow label="Charging System" options={PF} field="chargingSys" value={sp50.chargingSys} onChange={sp50set} onAttention={handleAttention}/><IRow label="Charge Port" options={PF} field="chargePort" value={sp50.chargePort} onChange={sp50set} onAttention={handleAttention}/><IRow label="Camera/Lidar" options={CamOpts} field="camera" value={sp50.camera} onChange={sp50set} onAttention={handleAttention}/><IRow label="Lights" options={WPF} field="lights" value={sp50.lights} onChange={sp50set} onAttention={handleAttention}/><IRow label="Firmware" options={OKUF} field="firmware" value={sp50.firmware} onChange={sp50set} onAttention={handleAttention}/></div><div className="sec">Diagnostics</div><div className="card"><IRow label="4G" options={GMA} field="g4g" value={sp50.g4g} onChange={sp50set} onAttention={handleAttention}/><IRow label="IMU" options={GMA} field="imu" value={sp50.imu} onChange={sp50set} onAttention={handleAttention}/><IRow label="RB Lift" options={GMA} field="rollerLift" value={sp50.rollerLift} onChange={sp50set} onAttention={handleAttention}/><IRow label="RB RPM" options={GMA} field="rbRpm" value={sp50.rbRpm} onChange={sp50set} onAttention={handleAttention}/><IRow label="Vac Motor" options={GMA} field="vacMotor" value={sp50.vacMotor} onChange={sp50set} onAttention={handleAttention}/><IRow label="Side Brush" options={GMA} field="sideBrush" value={sp50.sideBrush} onChange={sp50set} onAttention={handleAttention}/><IRow label="Baffle Freq" options={GMA} field="baffleFreq" value={sp50.baffleFreq} onChange={sp50set} onAttention={handleAttention}/></div><div className="sec">Battery</div><div className="card"><div className="bg">{[['Health %','battHealth'],['Voltage V','battVoltage'],['Current A','battCurrent'],['Left Motor','leftMotor'],['Right Motor','rightMotor']].map(([lbl,key])=>(<div className="bf" key={key}><label>{lbl}</label><input type="number" placeholder="—" value={sp50[key]} onChange={e=>setSp50(p=>({...p,[key]:e.target.value}))}/></div>))}</div></div>{hasL50?<button className="btn" onClick={()=>setStep('l50')}>→ L50</button>:<button className="btn" onClick={()=>setStep('summary')}>Review →</button>}</div>}
        {step==='l50'&&<div className="content">{hasSP50&&hasL50&&<div className="tabs"><div className="tab" onClick={()=>setStep('sp50')}>SP50</div><div className="tab on">L50</div></div>}<div className="sec">Fluid & Recovery</div><div className="card"><IRow label="Recovery Tank" options={RLeak} field="recoveryTank" value={l50.recoveryTank} onChange={l50set} onAttention={handleAttention}/><IRow label="Drain Filter" options={DrainOpts} field="drainFilter" value={l50.drainFilter} onChange={l50set} onAttention={handleAttention}/><IRow label="Squeegee" options={SqOpts} field="squeegee" value={l50.squeegee} onChange={l50set} onAttention={handleAttention}/><IRow label="Vac Hose" options={VacOpts} field="vacHose" value={l50.vacHose} onChange={l50set} onAttention={handleAttention}/></div><div className="sec">Pads & Automation</div><div className="card"><IRow label="Filter Bag" options={GMA} field="filterBag" value={l50.filterBag} onChange={l50set} onAttention={handleAttention}/><IRow label="Mag Pad Holders" options={MagOpts} field="magPad" value={l50.magPad} onChange={l50set} onAttention={handleAttention}/><IRow label="Fresh Water Sensor" options={SensorOpts} field="freshSensor" value={l50.freshSensor} onChange={l50set} onAttention={handleAttention}/><IRow label="Auto Drain" options={WF} field="autoDrain" value={l50.autoDrain} onChange={l50set} onAttention={handleAttention}/><IRow label="Auto Fill" options={WF} field="autoFill" value={l50.autoFill} onChange={l50set} onAttention={handleAttention}/></div><div className="sec">Mechanical</div><div className="card"><IRow label="Chassis" options={GMA} field="chassis" value={l50.chassis} onChange={l50set} onAttention={handleAttention}/><IRow label="Under Machine" options={CDmg} field="underMachine" value={l50.underMachine} onChange={l50set} onAttention={handleAttention}/><IRow label="Body" options={Body} field="body" value={l50.body} onChange={l50set} onAttention={handleAttention}/><IRow label="Movement" options={MovOpts} field="manualMove" value={l50.manualMove} onChange={l50set} onAttention={handleAttention}/><IRow label="Charging" options={PF} field="chargingSys" value={l50.chargingSys} onChange={l50set} onAttention={handleAttention}/><IRow label="Charge Port" options={PF} field="chargePort" value={l50.chargePort} onChange={l50set} onAttention={handleAttention}/><IRow label="Camera/Lidar" options={CamOpts} field="camera" value={l50.camera} onChange={l50set} onAttention={handleAttention}/><IRow label="Lights" options={WPF} field="lights" value={l50.lights} onChange={l50set} onAttention={handleAttention}/><IRow label="Firmware" options={OKUF} field="firmware" value={l50.firmware} onChange={l50set} onAttention={handleAttention}/></div><button className="btn" onClick={()=>setStep('summary')}>Review →</button></div>}
        {step==='summary'&&<div className="content"><div className="sec">Summary</div><div className="card"><div style={{marginBottom:16}}><span className="field-label">Status</span><div className="ss">{[['Good','sg'],['Monitor','sm'],['Attention','sa']].map(([s,cls])=><div key={s} className={`sb ${summary.status===s?cls:''}`} onClick={()=>setSummary(p=>({...p,status:s}))}>{s}</div>)}</div></div><div style={{marginBottom:16}}><span className="field-label">Risk</span><div className="ss">{[['None','sn'],['Low','sl'],['Med','sme'],['High','sh']].map(([r,cls])=><div key={r} className={`sb ${summary.risk===r?cls:''}`} onClick={()=>setSummary(p=>({...p,risk:r}))}>{r}</div>)}</div></div><div className="fl"><label>Action Required</label><input value={summary.action} onChange={e=>setSummary(p=>({...p,action:e.target.value}))} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.text,padding:'10px 13px',borderRadius:8,fontSize:14,fontFamily:'Inter',outline:'none'}}/></div></div><div className="sec">Notes</div><div className="card"><textarea value={techNotes} onChange={e=>setTechNotes(e.target.value)}/></div><button className="btn" onClick={()=>{saveInspection();setViewingInsp(null);setStep('receipt');}}>Save & Generate →</button><button className="btn2" onClick={()=>setStep(hasSP50?'sp50':'l50')}>← Back</button></div>}
        {step==='receipt'&&<div className="content"><InspPreview record={viewingInsp||currentRecord()}/><button className="btn-pdf" disabled={pdfLoading} onClick={()=>handleInspPDF(viewingInsp||currentRecord())}>{pdfLoading?'Generating...':'⬇ Download PDF'}</button><button className="btn2" onClick={()=>{setViewingInsp(null);setStep('home');}}>← Home</button></div>}
      </>}

      {tab==='service'&&<>
        {step==='home'&&<div className="content"><button className="btn" style={{marginTop:0}} onClick={()=>{setSR(initSR());setStep('sr_form');}}>+ New Service Report</button><div className="sec">Saved ({srHistory.length})</div>{srHistory.length===0?<div className="empty"><div style={{fontSize:36,marginBottom:10}}>🔧</div><div style={{fontWeight:600}}>No reports yet</div></div>:srHistory.map(rec=>(<div className="hcard sr-card" key={rec.id}><div className="hcard-top"><div><div className="hcard-prop">{rec.property||'Unnamed'}</div><div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString()}</div></div><span className="badge ba">Service</span></div><div className="hcard-meta"><span>🤖 {rec.machineName||'—'}</span>{rec.linkedComponent&&<span style={{color:C.attention}}>⚠ {rec.linkedComponent}</span>}</div><div className="hcard-actions"><div className="hbtn" onClick={()=>{setViewingSR(rec);setStep('sr_receipt');}}>View</div><div className="hbtn" onClick={()=>handleSRPDF(rec)}>⬇ PDF</div><div className="hbtn" onClick={()=>emailSR(rec)}>📧</div><div className="hbtn" onClick={e=>deleteSR(rec.id,e)}>Delete</div></div></div>))}</div>}
        {step==='sr_form'&&<div className="content">{sr.linkedComponent&&<div style={{background:C.attention+'15',border:`1px solid ${C.attention}40`,borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13,color:C.attention}}>🔗 Flagged: <strong>{sr.linkedComponent}</strong></div>}<div className="sec">Machine Info</div><div className="card"><div className="fr"><div className="fl"><label>Date</label><input type="date" value={sr.date} onChange={e=>setSR(p=>({...p,date:e.target.value}))}/></div><div className="fl"><label>Technician</label><input value={sr.technician} onChange={e=>setSR(p=>({...p,technician:e.target.value}))}/></div></div><div className="fr"><div className="fl"><label>Property</label><input value={sr.property} onChange={e=>setSR(p=>({...p,property:e.target.value}))}/></div><div className="fl"><label>Unit</label><input value={sr.unit} onChange={e=>setSR(p=>({...p,unit:e.target.value}))}/></div></div><div className="fr"><div className="fl"><label>Machine</label><input value={sr.machineName} onChange={e=>setSR(p=>({...p,machineName:e.target.value}))}/></div><div className="fl"><label>Serial</label><input value={sr.serial} onChange={e=>setSR(p=>({...p,serial:e.target.value}))}/></div></div></div><div className="sec">Issue & Work</div><div className="card"><div className="fl" style={{marginBottom:12}}><label>Issue</label><textarea value={sr.issueReported} onChange={e=>setSR(p=>({...p,issueReported:e.target.value}))}/></div><div className="fl"><label>Work Performed</label><textarea value={sr.workPerformed} onChange={e=>setSR(p=>({...p,workPerformed:e.target.value}))}/></div></div><div className="sec">Parts</div><div className="card"><div style={{fontSize:12,color:C.muted,marginBottom:10}}>Pulls from inventory and auto-deducts on save.</div><table className="parts-table"><thead><tr><th>Part</th><th>Stock</th><th>Qty</th><th></th></tr></thead><tbody>{sr.parts.map((p,i)=>{const inv=p.inventoryId?inventory.find(x=>x.id===p.inventoryId):null;return(<tr key={i}><td><select value={p.inventoryId||''} onChange={e=>{const pts=[...sr.parts];const s=inventory.find(x=>x.id===e.target.value);pts[i]={...pts[i],inventoryId:e.target.value,name:s?.name||'',partNumber:s?.partNumber||''};setSR(s=>({...s,parts:pts}));}}><option value="">— Select —</option>{['Universal','SP50','L50'].map(cat=>(<optgroup key={cat} label={cat}>{inventory.filter(x=>x.category===cat).map(x=>(<option key={x.id} value={x.id}>{x.name}{x.qty===0?' (OUT)':x.qty<=x.lowStock?' (LOW)':''}</option>))}</optgroup>))}</select></td><td style={{textAlign:'center',fontSize:13,fontWeight:700,color:inv?.qty===0?C.attention:inv?.qty<=inv?.lowStock?C.monitor:C.good}}>{inv?inv.qty:'—'}</td><td><input type="number" min="1" value={p.qty} onChange={e=>{const pts=[...sr.parts];pts[i]={...pts[i],qty:e.target.value};setSR(s=>({...s,parts:pts}));}}/></td><td><button className="del-btn" onClick={()=>setSR(s=>({...s,parts:s.parts.filter((_,j)=>j!==i)}))}>×</button></td></tr>);})}</tbody></table><button className="add-part-btn" onClick={()=>setSR(s=>({...s,parts:[...s.parts,{inventoryId:'',name:'',partNumber:'',qty:'1'}]}))}>+ Add Part</button></div><div className="sec">Time Log</div><div className="card"><div className="fr"><div className="fl"><label>Start</label><input type="time" value={sr.startTime} onChange={e=>setSR(p=>({...p,startTime:e.target.value}))}/></div><div className="fl"><label>Finish</label><input type="time" value={sr.finishTime} onChange={e=>setSR(p=>({...p,finishTime:e.target.value}))}/></div></div><div className="fl"><label>Total Downtime</label><input value={sr.totalDowntime} onChange={e=>setSR(p=>({...p,totalDowntime:e.target.value}))}/></div></div><div className="sec">Verification</div><div className="card"><div className="fl" style={{marginBottom:12}}><label>Testing/Verification</label><textarea value={sr.testingVerification} onChange={e=>setSR(p=>({...p,testingVerification:e.target.value}))}/></div><div className="fl"><label>Notes</label><textarea value={sr.additionalNotes} onChange={e=>setSR(p=>({...p,additionalNotes:e.target.value}))}/></div></div><button className="btn" onClick={()=>{saveSR(sr);setViewingSR(null);setStep('sr_receipt');}}>Save & Generate →</button><button className="btn2" onClick={()=>setStep('home')}>← Cancel</button></div>}
        {step==='sr_receipt'&&<div className="content"><SRPreview sr={viewingSR||sr}/><button className="btn-pdf" disabled={pdfLoading} onClick={()=>handleSRPDF(viewingSR||sr)}>{pdfLoading?'Generating...':'⬇ Download PDF'}</button><button className="btn-email" onClick={()=>emailSR(viewingSR||sr)}>📧 Email</button><button className="btn2" onClick={()=>{setViewingSR(null);setStep('home');}}>← Home</button></div>}
      </>}

      {tab==='inventory'&&<div className="content">{outOfStockCount>0&&<div className="low-stock-banner" style={{background:C.attention+'15',border:`1px solid ${C.attention}40`,color:C.attention}}>⚠ {outOfStockCount} part(s) out of stock</div>}{outOfStockCount===0&&lowStockCount>0&&<div className="low-stock-banner">⚠ {lowStockCount} part(s) running low</div>}<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>{[['Total',inventory.length,C.accent],['Low',lowStockCount,C.monitor],['Out',outOfStockCount,C.attention]].map(([l,v,color])=>(<div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px',textAlign:'center'}}><div style={{fontSize:24,fontFamily:'Space Grotesk',fontWeight:700,color}}>{v}</div><div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{l}</div></div>))}</div><input className="inv-search" placeholder="🔍 Search parts..." value={invSearch} onChange={e=>setInvSearch(e.target.value)}/><div className="inv-filters">{['All','Universal','SP50','L50','Low Stock'].map(f=>(<div key={f} className={`inv-filter ${invFilter===f?'on':''}`} onClick={()=>setInvFilter(f)}>{f}</div>))}</div>{showAddPart&&(<div style={{background:C.card,border:`1px solid ${C.accent}40`,borderRadius:12,padding:18,marginBottom:14}}><div style={{fontFamily:'Space Grotesk',fontSize:13,fontWeight:700,color:C.accent,marginBottom:12,letterSpacing:1}}>ADD PART</div><div className="fr"><div className="fl"><label>Name</label><input value={newPart.name} onChange={e=>setNewPart(p=>({...p,name:e.target.value}))}/></div><div className="fl"><label>P/N</label><input value={newPart.partNumber} onChange={e=>setNewPart(p=>({...p,partNumber:e.target.value}))}/></div></div><div className="fr"><div className="fl"><label>Category</label><select value={newPart.category} onChange={e=>setNewPart(p=>({...p,category:e.target.value}))}><option>Universal</option><option>SP50</option><option>L50</option></select></div><div className="fl"><label>Qty</label><input type="number" value={newPart.qty} onChange={e=>setNewPart(p=>({...p,qty:e.target.value}))}/></div></div><div style={{display:'flex',gap:8,marginTop:8}}><button className="btn" style={{marginTop:0,flex:1,padding:'11px'}} onClick={()=>{if(!newPart.name)return;saveInv([...inventory,{id:'p_'+Date.now(),category:newPart.category,name:newPart.name,partNumber:newPart.partNumber,qty:parseInt(newPart.qty)||0,lowStock:parseInt(newPart.lowStock)||1}]);setNewPart({name:'',partNumber:'',category:'Universal',qty:'1',lowStock:'1'});setShowAddPart(false);showToast('✓ Added');}}>Add</button><button className="btn2" style={{marginTop:0,flex:1,padding:'11px'}} onClick={()=>setShowAddPart(false)}>Cancel</button></div></div>)}{!showAddPart&&<button className="add-part-btn" style={{width:'100%',marginBottom:14,padding:'11px'}} onClick={()=>setShowAddPart(true)}>+ Add New Part</button>}{['Universal','SP50','L50'].map(cat=>{const cp=filteredInv.filter(p=>p.category===cat);if(cp.length===0||(invFilter!=='All'&&invFilter!==cat&&invFilter!=='Low Stock'))return null;return(<div key={cat}><div className="sec">{cat}</div><div className="card">{cp.map(p=>{const isOut=p.qty===0;const isLow=p.qty>0&&p.qty<=p.lowStock;return(<div className="inv-row" key={p.id}><div style={{flex:1}}><div className="inv-name">{p.name}{isOut&&<span className="stock-tag stock-out">OUT</span>}{isLow&&!isOut&&<span className="stock-tag stock-low">LOW</span>}</div>{p.partNumber&&<div className="inv-pn">P/N: {p.partNumber}</div>}</div><div className="qty-btns"><button className="qty-btn minus" onClick={()=>adjustQty(p.id,-1)}>−</button><div className={`inv-qty ${isOut?'out':isLow?'low':''}`}>{p.qty}</div><button className="qty-btn" onClick={()=>adjustQty(p.id,1)}>+</button></div></div>);})}</div></div>);})}</div>}

      {tab==='sop'&&<SOPTab properties={sopProperties} setProperties={setSopProperties} showToast={showToast}/>}

      <div className="bottom-nav">
        <button className={`nav-btn ${tab==='inspections'?'active':''}`} onClick={()=>navTo('inspections')}><div className="nav-icon">🔍</div><div className="nav-label">Inspect</div></button>
        <button className={`nav-btn ${tab==='service'?'active':''}`} onClick={()=>navTo('service')}><div className="nav-icon">🔧</div><div className="nav-label">Service</div>{srHistory.length>0&&<div className="nav-badge">{srHistory.length}</div>}</button>
        <button className={`nav-btn ${tab==='inventory'?'active':''}`} onClick={()=>navTo('inventory')}><div className="nav-icon">📦</div><div className="nav-label">Inventory</div>{(outOfStockCount>0||lowStockCount>0)&&<div className="nav-badge">{outOfStockCount||lowStockCount}</div>}</button>
        <button className={`nav-btn ${tab==='sop'?'active':''}`} onClick={()=>navTo('sop')}><div className="nav-icon">📋</div><div className="nav-label">SOP</div>{sopProperties.length>0&&<div className="nav-badge">{sopProperties.length}</div>}</button>
      </div>
    </div>
  </>);
}
