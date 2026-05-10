import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const C = {
  bg:"#050a12", surface:"#0c1524", card:"#101d30", border:"#1a2e47",
  accent:"#4fc3f7", accentDim:"#0288d1", good:"#22c55e", monitor:"#f59e0b",
  attention:"#ef4444", text:"#e8f0fe", muted:"#5c7a99", white:"#ffffff",
};

const DEFAULT_MODELS = ['SP50', 'S5', 'L50', 'L4', 'L3'];
const MODELS_KEY = 'mbody_delivery_models';
const DELIV_KEY = 'mbody_deliveries';

const loadLS = key => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } };
const saveLS = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

const GMA = [{value:'G',label:'G'},{value:'M',label:'M'},{value:'A',label:'A'}];
const PF  = [{value:'Pass',label:'Pass'},{value:'Fail',label:'Fail'},{value:'N/A',label:'N/A'}];
const PkgOpts = [{value:'Good',label:'Good'},{value:'Damaged',label:'Damaged'},{value:'Severe',label:'Severe'}];

const getColor = v => {
  if (!v) return 'bn';
  if (['G','Pass','Good','OK'].includes(v)) return 'bp';
  if (['M','Damaged','N/A'].includes(v)) return 'bm';
  return 'ba';
};

const iv = () => ({ val: '', note: '' });

const initUnit = () => ({
  id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
  model: '',
  unitNumber: '',
  packaging: iv(),
  exterior: iv(),
  cameraHousing: iv(),
  lidarDome: iv(),
  bumperAssembly: iv(),
  wheels: iv(),
  brushSystem: iv(),
  vacuumSystem: iv(),
  waterSystem: iv(),
  chargingPort: iv(),
  touchScreen: iv(),
  accessories: iv(),
  documentation: iv(),
  poweredOn: iv(),
  firmware: '',
  chargeTime: '',
  aiOrchestrator: iv(),
  dashboard: iv(),
  callCenter: iv(),
  connectivity: iv(),
  status: '',
  notes: '',
  photoCount: '',
});

const initDelivery = () => ({
  date: new Date().toISOString().split('T')[0],
  property: '',
  stagingLocation: '',
  technician: '',
  carrier: '',
  tracking: '',
  poNumber: '',
  expectedCount: '',
  receivedCount: '',
  generalNotes: '',
  signatureName: '',
  signatureDate: new Date().toISOString().split('T')[0],
  units: [initUnit()],
});

// ── PDF export ────────────────────────────────────────────────────────────────
function exportDeliveryPDF(d) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFillColor(5, 10, 18);
  doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(79, 195, 247);
  doc.rect(0, 28, W, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('MBody', 14, 18);
  doc.setTextColor(79, 195, 247);
  doc.text(' AI', 14 + doc.getTextWidth('MBody'), 18);
  doc.setFontSize(9);
  doc.setTextColor(92, 122, 153);
  doc.text('EQUIPMENT DELIVERY REPORT', 14, 24);
  doc.setFontSize(8);
  doc.text(d.date || '', W - 14, 18, { align: 'right' });
  y = 38;

  doc.autoTable({
    startY: y, head: [], body: [
      ['Date', d.date || '—', 'Property', d.property || '—'],
      ['Technician', d.technician || '—', 'Staging Location', d.stagingLocation || '—'],
      ['Carrier', d.carrier || '—', 'Tracking #', d.tracking || '—'],
      ['PO Number', d.poNumber || '—', 'Units (Exp/Rec)', `${d.expectedCount || '—'} / ${d.receivedCount || '—'}`],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [30, 50, 70] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32, textColor: [92, 122, 153] },
      1: { cellWidth: 58 },
      2: { fontStyle: 'bold', cellWidth: 32, textColor: [92, 122, 153] },
      3: { cellWidth: 58 },
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Per-unit sections
  d.units.forEach((u, idx) => {
    if (y > 230) { doc.addPage(); y = 15; }

    // Unit header bar
    doc.setFillColor(10, 21, 36);
    doc.roundedRect(14, y, W - 28, 10, 2, 2, 'F');
    doc.setTextColor(79, 195, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`UNIT ${idx + 1}  ·  ${u.model || '—'}  ·  #${u.unitNumber || '—'}`, 18, y + 6.5);
    if (u.status) {
      const sc = u.status === 'Ready' ? [34,197,94] : u.status === 'Hold' ? [245,158,11] : [239,68,68];
      doc.setTextColor(...sc);
      doc.setFontSize(9);
      doc.text(u.status.toUpperCase(), W - 18, y + 6.5, { align: 'right' });
    }
    y += 14;

    const rows = [
      ['Packaging Condition', u.packaging],
      ['Exterior', u.exterior],
      ['Camera Housing', u.cameraHousing],
      ['LiDAR Dome', u.lidarDome],
      ['Bumper Assembly', u.bumperAssembly],
      ['Wheels (all 4)', u.wheels],
      ['Brush System', u.brushSystem],
      ['Vacuum / Dustbin', u.vacuumSystem],
      ['Water Tanks', u.waterSystem],
      ['Charging Port', u.chargingPort],
      ['Touchscreen', u.touchScreen],
      ['Accessories Included', u.accessories],
      ['Documentation Included', u.documentation],
      ['Powered On Successfully', u.poweredOn],
      ['AI Orchestrator Visible', u.aiOrchestrator],
      ['Dashboard Visible', u.dashboard],
      ['Call Center Registered', u.callCenter],
      ['Connectivity Confirmed', u.connectivity],
    ];

    doc.autoTable({
      startY: y,
      head: [['Check', 'Result', 'Notes']],
      body: rows.map(([l, v]) => [l, v?.val || '—', v?.note || '']),
      theme: 'striped',
      headStyles: { fillColor: [22, 31, 48], textColor: [79, 195, 247], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 75, textColor: [40, 60, 80] },
        1: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 65, textColor: [92, 122, 153], fontSize: 8 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const v = data.cell.raw;
          if (['G','Pass','Good','OK'].includes(v)) data.cell.styles.textColor = [22,163,74];
          else if (['M','Damaged','N/A'].includes(v)) data.cell.styles.textColor = [217,119,6];
          else if (v && v !== '—') data.cell.styles.textColor = [220,38,38];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 3;

    if (u.firmware || u.chargeTime || u.photoCount) {
      const extras = [];
      if (u.firmware) extras.push(['Firmware', u.firmware]);
      if (u.chargeTime) extras.push(['Charge Time', u.chargeTime]);
      if (u.photoCount) extras.push(['Photos Taken', u.photoCount]);
      doc.autoTable({
        startY: y, head: [], body: extras,
        theme: 'plain', styles: { fontSize: 9, cellPadding: 2, textColor: [30,50,70] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: [92,122,153] }, 1: { cellWidth: 130 } },
      });
      y = doc.lastAutoTable.finalY + 3;
    }

    if (u.notes) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setTextColor(92, 122, 153);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('NOTES:', 14, y + 4);
      doc.setTextColor(40, 60, 80);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(u.notes, W - 40);
      doc.text(lines, 32, y + 4);
      y += lines.length * 4 + 6;
    }

    y += 4;
  });

  // General notes
  if (d.generalNotes) {
    if (y > 240) { doc.addPage(); y = 15; }
    doc.setFillColor(10, 21, 36);
    doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
    doc.setTextColor(79, 195, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('GENERAL DELIVERY NOTES', 18, y + 5.5);
    y += 11;
    doc.setTextColor(40, 60, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(d.generalNotes, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 6;
  }

  // Signature
  if (y > 260) { doc.addPage(); y = 15; }
  doc.setDrawColor(180, 180, 180);
  doc.line(14, y + 10, W - 14, y + 10);
  doc.setTextColor(40, 60, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Receiving Technician', 14, y + 15);
  if (d.signatureName && d.signatureDate) {
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.text(d.signatureName, 14, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(92, 122, 153);
    doc.text(`Date: ${d.signatureDate}`, W - 14, y + 15, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('(unsigned)', 14, y + 6);
    doc.text('Date: ___________', W - 14, y + 15, { align: 'right' });
  }

  const tp = doc.internal.getNumberOfPages();
  for (let i = 1; i <= tp; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(92, 122, 153);
    doc.text(`MBody AI · Delivery Report · ${d.property || ''} · ${d.date || ''} · Page ${i} of ${tp}`,
      W / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
  }

  doc.save(`mbody-delivery-${(d.property || 'property').replace(/\s+/g, '-').toLowerCase()}-${d.date || 'report'}.pdf`);
}

// ── UI components ────────────────────────────────────────────────────────────
const RadioGroup = ({ options, value, onChange }) => (
  <div className="rg">
    {options.map(opt => {
      const sel = value === opt.value;
      let cls = '';
      if (sel) {
        if (['G','Pass','Good','OK'].includes(opt.value)) cls = 'g';
        else if (['M','Damaged','N/A'].includes(opt.value)) cls = 'm';
        else cls = 'a';
      }
      return <div key={opt.value} className={`rb ${sel ? cls : ''}`} onClick={() => onChange(opt.value)}>{opt.label}</div>;
    })}
  </div>
);

const IRow = ({ label, options, field, value, onChange }) => {
  const [note, setNote] = useState(value?.note || '');
  return (
    <div className="irow">
      <div className="rlabel">{label}</div>
      <RadioGroup options={options} value={value?.val} onChange={v => onChange(field, { ...value, val: v })} />
      <input
        className="ni"
        placeholder="notes..."
        value={note}
        onChange={e => { setNote(e.target.value); onChange(field, { ...value, note: e.target.value }); }}
      />
    </div>
  );
};

// ── Main DeliveryTab ──────────────────────────────────────────────────────────
export default function DeliveryTab({ showToast }) {
  const [view, setView] = useState('list'); // list | form | receipt
  const [deliveries, setDeliveries] = useState(() => loadLS(DELIV_KEY) || []);
  const [models, setModels] = useState(() => loadLS(MODELS_KEY) || DEFAULT_MODELS);
  const [d, setD] = useState(initDelivery());
  const [viewingId, setViewingId] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [addingModelForUnit, setAddingModelForUnit] = useState(null);

  const saveDeliveries = (updated) => { setDeliveries(updated); saveLS(DELIV_KEY, updated); };
  const saveModels = (updated) => { setModels(updated); saveLS(MODELS_KEY, updated); };

  const updateField = (field, val) => setD(p => ({ ...p, [field]: val }));

  const updateUnit = (unitId, field, val) => {
    setD(p => ({ ...p, units: p.units.map(u => u.id === unitId ? { ...u, [field]: val } : u) }));
  };

  const addUnit = () => setD(p => ({ ...p, units: [...p.units, initUnit()] }));

  const removeUnit = (unitId) => {
    if (d.units.length === 1) return;
    if (!confirm('Remove this unit?')) return;
    setD(p => ({ ...p, units: p.units.filter(u => u.id !== unitId) }));
  };

  const handleAddCustomModel = () => {
    const trimmed = newModel.trim();
    if (!trimmed) return;
    if (!models.includes(trimmed)) {
      const updated = [...models, trimmed];
      saveModels(updated);
    }
    if (addingModelForUnit) {
      updateUnit(addingModelForUnit, 'model', trimmed);
    }
    setNewModel('');
    setShowAddModel(false);
    setAddingModelForUnit(null);
    showToast('✓ Model Added');
  };

  const saveDelivery = () => {
    const id = 'del_' + Date.now();
    const record = { ...d, id, savedAt: new Date().toISOString() };
    saveDeliveries([record, ...deliveries]);
    showToast('✓ Delivery Saved');
    return record;
  };

  const deleteDelivery = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this delivery?')) return;
    saveDeliveries(deliveries.filter(x => x.id !== id));
  };

  const handlePDF = async (record) => {
    setPdfLoading(true);
    try { exportDeliveryPDF(record); } catch { showToast('PDF failed', 'err'); }
    setTimeout(() => setPdfLoading(false), 1500);
  };

  const viewDelivery = (record) => {
    setD(record);
    setViewingId(record.id);
    setView('receipt');
  };

  // Count completed checks for a unit
  const unitProgress = (u) => {
    const checks = [u.packaging, u.exterior, u.cameraHousing, u.lidarDome, u.bumperAssembly, u.wheels, u.brushSystem, u.vacuumSystem, u.waterSystem, u.chargingPort, u.touchScreen, u.accessories, u.documentation, u.poweredOn, u.aiOrchestrator, u.dashboard, u.callCenter, u.connectivity];
    const done = checks.filter(c => c?.val).length;
    return { done, total: checks.length };
  };

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="content">
        <button className="btn" style={{ marginTop: 0 }} onClick={() => { setD(initDelivery()); setViewingId(null); setView('form'); }}>+ New Delivery</button>
        <div className="sec">Saved Deliveries ({deliveries.length})</div>
        {deliveries.length === 0 ? (
          <div className="empty"><div style={{ fontSize: 36, marginBottom: 10 }}>📦</div><div style={{ fontWeight: 600 }}>No deliveries yet</div><div style={{ fontSize: 12, marginTop: 6 }}>Log every delivery for documentation and warranty.</div></div>
        ) : deliveries.map(rec => (
          <div className="hcard" key={rec.id} style={{ borderLeft: `3px solid ${C.accent}` }}>
            <div className="hcard-top">
              <div>
                <div className="hcard-prop">{rec.property || 'Unnamed Property'}</div>
                <div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {rec.date}</div>
              </div>
              <span className="badge" style={{ background: C.accent + '18', color: C.accent }}>{rec.units?.length || 0} Unit{rec.units?.length === 1 ? '' : 's'}</span>
            </div>
            <div className="hcard-meta">
              <span>📦 Tracking: {rec.tracking || '—'}</span>
              <span>👤 {rec.technician || '—'}</span>
            </div>
            <div className="hcard-actions">
              <div className="hbtn" onClick={() => viewDelivery(rec)}>View</div>
              <div className="hbtn" onClick={() => handlePDF(rec)}>⬇ PDF</div>
              <div className="hbtn" onClick={e => deleteDelivery(rec.id, e)}>Delete</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── FORM VIEW ──
  if (view === 'form') {
    return (
      <div className="content">
        <div className="sec">Delivery Information</div>
        <div className="card">
          <div className="fr">
            <div className="fl"><label>Date</label><input type="date" value={d.date} onChange={e => updateField('date', e.target.value)}/></div>
            <div className="fl"><label>Technician</label><input value={d.technician} onChange={e => updateField('technician', e.target.value)} placeholder="Receiving tech"/></div>
          </div>
          <div className="fr">
            <div className="fl"><label>Property</label><input value={d.property} onChange={e => updateField('property', e.target.value)} placeholder="Property name"/></div>
            <div className="fl"><label>Staging Location</label><input value={d.stagingLocation} onChange={e => updateField('stagingLocation', e.target.value)} placeholder="Loading dock, room, etc."/></div>
          </div>
          <div className="fr">
            <div className="fl"><label>Carrier</label><input value={d.carrier} onChange={e => updateField('carrier', e.target.value)} placeholder="FedEx, UPS, freight..."/></div>
            <div className="fl"><label>Tracking #</label><input value={d.tracking} onChange={e => updateField('tracking', e.target.value)} placeholder="Tracking number"/></div>
          </div>
          <div className="fr">
            <div className="fl"><label>PO / Order #</label><input value={d.poNumber} onChange={e => updateField('poNumber', e.target.value)} placeholder="PO number"/></div>
            <div className="fl">
              <label>Units (Expected / Received)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" value={d.expectedCount} onChange={e => updateField('expectedCount', e.target.value)} placeholder="Exp" style={{ flex: 1 }}/>
                <input type="number" min="0" value={d.receivedCount} onChange={e => updateField('receivedCount', e.target.value)} placeholder="Rec" style={{ flex: 1 }}/>
              </div>
            </div>
          </div>
        </div>

        {/* UNITS */}
        {d.units.map((unit, idx) => {
          const progress = unitProgress(unit);
          const sc = unit.status === 'Ready' ? C.good : unit.status === 'Hold' ? C.monitor : unit.status === 'Reject' ? C.attention : C.muted;
          return (
            <div key={unit.id}>
              <div className="sec" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Unit {idx + 1} {unit.status && <span style={{ color: sc, marginLeft: 8 }}>· {unit.status}</span>}</span>
                <span style={{ color: C.muted, fontSize: 10, letterSpacing: 1 }}>{progress.done}/{progress.total} CHECKED</span>
              </div>

              <div className="card">
                {/* Unit identity */}
                <div className="fr">
                  <div className="fl">
                    <label>Model</label>
                    <select value={unit.model} onChange={e => {
                      if (e.target.value === '__add__') {
                        setAddingModelForUnit(unit.id);
                        setShowAddModel(true);
                      } else {
                        updateUnit(unit.id, 'model', e.target.value);
                      }
                    }}>
                      <option value="">— Select —</option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="__add__" style={{ color: C.accent }}>+ Add Custom Model</option>
                    </select>
                  </div>
                  <div className="fl"><label>Unit Number</label><input value={unit.unitNumber} onChange={e => updateUnit(unit.id, 'unitNumber', e.target.value)} placeholder="Unit #"/></div>
                </div>
                <div className="fr">
                  <div className="fl"><label>Firmware</label><input value={unit.firmware} onChange={e => updateUnit(unit.id, 'firmware', e.target.value)} placeholder="v0.0.0"/></div>
                  <div className="fl"><label>Charge Time</label><input value={unit.chargeTime} onChange={e => updateUnit(unit.id, 'chargeTime', e.target.value)} placeholder="e.g. 3.5 hrs"/></div>
                </div>
                <div className="fr">
                  <div className="fl"><label>Photos Taken</label><input type="number" min="0" value={unit.photoCount} onChange={e => updateUnit(unit.id, 'photoCount', e.target.value)} placeholder="# of photos"/></div>
                  <div className="fl">
                    <label>Status</label>
                    <select value={unit.status} onChange={e => updateUnit(unit.id, 'status', e.target.value)}>
                      <option value="">— Set Status —</option>
                      <option value="Ready">Ready for Deployment</option>
                      <option value="Hold">Hold</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Packaging & Exterior */}
              <div className="card">
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Packaging & Exterior</div>
                <IRow label="Packaging Condition" options={PkgOpts} field="packaging" value={unit.packaging} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Exterior" options={GMA} field="exterior" value={unit.exterior} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Camera Housing" options={GMA} field="cameraHousing" value={unit.cameraHousing} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="LiDAR Dome" options={GMA} field="lidarDome" value={unit.lidarDome} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Bumper Assembly" options={GMA} field="bumperAssembly" value={unit.bumperAssembly} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
              </div>

              {/* Mechanical Systems */}
              <div className="card">
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Mechanical Systems</div>
                <IRow label="Wheels (all 4)" options={GMA} field="wheels" value={unit.wheels} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Brush System" options={GMA} field="brushSystem" value={unit.brushSystem} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Vacuum / Dustbin" options={GMA} field="vacuumSystem" value={unit.vacuumSystem} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Water Tanks" options={GMA} field="waterSystem" value={unit.waterSystem} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Charging Port" options={GMA} field="chargingPort" value={unit.chargingPort} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Touchscreen" options={GMA} field="touchScreen" value={unit.touchScreen} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
              </div>

              {/* Inclusions */}
              <div className="card">
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Inclusions</div>
                <IRow label="Accessories Included" options={PF} field="accessories" value={unit.accessories} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Documentation Included" options={PF} field="documentation" value={unit.documentation} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
              </div>

              {/* Activation Verification */}
              <div className="card">
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: 'Space Grotesk', fontWeight: 700 }}>Activation & Platform Verification</div>
                <IRow label="Powered On Successfully" options={PF} field="poweredOn" value={unit.poweredOn} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="AI Orchestrator Visible" options={PF} field="aiOrchestrator" value={unit.aiOrchestrator} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Dashboard Visible" options={PF} field="dashboard" value={unit.dashboard} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Call Center Registered" options={PF} field="callCenter" value={unit.callCenter} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
                <IRow label="Connectivity Confirmed" options={PF} field="connectivity" value={unit.connectivity} onChange={(f, v) => updateUnit(unit.id, f, v)}/>
              </div>

              <div className="card">
                <div className="fl"><label>Unit Notes</label><textarea value={unit.notes} onChange={e => updateUnit(unit.id, 'notes', e.target.value)} placeholder="Damage, discrepancies, observations..."/></div>
              </div>

              {d.units.length > 1 && (
                <button className="btn2" style={{ borderColor: C.attention + '40', color: C.attention }} onClick={() => removeUnit(unit.id)}>Remove Unit {idx + 1}</button>
              )}
            </div>
          );
        })}

        <button className="add-part-btn" style={{ width: '100%', padding: '13px', fontSize: 13, marginTop: 14 }} onClick={addUnit}>+ Add Another Unit</button>

        {/* General notes + signature */}
        <div className="sec">General Notes & Sign-Off</div>
        <div className="card">
          <div className="fl" style={{ marginBottom: 12 }}><label>General Delivery Notes</label><textarea value={d.generalNotes} onChange={e => updateField('generalNotes', e.target.value)} placeholder="Any overall observations, missing items, freight damage..."/></div>
          <div className="fr">
            <div className="fl">
              <label>Receiving Technician (Signature)</label>
              <input value={d.signatureName} onChange={e => updateField('signatureName', e.target.value)} placeholder="Type full name" style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 16 }}/>
            </div>
            <div className="fl"><label>Date</label><input type="date" value={d.signatureDate} onChange={e => updateField('signatureDate', e.target.value)}/></div>
          </div>
          {d.signatureName && d.signatureDate && <div style={{ fontSize: 11, color: C.good, marginTop: 6, fontWeight: 600 }}>✓ Signed</div>}
        </div>

        <button className="btn" onClick={() => { saveDelivery(); setView('receipt'); }}>Save & Generate Report →</button>
        <button className="btn2" onClick={() => { setD(initDelivery()); setView('list'); }}>← Cancel</button>

        {/* Add Custom Model Modal */}
        {showAddModel && (
          <div style={{ position: 'fixed', inset: 0, background: '#000c', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => { setShowAddModel(false); setAddingModelForUnit(null); }}>
            <div style={{ background: C.card, border: `1px solid ${C.accent}60`, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700, color: C.accent, marginBottom: 6 }}>Add Custom Model</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Add a new machine model. It will be saved for future deliveries.</div>
              <div className="fl" style={{ marginBottom: 16 }}>
                <label>Model Name</label>
                <input value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="e.g. X7, M2-Pro" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddCustomModel()}/>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" style={{ marginTop: 0, flex: 1, padding: 13 }} onClick={handleAddCustomModel}>Add</button>
                <button className="btn2" style={{ marginTop: 0, flex: 1, padding: 13 }} onClick={() => { setShowAddModel(false); setNewModel(''); setAddingModelForUnit(null); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RECEIPT VIEW ──
  if (view === 'receipt') {
    return (
      <div className="content">
        <div className="receipt-preview">
          <div className="rh">
            <div className="rlogo">MBody <span>AI</span></div>
            <div className="rlogo-sub">Equipment Delivery Report</div>
          </div>
          <div className="rmeta">
            {[['Date', d.date], ['Property', d.property], ['Technician', d.technician], ['Staging', d.stagingLocation], ['Carrier', d.carrier], ['Tracking #', d.tracking], ['PO #', d.poNumber], ['Units Rec/Exp', `${d.receivedCount || '—'} / ${d.expectedCount || '—'}`]].map(([l, v]) => (
              <div className="mi" key={l}><div className="ml">{l}</div><div className="mv">{v || '—'}</div></div>
            ))}
          </div>

          {d.units.map((u, idx) => {
            const sc = u.status === 'Ready' ? C.good : u.status === 'Hold' ? C.monitor : u.status === 'Reject' ? C.attention : C.muted;
            const rows = [
              ['Packaging', u.packaging], ['Exterior', u.exterior], ['Camera Housing', u.cameraHousing], ['LiDAR Dome', u.lidarDome], ['Bumper', u.bumperAssembly],
              ['Wheels', u.wheels], ['Brush', u.brushSystem], ['Vacuum', u.vacuumSystem], ['Water', u.waterSystem], ['Charging Port', u.chargingPort], ['Touchscreen', u.touchScreen],
              ['Accessories', u.accessories], ['Documentation', u.documentation],
              ['Powered On', u.poweredOn], ['AI Orchestrator', u.aiOrchestrator], ['Dashboard', u.dashboard], ['Call Center', u.callCenter], ['Connectivity', u.connectivity],
            ];
            return (
              <div key={u.id} className="rsec">
                <div className="rsect" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Unit {idx + 1} · {u.model || '—'} · #{u.unitNumber || '—'}</span>
                  {u.status && <span style={{ color: sc }}>{u.status}</span>}
                </div>
                {rows.map(([l, v]) => (
                  <div className="rrow" key={l}>
                    <div className="ri">{l}{v?.note ? <span style={{ color: C.muted, fontSize: 11, marginLeft: 6 }}>— {v.note}</span> : ''}</div>
                    <span className={`badge ${getColor(v?.val)}`}>{v?.val || '—'}</span>
                  </div>
                ))}
                {(u.firmware || u.chargeTime || u.notes) && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                    {u.firmware && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Firmware: <span style={{ color: C.text }}>{u.firmware}</span></div>}
                    {u.chargeTime && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Charge Time: <span style={{ color: C.text }}>{u.chargeTime}</span></div>}
                    {u.notes && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 4 }}>Notes: <span style={{ color: C.text }}>{u.notes}</span></div>}
                  </div>
                )}
              </div>
            );
          })}

          {d.generalNotes && (
            <div className="rsec">
              <div className="rsect">General Notes</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{d.generalNotes}</div>
            </div>
          )}

          <div className="sig">
            <span>Tech: {d.signatureName || '_______'}</span>
            <span>Date: {d.signatureDate || '_______'}</span>
          </div>
        </div>

        <button className="btn-pdf" disabled={pdfLoading} onClick={() => handlePDF(d)}>{pdfLoading ? 'Generating...' : '⬇ Download PDF'}</button>
        <button className="btn2" onClick={() => { setViewingId(null); setD(initDelivery()); setView('list'); }}>← All Deliveries</button>
        {!viewingId && <button className="btn2" onClick={() => setView('form')}>← Edit Delivery</button>}
      </div>
    );
  }

  return null;
}
