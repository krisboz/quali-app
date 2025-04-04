import React, { useState } from "react";
import "../styles/DiamondItemsInput.scss";
import {createDiamondScreeningsBatch} from "../../../api/diamondScreenings";
import {toast} from "react-toastify";

const DiamondItemsInput = ({ items }) => {
  console.log({items})
  const [screenedItems, setScreenedItems] = useState([]);
  const [quantities, setQuantities] = useState(
    items.reduce((acc, item) => {
      acc[item.id] = 1; // Start all quantities at 1
      return acc;
    }, {})
  );
  const [bemerkungen, setBemerkungen] = useState({}); // To store bemerkung for each item

  const handleCheckboxChange = (item) => {
    setScreenedItems((prev) => {
      const exists = prev.find((screened) => screened.id === item.id);
      if (exists) {
        return prev.filter((screened) => screened.id !== item.id);
      }
      return [
        ...prev,
        {
          id: item.id,
          liefertermin: item.Termin,
          lieferant: extractLieferant(item.Firma.trim()),
          bestellnr: item.Beleg,
          artikelnr: item[" Artikel-Nr. fertig"] || "Unknown",
          quantity: quantities[item.id] || 1, // Default quantity is 1
          bemerkung: bemerkungen[item.id] || "", // Add bemerkung if exists
        },
      ];
    });
  };

  const handleQuantityChange = (id, value) => {
    // Ensure the value stays within the bounds of 1 and urspr. Menge
    const newQuantity = Math.max(1, Math.min(value, items.find((item) => item.id === id)["urspr. Menge"]));

    setQuantities((prev) => {
      const updatedQuantities = { ...prev, [id]: newQuantity };
      // Update screenedItems with the new quantity value
      setScreenedItems((prevItems) =>
        prevItems.map((screened) =>
          screened.id === id ? { ...screened, quantity: newQuantity } : screened
        )
      );
      return updatedQuantities;
    });
  };

  const handleBemerkungChange = (id, value) => {
    setBemerkungen((prev) => {
      const updatedBemerkungen = { ...prev, [id]: value };
      setScreenedItems((prevItems) =>
        prevItems.map((screened) =>
          screened.id === id ? { ...screened, bemerkung: value } : screened
        )
      );
      return updatedBemerkungen;
    });
  };

  const handleDeleteItem = (id) => {
    setScreenedItems((prev) => prev.filter((screened) => screened.id !== id));
  };

  const handleDeleteAll = () => {
    setScreenedItems([]);
  };

  function extractLieferant(firma) {
    const suppliers = ["Adoma", "Breuning", "Sisti", "Rösch", "Schofer", "Scheingraber"];
    return suppliers.find((sup) => firma.toLowerCase().includes(sup.toLowerCase())) || "Unknown";
  }

  const submitScreenings = async () => {
    try {
      const enrichedScreenedItems = screenedItems.map((item) => ({
        ...item,
        ursprMenge: items.find(i => i.id === item.id)?.["urspr. Menge"] || 0,
      }));

      const res = await createDiamondScreeningsBatch(enrichedScreenedItems);
      
      toast.success(
        `Success: ${res.insertedCount} inserted, ${res.updatedCount} updated`
      );
      
      // Refresh parent data and clear selection
      setScreenedItems([]);
      setQuantities({});
      setBemerkungen({});

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="diamond-items">
      {screenedItems.length > 0 && (
        <div className="selection-preview">
          <div className="selection-header">
            <h3>Selected Items for Screening</h3>
            <button onClick={handleDeleteAll} className="delete-all-button">
              Delete All
            </button>
          </div>
          <div className="preview-list">
            {screenedItems.map((item) => (
              <div key={item.id} className="preview-item">
                <div className="diamond-screening-delete-button-container">
                <button onClick={() => handleDeleteItem(item.id)} className="delete-item-button">
                  X
                </button>
                </div>
               
                <p>
                  <strong>{item.artikelnr}</strong>
                </p>
                <p>
                  <strong>Firma:</strong> {item.lieferant}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                {item.bemerkung && (
                  <div className="screening-bemerkung-container">
                    <p>{item.bemerkung}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={submitScreenings}>Submit Screenings</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Artikel-Nr</th>
            <th>Beleg</th>
            <th>Firma</th>
            <th>Termin</th>
            <th>Menge</th>
            <th>Bemerkung</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(item)}
                  checked={screenedItems.some((s) => s.id === item.id)}
                />
              </td>
              <td>{item[" Artikel-Nr. fertig"]}</td>
              <td>{item.Beleg}</td>
              <td>{item.Firma}</td>
              <td>{item.Termin}</td>
              <td>
                <input
                  type="number"
                  value={quantities[item.id] || 1} // Set the input value from quantities state
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                  min={1}
                  max={item["urspr. Menge"]}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={bemerkungen[item.id] || ""} // Get current bemerkung or empty string
                  onChange={(e) => handleBemerkungChange(item.id, e.target.value)} // Update bemerkung on change
                  placeholder="Add remark"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiamondItemsInput;
