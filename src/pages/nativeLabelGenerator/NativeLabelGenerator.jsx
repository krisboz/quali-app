import React, { useRef } from 'react';
import './NativeLabelGenerator.scss'; // Make sure to import the SCSS
import logo from "./logo.png"

const suffixRegex = /-(r|y|w)g$/;

const NativeLabelGenerator = ({ items }) => {
  const printAreaRef = useRef();

  // Setup initial state
  const [labels, setLabels] = React.useState(
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

  const [allNeuware, setAllNeuware] = React.useState(false);

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

  const formatArtikelnummer = (str) => {
    if (!str) return '';
    const match = str.match(suffixRegex);
    if (!match) return str;
    const suffix = match[0];
    const base = str.slice(0, -suffix.length);
    return `${base}\n${suffix}`;
  };

  return (
    <div className="native-label-generator">
      {/* Print Button */}
      <div className="print-controls">
        <button onClick={handlePrint}>Print</button>
      </div>

      {/* Neuware Global Toggle */}
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

      {/* Label Config Interface */}
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

      {/* Label Preview Print Area */}
      <div className="label-preview-grid" ref={printAreaRef}>
        {labels.flatMap((label, index) =>
          Array.from({ length: label.quantity }, (_, i) => (
            <div className="label-card" key={`${index}-${i}`}>
              {label.neuware && (
  <img src={logo} alt="Logo" className="label-logo" />
)}

                 {/**IF ITS RESERVIERUNG */}
              <div className="label-content">
                {label.reservierung ? (
                  <>
                    <div className="label-line">
                      <strong> {label.auftragsnummer} </strong>
                    </div>
                    <div className={`label-line reservierung-art-nr`}>
                      <strong>{label['Artikel-Nr. fertig']}</strong>
                    </div>
                    {label['Artikel-Nr. fertig'].startsWith('R-') && (
                      <div className="label-line">Size: {label.size}</div>
                    )}
                    <div className="label-line">{label.kundenname}</div>
                  </>
                ) : (
                   
                  <>
                   {/**NORMAL OHNE RESERVIERUNG */}
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
