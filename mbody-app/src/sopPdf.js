import jsPDF from "jspdf";
import "jspdf-autotable";

// Generate a PDF for one phase of one property's SOP record.
export function exportSOPPhasePDF(property, phaseData, phase) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
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
  doc.text(`PHASE ${phase.number} — ${phase.title.toUpperCase()}`, 14, 24);
  doc.setFontSize(8);
  doc.text(new Date().toISOString().split('T')[0], W - 14, 18, { align: 'right' });
  y = 38;

  // Property + owner info
  doc.autoTable({
    startY: y, head: [], body: [
      ['Property', property.name || '—', 'Owner', phase.owner || '—'],
      ['Phase', `Phase ${phase.number}`, 'Support', phase.support || '—'],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [30, 50, 70] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28, textColor: [92, 122, 153] },
      1: { cellWidth: 62 },
      2: { fontStyle: 'bold', cellWidth: 28, textColor: [92, 122, 153] },
      3: { cellWidth: 62 },
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Objective box
  doc.setFillColor(10, 21, 36);
  doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
  doc.setTextColor(79, 195, 247);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OBJECTIVE', 18, y + 5.5);
  y += 11;
  doc.setTextColor(40, 60, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const objLines = doc.splitTextToSize(phase.objective, W - 28);
  doc.text(objLines, 14, y);
  y += objLines.length * 5 + 6;

  // Helper to add a section table
  const addChecklist = (title, items, stateKey) => {
    if (y > 245) { doc.addPage(); y = 15; }
    const rows = items.map(item => {
      const checked = phaseData[stateKey]?.[item.id] || false;
      return [checked ? '✓' : '☐', item.text];
    });
    doc.autoTable({
      startY: y,
      head: [[{ content: title, colSpan: 2, styles: { fillColor: [10, 21, 36], textColor: [79, 195, 247], fontStyle: 'bold', fontSize: 9 } }]],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 170, textColor: [40, 60, 80] },
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          if (data.cell.raw === '✓') {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [180, 180, 180];
          }
        }
      },
    });
    y = doc.lastAutoTable.finalY + 5;
  };

  addChecklist('PREREQUISITES', phase.prerequisites, 'prerequisites');
  addChecklist('PROCEDURE', phase.procedure, 'procedure');
  addChecklist('DOCUMENTATION', phase.documentation, 'documentation');
  addChecklist('PHASE GATE', phase.phaseGate, 'phaseGate');

  // Notes
  if (phaseData.notes) {
    if (y > 240) { doc.addPage(); y = 15; }
    doc.setFillColor(10, 21, 36);
    doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
    doc.setTextColor(79, 195, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NOTES', 18, y + 5.5);
    y += 11;
    doc.setTextColor(40, 60, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(phaseData.notes, W - 28);
    doc.text(noteLines, 14, y);
    y += noteLines.length * 5 + 6;
  }

  // Signatures section
  if (y > 220) { doc.addPage(); y = 15; }
  doc.setFillColor(10, 21, 36);
  doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
  doc.setTextColor(79, 195, 247);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SIGNATURES', 18, y + 5.5);
  y += 12;

  phase.signatures.forEach(sig => {
    const sigData = phaseData.signatures?.[sig.id] || {};
    const name = sigData.name || '';
    const date = sigData.date || '';
    const isSigned = name && date;

    if (y > 270) { doc.addPage(); y = 15; }

    doc.setDrawColor(180, 180, 180);
    doc.line(14, y + 8, W - 14, y + 8);
    doc.setTextColor(40, 60, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(sig.label, 14, y + 13);

    if (isSigned) {
      // Signed signature
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.setTextColor(40, 60, 80);
      doc.text(name, 14, y + 6);
      // Date on right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(92, 122, 153);
      doc.text(`Date: ${date}`, W - 14, y + 13, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text('(unsigned)', 14, y + 6);
      doc.text('Date: ___________', W - 14, y + 13, { align: 'right' });
    }

    y += 22;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(92, 122, 153);
    doc.text(`MBody AI · Phase ${phase.number} SOP · ${property.name || ''} · Page ${i} of ${totalPages}`, W / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
  }

  const fname = `mbody-phase${phase.number}-${(property.name || 'property').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fname);
}
