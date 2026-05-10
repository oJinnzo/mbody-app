import { useState } from "react";
import { SOP_PHASES } from "./sopData.js";
import { exportSOPPhasePDF } from "./sopPdf.js";

const C = {
  bg:"#050a12", surface:"#0c1524", card:"#101d30", border:"#1a2e47",
  accent:"#4fc3f7", accentDim:"#0288d1", good:"#22c55e", monitor:"#f59e0b",
  attention:"#ef4444", text:"#e8f0fe", muted:"#5c7a99", white:"#ffffff",
};

// Create blank state for a new property's SOP record
function createBlankSOP() {
  const data = {};
  SOP_PHASES.forEach(phase => {
    data[phase.id] = {
      prerequisites: {},
      procedure: {},
      documentation: {},
      phaseGate: {},
      signatures: {},
      notes: '',
    };
  });
  return data;
}

// Calculate phase completion %
function phaseProgress(phaseData, phase) {
  if (!phaseData) return 0;
  const all = [
    ...phase.prerequisites.map(x => x.id),
    ...phase.procedure.map(x => x.id),
    ...phase.documentation.map(x => x.id),
    ...phase.phaseGate.map(x => x.id),
  ];
  let done = 0;
  all.forEach(id => {
    if (phaseData.prerequisites?.[id] || phaseData.procedure?.[id] ||
        phaseData.documentation?.[id] || phaseData.phaseGate?.[id]) {
      done++;
    }
  });
  // Also count signatures
  const sigCount = phase.signatures.length;
  const sigDone = phase.signatures.filter(s => phaseData.signatures?.[s.id]?.name && phaseData.signatures?.[s.id]?.date).length;
  return Math.round(((done + sigDone) / (all.length + sigCount)) * 100);
}

function overallProgress(sopData) {
  let total = 0;
  SOP_PHASES.forEach(p => { total += phaseProgress(sopData[p.id], p); });
  return Math.round(total / SOP_PHASES.length);
}

export default function SOPTab({ properties, setProperties, showToast }) {
  const [view, setView] = useState('list'); // list | property | phase
  const [currentPropId, setCurrentPropId] = useState(null);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [showAddProp, setShowAddProp] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const saveProperties = (updated) => {
    setProperties(updated);
    try { localStorage.setItem('mbody_sop_properties', JSON.stringify(updated)); } catch {}
  };

  const addProperty = () => {
    if (!newPropName.trim()) return;
    const prop = {
      id: 'prop_' + Date.now(),
      name: newPropName.trim(),
      createdAt: new Date().toISOString(),
      sop: createBlankSOP(),
    };
    saveProperties([...properties, prop]);
    setNewPropName('');
    setShowAddProp(false);
    showToast('✓ Property Added');
  };

  const deleteProperty = (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this property and all its SOP data?')) return;
    saveProperties(properties.filter(p => p.id !== id));
  };

  const updatePhaseData = (propId, phaseId, updater) => {
    const updated = properties.map(p => {
      if (p.id !== propId) return p;
      return { ...p, sop: { ...p.sop, [phaseId]: updater(p.sop[phaseId]) } };
    });
    saveProperties(updated);
  };

  const currentProp = currentPropId ? properties.find(p => p.id === currentPropId) : null;
  const currentPhase = SOP_PHASES[currentPhaseIdx];
  const currentPhaseData = currentProp?.sop?.[currentPhase?.id];

  const toggleCheck = (section, itemId) => {
    updatePhaseData(currentPropId, currentPhase.id, phaseData => ({
      ...phaseData,
      [section]: { ...phaseData[section], [itemId]: !phaseData[section]?.[itemId] }
    }));
  };

  const updateSignature = (sigId, field, value) => {
    updatePhaseData(currentPropId, currentPhase.id, phaseData => ({
      ...phaseData,
      signatures: {
        ...phaseData.signatures,
        [sigId]: { ...phaseData.signatures?.[sigId], [field]: value }
      }
    }));
  };

  const updateNotes = (text) => {
    updatePhaseData(currentPropId, currentPhase.id, phaseData => ({
      ...phaseData, notes: text
    }));
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      exportSOPPhasePDF(currentProp, currentPhaseData, currentPhase);
    } catch (e) {
      showToast('PDF failed', 'err');
    }
    setTimeout(() => setPdfLoading(false), 1500);
  };

  // ── PROPERTY LIST ──
  if (view === 'list') {
    return (
      <div className="content">
        <button className="btn" style={{ marginTop: 0 }} onClick={() => setShowAddProp(true)}>+ Add Property</button>

        {showAddProp && (
          <div style={{ background: C.card, border: `1px solid ${C.accent}40`, borderRadius: 12, padding: 18, marginTop: 12 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 12, letterSpacing: 1 }}>NEW PROPERTY</div>
            <div className="fl" style={{ marginBottom: 12 }}>
              <label>Property Name</label>
              <input value={newPropName} onChange={e => setNewPropName(e.target.value)} placeholder="e.g. CEI Downtown Tower" autoFocus onKeyDown={e => e.key === 'Enter' && addProperty()} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ marginTop: 0, flex: 1, padding: '11px' }} onClick={addProperty}>Add</button>
              <button className="btn2" style={{ marginTop: 0, flex: 1, padding: '11px' }} onClick={() => { setShowAddProp(false); setNewPropName(''); }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="sec">Properties ({properties.length})</div>
        {properties.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏢</div>
            <div style={{ fontWeight: 600 }}>No properties yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Add a property to start tracking the 6-phase SOP.</div>
          </div>
        ) : properties.map(prop => {
          const progress = overallProgress(prop.sop);
          return (
            <div className="hcard" key={prop.id} onClick={() => { setCurrentPropId(prop.id); setView('property'); setCurrentPhaseIdx(0); }} style={{ cursor: 'pointer' }}>
              <div className="hcard-top">
                <div>
                  <div className="hcard-prop">{prop.name}</div>
                  <div className="hcard-date">Created {new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: progress === 100 ? C.good : progress > 0 ? C.accent : C.muted }}>{progress}%</div>
              </div>
              {/* Progress bar */}
              <div style={{ background: C.surface, height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ background: progress === 100 ? C.good : `linear-gradient(90deg, ${C.accentDim}, ${C.accent})`, height: '100%', width: `${progress}%`, transition: 'width .3s' }} />
              </div>
              <div className="hcard-actions">
                <div className="hbtn" onClick={(e) => { e.stopPropagation(); setCurrentPropId(prop.id); setView('property'); setCurrentPhaseIdx(0); }}>Open</div>
                <div className="hbtn" onClick={e => deleteProperty(prop.id, e)}>Delete</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── PROPERTY DETAIL (phase grid) ──
  if (view === 'property' && currentProp) {
    return (
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk' }}>{currentProp.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Six-Phase Deployment SOP</div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: C.accent }}>{overallProgress(currentProp.sop)}%</div>
        </div>

        <div style={{ background: C.surface, height: 8, borderRadius: 4, marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(90deg, ${C.accentDim}, ${C.accent})`, height: '100%', width: `${overallProgress(currentProp.sop)}%`, transition: 'width .3s' }} />
        </div>

        <div className="sec">Phases</div>
        {SOP_PHASES.map((phase, idx) => {
          const prog = phaseProgress(currentProp.sop[phase.id], phase);
          const isComplete = prog === 100;
          return (
            <div key={phase.id} className="hcard" style={{ cursor: 'pointer', borderLeft: `3px solid ${isComplete ? C.good : prog > 0 ? C.accent : C.border}` }}
              onClick={() => { setCurrentPhaseIdx(idx); setView('phase'); }}>
              <div className="hcard-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: isComplete ? C.good + '20' : prog > 0 ? C.accent + '20' : C.surface,
                    border: `1.5px solid ${isComplete ? C.good : prog > 0 ? C.accent : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700,
                    color: isComplete ? C.good : prog > 0 ? C.accent : C.muted,
                  }}>{phase.number}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{phase.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{phase.owner}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: isComplete ? C.good : prog > 0 ? C.accent : C.muted }}>
                  {isComplete ? '✓' : `${prog}%`}
                </div>
              </div>
              <div style={{ background: C.surface, height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ background: isComplete ? C.good : C.accent, height: '100%', width: `${prog}%`, transition: 'width .3s' }} />
              </div>
            </div>
          );
        })}

        <button className="btn2" onClick={() => { setView('list'); setCurrentPropId(null); }}>← All Properties</button>
      </div>
    );
  }

  // ── PHASE DETAIL ──
  if (view === 'phase' && currentProp && currentPhase) {
    const renderChecklist = (title, items, stateKey) => (
      <>
        <div className="sec">{title}</div>
        <div className="card">
          {items.map(item => {
            const checked = currentPhaseData?.[stateKey]?.[item.id] || false;
            return (
              <div key={item.id} className="irow" onClick={() => toggleCheck(stateKey, item.id)} style={{ cursor: 'pointer' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `1.5px solid ${checked ? C.good : C.border}`,
                  background: checked ? C.good : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all .15s', color: '#000', fontWeight: 700, fontSize: 14,
                }}>{checked ? '✓' : ''}</div>
                <div style={{ flex: 1, fontSize: 13, color: checked ? C.muted : C.text, textDecoration: checked ? 'line-through' : 'none' }}>{item.text}</div>
              </div>
            );
          })}
        </div>
      </>
    );

    return (
      <div className="content">
        {/* Phase header */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Phase {currentPhase.number} of 6 · {currentProp.name}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{currentPhase.title}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Owner: {currentPhase.owner} · Support: {currentPhase.support}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>{currentPhase.objective}</div>
        </div>

        {/* Phase navigator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          {SOP_PHASES.map((p, idx) => {
            const prog = phaseProgress(currentProp.sop[p.id], p);
            const isActive = idx === currentPhaseIdx;
            const isComplete = prog === 100;
            return (
              <div key={p.id} onClick={() => setCurrentPhaseIdx(idx)} style={{
                flex: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${isActive ? C.accent : isComplete ? C.good : C.border}`,
                background: isActive ? C.accent + '15' : isComplete ? C.good + '10' : 'transparent',
                color: isActive ? C.accent : isComplete ? C.good : C.muted,
                fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700,
              }}>P{p.number} {isComplete && '✓'}</div>
            );
          })}
        </div>

        {renderChecklist('Prerequisites', currentPhase.prerequisites, 'prerequisites')}
        {renderChecklist('Procedure', currentPhase.procedure, 'procedure')}
        {renderChecklist('Documentation', currentPhase.documentation, 'documentation')}
        {renderChecklist('Phase Gate', currentPhase.phaseGate, 'phaseGate')}

        {/* Notes */}
        <div className="sec">Notes</div>
        <div className="card">
          <textarea placeholder="Any notes or observations for this phase..." value={currentPhaseData?.notes || ''} onChange={e => updateNotes(e.target.value)} />
        </div>

        {/* Signatures */}
        <div className="sec">Signatures</div>
        <div className="card">
          {currentPhase.signatures.map(sig => {
            const sigData = currentPhaseData?.signatures?.[sig.id] || {};
            return (
              <div key={sig.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}30` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{sig.label}</div>
                <div className="fr">
                  <div className="fl">
                    <label>Type Full Name</label>
                    <input value={sigData.name || ''} onChange={e => updateSignature(sig.id, 'name', e.target.value)} placeholder="Your name" style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 16 }} />
                  </div>
                  <div className="fl">
                    <label>Date</label>
                    <input type="date" value={sigData.date || ''} onChange={e => updateSignature(sig.id, 'date', e.target.value)} />
                  </div>
                </div>
                {sigData.name && sigData.date && (
                  <div style={{ fontSize: 11, color: C.good, marginTop: 6, fontWeight: 600 }}>✓ Signed</div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn-pdf" disabled={pdfLoading} onClick={handlePDF}>
          {pdfLoading ? 'Generating...' : `⬇ Download Phase ${currentPhase.number} PDF`}
        </button>
        <button className="btn2" onClick={() => setView('property')}>← Back to {currentProp.name}</button>
        <button className="btn2" onClick={() => { setView('list'); setCurrentPropId(null); }}>← All Properties</button>
      </div>
    );
  }

  return null;
}
