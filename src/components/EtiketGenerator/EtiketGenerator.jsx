import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./EtiketGenerator.scss";

const EtiketGenerator = ({ dataToPrint }) => {
  const [inputValue, setInputValue] = useState("");
  const [valuesToPrint, setValuesToPrint] = useState([]);
  const [ringSize, setRingSize] = useState("54");
  const [quantity, setQuantity] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isRing, setIsRing] = useState(false);

  useEffect(() => {
    if (dataToPrint) {
      setValuesToPrint(
        Array.isArray(dataToPrint) ? dataToPrint : [dataToPrint]
      );
    }
  }, [dataToPrint]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsRing(value.toLowerCase().startsWith("r-"));
  };

  const handleAddValue = (e) => {
    e.preventDefault();
    if (!inputValue) return;

    setValuesToPrint((prev) => [
      ...prev,
      {
        code: inputValue,
        size: isRing ? ringSize : null,
        quantity: +quantity,
      },
    ]);

    setInputValue("");
    setRingSize("54");
    setQuantity(1);
    setIsRing(false);
  };

  const handleDeleteSingle = (index) => {
    setValuesToPrint((prev) => prev.filter((_, i) => i !== index));
  };

  const splitSku = (sku) => {
    const lastHyphenIndex = sku.lastIndexOf("-");
    if (lastHyphenIndex === -1) return [sku];
    const suffix = sku.slice(lastHyphenIndex);
    return suffix.toLowerCase().endsWith("g")
      ? [sku.slice(0, lastHyphenIndex), suffix]
      : [sku];
  };

  const handlePrintLabels = () => {
    const doc = new jsPDF("h", "mm", [38, 25]);

    valuesToPrint.forEach((item, itemIndex) => {
      const { code, size, quantity } = item;
      const isRingItem = code.toLowerCase().startsWith("r-");

      for (let i = 0; i < quantity; i++) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);

        // Main SKU part
        doc.text(code, 2, 10, { maxWidth: 34 });

        // Ring size if applicable
        if (isRingItem && size) {
          doc.setFontSize(10);
          doc.text(`Size: ${size}`, 2, 20);
        }

        // Add new page if not last label
        if (i < quantity - 1 || itemIndex < valuesToPrint.length - 1) {
          doc.addPage();
        }
      }
    });

    window.open(doc.output("bloburl"), "_blank");
  };

  const handleQuantitySubmit = (e, index) => {
    e.preventDefault();
    const newQuantity = +e.target.elements.quantity.value;
    if (newQuantity > 0) {
      setValuesToPrint((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, quantity: newQuantity } : item
        )
      );
      setEditingIndex(null);
    }
  };

  return (
    <div className="etiket-generator">
      <form onSubmit={handleAddValue}>
        <input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Artikkelnummer..."
          required
        />

        {isRing && (
          <input
            type="text"
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
            placeholder="Ringgröße"
          />
        )}

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button type="submit">Hinzufügen</button>
      </form>

      <button onClick={handlePrintLabels}>Etiketten drucken</button>

      {valuesToPrint.length > 0 && (
        <button onClick={() => setValuesToPrint([])}>Alle löschen</button>
      )}

      <div className="preview-list">
        {valuesToPrint.map((item, index) => (
          <div key={index} className="preview-item">
            <div className="sku-info">
              <div>{item.code}</div>
              {item.size !== " " && <div>Größe: {item.size}</div>}
            </div>

            <div className="item-actions">
              <button onClick={() => handleDeleteSingle(index)}>×</button>

              {editingIndex === index ? (
                <form onSubmit={(e) => handleQuantitySubmit(e, index)}>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue={item.quantity}
                    autoFocus
                  />
                </form>
              ) : (
                <span onClick={() => setEditingIndex(index)}>
                  {item.quantity}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EtiketGenerator;
