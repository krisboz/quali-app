import { useState, useEffect } from "react";
import { pdf, Document, Page, Text, Image } from "@react-pdf/renderer"; // Add Image import
import "./EtiketGenerator.scss";

const LabelsDocument = ({ values, neuware }) => (
  <Document>
    {values.flatMap((item, itemIndex) =>
      Array.from({ length: item.quantity }, (_, i) => (
        <Page
          key={`${itemIndex}-${i}`}
          size={[107.716, 70.866]}
          style={{ padding: 0, margin: 0 }}
        >
          {neuware && (
            <Image
              src="./logo.webp" // Path to your PNG file
              style={{
                position: "absolute",
                left: 2,  // Adjust positioning as needed
                top: 2,
                width: 5,  // Set appropriate size
                height: 5,
              }}
            />
          )}
          <Text
            style={{
              position: "absolute",
              left: 5.67,
              top: 28.35,
              fontSize: 12,
              fontFamily: "Helvetica",
            }}
          >
            {item.code}
          </Text>
          {item.size && (
            <Text
              style={{
                position: "absolute",
                left: 5.67,
                top: 56.69,
                fontSize: 10,
                fontFamily: "Helvetica",
              }}
            >
              Size: {item.size}
            </Text>
          )}
        </Page>
      ))
    )}
  </Document>
);

// Rest of the component remains the same...
const EtiketGenerator = ({ toggleFunction, dataToPrint }) => {
  const [inputValue, setInputValue] = useState("");
  const [valuesToPrint, setValuesToPrint] = useState([]);
  const [ringSize, setRingSize] = useState("54");
  const [quantity, setQuantity] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isRing, setIsRing] = useState(false);
  const [isNeuware, setIsNeuware] = useState(false);

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

  const handlePrintLabels = async () => {
    try {
      const blob = await pdf(
        <LabelsDocument values={valuesToPrint} neuware={isNeuware} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
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
      <div className="close-btn-container">
        <button onClick={toggleFunction}>X</button>
      </div>
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

        <label className="neuware-checkbox">
          <input
            type="checkbox"
            checked={isNeuware}
            onChange={(e) => setIsNeuware(e.target.checked)}
          />
          Neuware
        </label>

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
              {item.size && <div>Größe: {item.size}</div>}
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