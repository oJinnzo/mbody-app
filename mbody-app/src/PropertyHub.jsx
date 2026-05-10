import { useState, useMemo } from "react";

const C = {
  bg:"#050a12", surface:"#0c1524", card:"#101d30", border:"#1a2e47",
  accent:"#4fc3f7", accentDim:"#0288d1", good:"#22c55e", monitor:"#f59e0b",
  attention:"#ef4444", text:"#e8f0fe", muted:"#5c7a99", white:"#ffffff",
};

// Build a unified list of all unique properties from every source
function getAllProperties(inspections, services, deliveries, sopProperties) {
  const map = new Map();

  // From inspections
  inspections.forEach(r => {
    const name = r.info?.property?.trim();
    if (!name) return;
    if (!map.has(name)) map.set(name, { name, inspections: 0, services: 0, deliveries: 0, sop: null });
    map.get(name).inspections++;
  });

  // From service reports
  services.forEach(r => {
    const name = r.property?.trim();
    if (!name) return;
    if (!map.has(name)) map.set(name, { name, inspections: 0, services: 0, deliveries: 0, sop: null });
    map.get(name).services++;
  });

  // From deliveries
  deliveries.forEach(r => {
    const name = r.property?.trim();
    if (!name) return;
    if (!map.has(name)) map.set(name, { name, inspections: 0, services: 0, deliveries: 0, sop: null });
    map.get(name).deliveries++;
  });

  // From SOP properties
  sopProperties.forEach(p => {
    const name = p.name?.trim();
    if (!name) return;
    if (!map.has(name)) map.set(name, { name, inspections: 0, services: 0, deliveries: 0, sop: null });
    map.get(name).sop = p;
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Calculate SOP progress percentage
function sopProgress(sopProp) {
  if (!sopProp?.sop) return 0;
  const phases = Object.values(sopProp.sop);
  if (phases.length === 0) return 0;

  let totalItems = 0;
  let doneItems = 0;
  phases.forEach(phase => {
    ['prerequisites', 'procedure', 'documentation', 'phaseGate'].forEach(section => {
      const items = phase[section] || {};
      Object.values(items).forEach(checked => {
        totalItems++;
        if (checked) doneItems++;
      });
    });
    const sigs = phase.signatures || {};
    Object.values(sigs).forEach(sig => {
      totalItems++;
      if (sig?.name && sig?.date) doneItems++;
    });
  });

  return totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
}

const getColor = v => {
  if (!v) return 'bn';
  if (['G','Pass','Work','Clean','Smooth','Firm','Secure','OK','Good','None'].includes(v)) return 'bp';
  if (['M','Dirty','Weak','Loose','Updated','Partial'].includes(v)) return 'bm';
  return 'ba';
};

export default function PropertyHub({
  inspections, services, deliveries, sopProperties,
  onClose, onOpenRecord, onOpenSOPPhase,
}) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const allProperties = useMemo(
    () => getAllProperties(inspections, services, deliveries, sopProperties),
    [inspections, services, deliveries, sopProperties]
  );

  const filtered = allProperties.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── DETAIL VIEW ──
  if (selected) {
    const prop = allProperties.find(p => p.name === selected);
    if (!prop) {
      setSelected(null);
      return null;
    }

    const propInspections = inspections.filter(r => r.info?.property?.trim() === selected);
    const propServices = services.filter(r => r.property?.trim() === selected);
    const propDeliveries = deliveries.filter(r => r.property?.trim() === selected);
    const propSOP = sopProperties.find(p => p.name?.trim() === selected);

    return (
      <div className="content">
        {/* Property header */}
        <div style={{ background: C.card, border: `1px solid ${C.accent}40`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Space Grotesk' }}>Property Hub</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', marginTop: 4 }}>{prop.name}</div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
            {[
              ['Inspect', prop.inspections, '🔍'],
              ['Service', prop.services, '🔧'],
              ['Deliv', prop.deliveries, '🚚'],
              ['SOP', propSOP ? `${sopProgress(propSOP)}%` : '—', '📋'],
            ].map(([l, v, icon]) => (
              <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>{icon}</div>
                <div style={{ fontSize: 16, fontFamily: 'Space Grotesk', fontWeight: 700, color: C.accent, marginTop: 4 }}>{v}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SOP Status */}
        {propSOP && (
          <>
            <div className="sec">SOP Progress</div>
            <div className="hcard" onClick={() => onOpenSOPPhase(propSOP.id)} style={{ cursor: 'pointer', borderLeft: `3px solid ${C.accent}` }}>
              <div className="hcard-top">
                <div>
                  <div className="hcard-prop">6-Phase Deployment</div>
                  <div className="hcard-date">{sopProgress(propSOP)}% complete</div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: sopProgress(propSOP) === 100 ? C.good : C.accent }}>{sopProgress(propSOP)}%</div>
              </div>
              <div style={{ background: C.surface, height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ background: sopProgress(propSOP) === 100 ? C.good : `linear-gradient(90deg, ${C.accentDim}, ${C.accent})`, height: '100%', width: `${sopProgress(propSOP)}%` }}/>
              </div>
              <div className="hcard-actions">
                <div className="hbtn">Open SOP →</div>
              </div>
            </div>
          </>
        )}

        {/* Inspections */}
        {propInspections.length > 0 && (
          <>
            <div className="sec">Inspections ({propInspections.length})</div>
            {propInspections.map(rec => (
              <div className="hcard" key={rec.id}>
                <div className="hcard-top">
                  <div>
                    <div className="hcard-prop">{rec.info.model?.join(' + ') || 'Inspection'}</div>
                    <div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString()} · S/N: {rec.info.serial || '—'}</div>
                  </div>
                  {rec.summary?.status && <span className={`badge ${getColor(rec.summary.status === 'Good' ? 'Pass' : rec.summary.status === 'Monitor' ? 'M' : 'Fail')}`}>{rec.summary.status}</span>}
                </div>
                <div className="hcard-actions">
                  <div className="hbtn" onClick={() => onOpenRecord('inspection', rec)}>View / PDF</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Service Reports */}
        {propServices.length > 0 && (
          <>
            <div className="sec">Service Reports ({propServices.length})</div>
            {propServices.map(rec => (
              <div className="hcard sr-card" key={rec.id}>
                <div className="hcard-top">
                  <div>
                    <div className="hcard-prop">{rec.machineName || 'Service'}</div>
                    <div className="hcard-date">{new Date(rec.savedAt).toLocaleDateString()} · S/N: {rec.serial || '—'}</div>
                  </div>
                  <span className="badge ba">Service</span>
                </div>
                {rec.linkedComponent && <div style={{ fontSize: 12, color: C.attention, marginTop: 4 }}>⚠ {rec.linkedComponent}</div>}
                <div className="hcard-actions">
                  <div className="hbtn" onClick={() => onOpenRecord('service', rec)}>View / PDF</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Deliveries */}
        {propDeliveries.length > 0 && (
          <>
            <div className="sec">Deliveries ({propDeliveries.length})</div>
            {propDeliveries.map(rec => (
              <div className="hcard" key={rec.id} style={{ borderLeft: `3px solid ${C.accent}` }}>
                <div className="hcard-top">
                  <div>
                    <div className="hcard-prop">{rec.units?.length || 0} Unit{rec.units?.length === 1 ? '' : 's'} Delivered</div>
                    <div className="hcard-date">{rec.date} · Tracking: {rec.tracking || '—'}</div>
                  </div>
                  <span className="badge" style={{ background: C.accent + '18', color: C.accent }}>Delivery</span>
                </div>
                <div className="hcard-actions">
                  <div className="hbtn" onClick={() => onOpenRecord('delivery', rec)}>View / PDF</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty state for this property */}
        {propInspections.length === 0 && propServices.length === 0 && propDeliveries.length === 0 && !propSOP && (
          <div className="empty">
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <div style={{ fontWeight: 600 }}>No records for this property yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Records will appear here as you log inspections, services, and deliveries.</div>
          </div>
        )}

        <button className="btn2" onClick={() => setSelected(null)}>← All Properties</button>
        <button className="btn2" onClick={onClose}>Close Hub</button>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk' }}>🏢 Property Hub</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>All records, organized by property</div>
        </div>
      </div>

      <input
        className="inv-search"
        placeholder="🔍 Search properties..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="sec">Properties ({filtered.length})</div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏢</div>
          <div style={{ fontWeight: 600 }}>{allProperties.length === 0 ? 'No properties yet' : 'No matches'}</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>{allProperties.length === 0 ? 'Properties appear here automatically as you log records.' : 'Try a different search.'}</div>
        </div>
      ) : filtered.map(p => {
        const sopPct = p.sop ? sopProgress(p.sop) : null;
        const totalRecords = p.inspections + p.services + p.deliveries;
        return (
          <div className="hcard" key={p.name} onClick={() => setSelected(p.name)} style={{ cursor: 'pointer' }}>
            <div className="hcard-top">
              <div style={{ flex: 1 }}>
                <div className="hcard-prop">{p.name}</div>
                <div className="hcard-date">
                  {totalRecords} record{totalRecords === 1 ? '' : 's'}
                  {p.sop && ` · SOP ${sopPct}%`}
                </div>
              </div>
              {sopPct !== null && (
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700, color: sopPct === 100 ? C.good : C.accent }}>{sopPct}%</div>
              )}
            </div>
            <div className="hcard-meta">
              <span>🔍 {p.inspections}</span>
              <span>🔧 {p.services}</span>
              <span>🚚 {p.deliveries}</span>
              <span>📋 {p.sop ? '✓' : '—'}</span>
            </div>
          </div>
        );
      })}

      <button className="btn2" onClick={onClose}>← Back</button>
    </div>
  );
}
