import React, { useRef, useEffect, useState } from 'react';
import './NativeLabelGenerator.scss';
import logo from './logo.png';
import { jsPDF } from 'jspdf';

const suffixRegex = /-(r|y|w)g$/;

const NativeLabelGenerator = ({ items }) => {
  const printAreaRef = useRef();

  const [labels, setLabels] = useState(
    items.map((item) => ({
      ...item,
      quantity: item['Menge offen'] ?? 0,
      size: item.Größe ?? '',
      neuware: false,
      reservierung: false,
      kundenname: '',
      auftragsnummer: ''
    }))
  );

  const [allNeuware, setAllNeuware] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);

  // Convert logo.png to base64 for embedding into PDF
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logo;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      setLogoBase64(dataURL);
    };
  }, []);

  const updateLabel = (index, updatedFields) => {
    setLabels((prev) =>
      prev.map((label, i) => (i === index ? { ...label, ...updatedFields } : label))
    );
  };

  const removeLabel = (index) => {
    setLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  // Format Artikelnummer with suffix on new line
  const formatArtikelnummer = (str) => {
    if (!str) return '';
    const match = str.match(suffixRegex);
    if (!match) return str;
    const suffix = match[0];
    const base = str.slice(0, -suffix.length);
    return `${base}\n${suffix}`;
  };

const handleExportPdf = () => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [38.1, 25.4], // label size per page
    orientation: 'landscape',
  });

  // Helper to split suffix from article number
  const splitSuffix = (str) => {
    const match = str.match(suffixRegex);
    if (!match) return { base: str, suffix: '' };
    const suffix = match[0].toUpperCase().slice(1); // "yg" -> "YG"
    const base = str.slice(0, -suffix.length - 1); // minus suffix length + dash
    return { base, suffix };
  };

  // Loop over each label
  labels.forEach((label, idx) => {
    if (label.quantity <= 0) return; // Skip labels with zero quantity

    for (let i = 0; i < label.quantity; i++) {
      if (idx > 0 || i > 0) doc.addPage();

      const { base, suffix } = splitSuffix(label['Artikel-Nr. fertig']);

      // Draw smaller logo if neuware
      if (label.neuware) {
        const imgWidth = 4; // smaller width in mm
        const imgHeight = 4; // keep square aspect ratio
        doc.addImage(logo, 'PNG', 4, 2, imgWidth, imgHeight);
      }

      // Draw suffix top-right if present
      if (suffix) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(suffix, 33, 6, { align: 'right' });
      }

      const marginLeft = 1;
      let startY = 12;

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);

      if (label.reservierung) {
        doc.text(label.auftragsnummer || '', marginLeft, startY);
        doc.text(label['Artikel-Nr. fertig'], marginLeft, startY + 7);
        if (label['Artikel-Nr. fertig'].startsWith('R-') && label.size) {
console.log('Before size line:', doc.internal.getFontSize());
doc.setFontSize(8);
console.log('After setFontSize(8):', doc.internal.getFontSize());  doc.text(`Size: ${label.size}`, marginLeft, startY + 7);
  doc.setFontSize(14); // Reset back to normal size after
}

        doc.text(label.kundenname || '', marginLeft, startY + 21);
      } else {
        // Print base artikelnummer without suffix
        doc.text(base, marginLeft, startY);
        if (label['Artikel-Nr. fertig'].startsWith('R-') && label.size) {
          doc.text(`Size: ${label.size}`, marginLeft, startY + 7);
        }
      }
    }
  });

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
};

  return (
    <div className="native-label-generator">
      <div className="print-controls">
        <button onClick={handlePrint}>Print</button>
        <button onClick={handleExportPdf}>Export as PDF</button>
      </div>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={allNeuware}
            onChange={(e) => {
              const checked = e.target.checked;
              setAllNeuware(checked);
              setLabels((prev) =>
                prev.map((label) => ({ ...label, neuware: checked }))
              );
            }}
          />
          Alle Neuware
        </label>
      </div>

      <div className="label-config-list">
        {labels.map((label, index) => (
          <div className="label-config-item" key={index}>
            <div>
              <strong>{label['Artikel-Nr. fertig']}</strong> – Menge:{' '}
              <input
                type="number"
                min="1"
                value={label.quantity}
                onChange={(e) =>
                  updateLabel(index, { quantity: parseInt(e.target.value, 10) || 1 })
                }
              />
              {label['Artikel-Nr. fertig'].startsWith('R-') && (
                <>
                  {' '}– Größe:{' '}
                  <input
                    type="text"
                    value={label.size}
                    onChange={(e) => updateLabel(index, { size: e.target.value })}
                  />
                </>
              )}
            </div>

            <label>
              <input
                type="checkbox"
                checked={label.neuware}
                onChange={(e) => updateLabel(index, { neuware: e.target.checked })}
              />
              Neuware
            </label>

            <label>
              <input
                type="checkbox"
                checked={label.reservierung}
                onChange={(e) => updateLabel(index, { reservierung: e.target.checked })}
              />
              Reservierung
            </label>

            {label.reservierung && (
              <div className="reservierung-fields">
                <label>
                  Auftrags-Nr:{' '}
                  <input
                    type="text"
                    value={label.auftragsnummer}
                    onChange={(e) =>
                      updateLabel(index, { auftragsnummer: e.target.value })
                    }
                  />
                </label>
                <label>
                  Kundenname:{' '}
                  <input
                    type="text"
                    value={label.kundenname}
                    onChange={(e) =>
                      updateLabel(index, { kundenname: e.target.value })
                    }
                  />
                </label>
              </div>
            )}

            <button onClick={() => removeLabel(index)}>Entfernen</button>
          </div>
        ))}
      </div>

      <div className="label-preview-grid" ref={printAreaRef}>
        {labels.flatMap((label, index) =>
          Array.from({ length: label.quantity }, (_, i) => (
            <div className="label-card" key={`${index}-${i}`}>
              {label.neuware && (
                <img
                  src={logo}
                  alt="Logo"
                  className="label-logo"
                  style={{
                    width: '15px',
                    height: 'auto',
                    maxWidth: '15px',
                    maxHeight: '15px',
                    objectFit: 'contain',
                  }}
                />
              )}
              <div className="label-content">
                {label.reservierung ? (
                  <>
                    <div className="label-line">
                      <strong>{label.auftragsnummer}</strong>
                    </div>
                    <div className="label-line reservierung-art-nr">
                      <strong>{label['Artikel-Nr. fertig']}</strong>
                    </div>
                    {label['Artikel-Nr. fertig'].startsWith('R-') && (
                      <div className="label-line">Size: {label.size}</div>
                    )}
                    <div className="label-line">{label.kundenname}</div>
                  </>
                ) : (
                  <>
                    <div className="label-line big-art-nr">
                      {formatArtikelnummer(label['Artikel-Nr. fertig'])}
                    </div>
                    {label['Artikel-Nr. fertig'].startsWith('R-') && label.size && (
                      <div className="label-line">Size: {label.size}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NativeLabelGenerator;
