import React, { useRef, useEffect, useState } from "react";
import "./NativeLabelGenerator.scss";
import logo from "./logo.png";
import { jsPDF } from "jspdf";

const suffixRegex = /-(r|y|w)g$/;

const NativeLabelGenerator = ({ items = [], closeForm = null }) => {
  const printAreaRef = useRef();

  const [labels, setLabels] = useState(
    items.length > 0
      ? items.map((item) => ({
          ...item,
          quantity: item["Menge offen"] ?? 0,
          size: item.Größe ?? "",
          neuware: false,
          reservierung: false,
          kundenname: "",
          auftragsnummer: "",
        }))
      : []
  );

  const [customLabel, setCustomLabel] = useState({
    "Artikel-Nr. fertig": "",
    quantity: 1,
    size: "",
    neuware: false,
    reservierung: false,
    kundenname: "",
    auftragsnummer: "",
  });

  const [allNeuware, setAllNeuware] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(items.length === 0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logo;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
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

  const formatArtikelnummer = (str) => {
    if (!str) return "";
    const match = str.match(suffixRegex);
    if (!match) return str;
    const suffix = match[0];
    const base = str.slice(0, -suffix.length);
    return `${base}\n${suffix}`;
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      unit: "mm",
      format: [38.1, 25.4],
      orientation: "landscape",
    });

    const splitSuffix = (str) => {
      const match = str.match(suffixRegex);
      if (!match) return { base: str, suffix: "" };
      const suffix = match[0].toUpperCase().slice(1);
      const base = str.slice(0, -suffix.length - 1);
      return { base, suffix };
    };

    labels.forEach((label, idx) => {
      if (label.quantity <= 0) return;

      for (let i = 0; i < label.quantity; i++) {
        if (idx > 0 || i > 0) doc.addPage();

        const { base, suffix } = splitSuffix(label["Artikel-Nr. fertig"]);

        if (label.neuware && logoBase64) {
          doc.addImage(logoBase64, "PNG", 4, 2, 4, 4);
        }

        doc.setFontSize(9);
        if (label.size !== " ") {
          doc.text(`Size:${label.size}`, 25, 6);
        }

        const marginLeft = 2;
        let startY = 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        if (label.reservierung) {
          doc.setFontSize(9);
          doc.text(label.auftragsnummer || "", marginLeft, startY + 1);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(label["Artikel-Nr. fertig"], marginLeft, startY + 6, {
            maxWidth: 33,
          });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(label.kundenname || "", marginLeft, startY + 14);
        } else {
          doc.setFontSize(12);
          doc.text(`${base}-${suffix.toLowerCase()}`, marginLeft, startY + 5, {
            maxWidth: 34,
          });
        }
      }
    });

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains("modal-backdrop") && closeForm) {
          closeForm();
        }
      }}
    >
      <div className="modal-content native-label-generator">
        <button className="modal-close-button" onClick={closeForm}>
          &times;
        </button>

        <div className="print-controls">
          <button onClick={handleExportPdf}>Print</button>
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

        <div className="controls">
          {items.length > 0 && !showCustomInput && (
            <button onClick={() => setShowCustomInput(true)}>Add Custom</button>
          )}
        </div>

        {showCustomInput && (
          <div className="custom-label-entry">
            <h4>Custom Label hinzufügen {items.length>0 && <span><button onClick={()=>setShowCustomInput(false)}>X</button></span>}</h4>

            <label className="custom-label artikel-nr">
              Artikel-Nr.:
              <input
                type="text"
                value={customLabel["Artikel-Nr. fertig"]}
                onChange={(e) =>
                  setCustomLabel((prev) => ({
                    ...prev,
                    "Artikel-Nr. fertig": e.target.value,
                  }))
                }
              />
            </label>

            {(customLabel["Artikel-Nr. fertig"].startsWith("R-") ||
              customLabel["Artikel-Nr. fertig"].startsWith("r-")) && (
              <label className="custom-label size">
                Größe:
                <input
                  type="text"
                  value={customLabel.size}
                  onChange={(e) =>
                    setCustomLabel((prev) => ({
                      ...prev,
                      size: e.target.value,
                    }))
                  }
                />
              </label>
            )}

            <label className="custom-label quantity">
              Menge:
              <input
                type="number"
                min="1"
                value={customLabel.quantity}
                onChange={(e) =>
                  setCustomLabel((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </label>

            <label className="custom-label neuware">
              Neuware
              <input
                type="checkbox"
                checked={customLabel.neuware}
                onChange={(e) =>
                  setCustomLabel((prev) => ({
                    ...prev,
                    neuware: e.target.checked,
                  }))
                }
              />
            </label>

            <label className="custom-label reservierung">
              Reservierung
              <input
                type="checkbox"
                checked={customLabel.reservierung}
                onChange={(e) =>
                  setCustomLabel((prev) => ({
                    ...prev,
                    reservierung: e.target.checked,
                  }))
                }
              />
            </label>

            {customLabel.reservierung && (
              <>
                <label className="custom-label auftragsnummer">
                  Auftrags-Nr:
                  <input
                    type="text"
                    value={customLabel.auftragsnummer}
                    onChange={(e) =>
                      setCustomLabel((prev) => ({
                        ...prev,
                        auftragsnummer: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="custom-label kundenname">
                  Kundenname:
                  <input
                    type="text"
                    value={customLabel.kundenname}
                    onChange={(e) =>
                      setCustomLabel((prev) => ({
                        ...prev,
                        kundenname: e.target.value,
                      }))
                    }
                  />
                </label>
              </>
            )}

            <button
              onClick={() => {
                if (!customLabel["Artikel-Nr. fertig"]) return;
                setLabels((prev) => [...prev, customLabel]);
                setCustomLabel({
                  "Artikel-Nr. fertig": "",
                  quantity: 1,
                  size: "",
                  neuware: false,
                  reservierung: false,
                  kundenname: "",
                  auftragsnummer: "",
                });
                if (items.length > 0) setShowCustomInput(false);
              }}
            >
              Hinzufügen
            </button>
          </div>
        )}

        <div className="label-config-list">
          {labels.map((label, index) => (
            <div className="label-config-item" key={index}>
              <div>
                <strong>{label["Artikel-Nr. fertig"]}</strong> – Menge:{" "}
                <input
                  type="number"
                  min="1"
                  value={label.quantity}
                  onChange={(e) =>
                    updateLabel(index, {
                      quantity: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
                {label["Artikel-Nr. fertig"].startsWith("R-") && (
                  <>
                    {" "}
                    – Größe:{" "}
                    <input
                      type="text"
                      value={label.size}
                      onChange={(e) =>
                        updateLabel(index, { size: e.target.value })
                      }
                    />
                  </>
                )}
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={label.neuware}
                  onChange={(e) =>
                    updateLabel(index, { neuware: e.target.checked })
                  }
                />
                Neuware
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={label.reservierung}
                  onChange={(e) =>
                    updateLabel(index, { reservierung: e.target.checked })
                  }
                />
                Reservierung
              </label>

              {label.reservierung && (
                <div className="reservierung-fields">
                  <label>
                    Auftrags-Nr:{" "}
                    <input
                      type="text"
                      value={label.auftragsnummer}
                      onChange={(e) =>
                        updateLabel(index, { auftragsnummer: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Kundenname:{" "}
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
                      width: "15px",
                      height: "auto",
                      maxWidth: "15px",
                      maxHeight: "15px",
                      objectFit: "contain",
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
                        <strong>{label["Artikel-Nr. fertig"]}</strong>
                      </div>
                      {label["Artikel-Nr. fertig"].startsWith("R-") && (
                        <div className="label-line">Size: {label.size}</div>
                      )}
                      <div className="label-line">{label.kundenname}</div>
                    </>
                  ) : (
                    <>
                      <div className="label-line big-art-nr">
                        {formatArtikelnummer(label["Artikel-Nr. fertig"])}
                      </div>
                      {label["Artikel-Nr. fertig"].startsWith("R-") &&
                        label.size && (
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
    </div>
  );
};

export default NativeLabelGenerator;
