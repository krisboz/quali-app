import { useState, useEffect } from "react";
import "../styles/OrderDetails.scss";
import { IoClose, IoPrint } from "react-icons/io5";
import InspectionInput from "./InspectionInput";
import { searchQualityReportsByAuftragsnummer } from "../../../api/api";
import { toast } from "react-toastify";
import EtiketGenerator from "./../../../components/EtiketGenerator/EtiketGenerator";


const OrderDetails = ({ chosenOrder, setChosenOrder }) => {
  const [clickedItem, setClickedItem] = useState(null);
  const [inspections, setInspections] = useState(null);
  const [printItems, setPrintItems] = useState(false);

  useEffect(() => {
    if (chosenOrder && chosenOrder.orderNumber) {
      const loadInspections = async (orderNumber) => {
        try {
          const inspections = await searchQualityReportsByAuftragsnummer(
            chosenOrder.orderNumber
          );
          setInspections(inspections);
        } catch (err) {
          console.log("Error", err);
          toast.error(err.message);
        }
      };
      loadInspections(chosenOrder.orderNumber);
    }
  }, [chosenOrder]);

  const togglePrintItems = () => {
    setPrintItems(prev=>!prev)
  }


  const handleRowClick = (e, index) => {
    const clickedItem = chosenOrder.items[index];

    // Check if item is already inspected
    const isInspected = inspections?.some(
      (inspection) => inspection.artikelnr === clickedItem["Artikel-Nr. fertig"]
    );

    if (!isInspected) {
      setClickedItem(clickedItem);
    }
  };

  // Check if specific item is inspected
  const isItemInspected = (item) => {
    return inspections?.some(
      (inspection) => inspection.artikelnr === item["Artikel-Nr. fertig"]
    );
  };

  const renderTableRows = () => {
    return chosenOrder.items.map((item, index) => {
      const isInspected = isItemInspected(item);

      return (
        <tr
          key={item.id || index}
          onClick={(e) => handleRowClick(e, index)}
          className={isInspected ? "inspected-row" : ""}
          style={{
            cursor: isInspected ? "not-allowed" : "pointer",
            backgroundColor: isInspected ? "#f5f5f5" : "transparent",
          }}
          title={isInspected ? "Already inspected" : null}
        >
          <td>{item["Artikel-Nr. fertig"] || ""}</td>
          <td>{item["Einzelpreis"] || ""}</td>
          <td>{item["Farbe"] || ""}</td>
          <td>{item["G-Preis"] || ""}</td>
          <td>{item["Größe"] || ""}</td>
          <td>{item["Menge offen"] || 0}</td>
          <td>{item["Termin"] || ""}</td>
          <td>{item["Werkauftrag"] || ""}</td>
          <td>{item["urspr. Menge"] || ""}</td>
        </tr>
      );
    });
  };

  const setInspectionsOptimistically = (newEntry) => {
    setInspections((prev) => [...prev, newEntry]);
  };

  const generateInputForEtiketGenerator = () => {
  
    const items = chosenOrder.items;

    console.log("ITEMS", items);
    const arrayToInput = items.map((item) => ({
      code: item["Artikel-Nr. fertig"],
      size: item["Größe"],
      quantity: item["Menge offen"] < 10 ? item["Menge offen"] : 10,
    }));

    return arrayToInput;
  };

  return (
    <div className="detailed-order-preview">
      {printItems && (
        <EtiketGenerator toggleFunction={togglePrintItems} dataToPrint={generateInputForEtiketGenerator()} />
      )}
      <div className="close-button-container">
        <button onClick={(e) => setChosenOrder(null)}>
          <IoClose />
        </button>
      </div>

      <div className="detailed-order-content">
        <div className="detailed-order-title">
          <h1>{chosenOrder.orderNumber}</h1>
          <h2>{chosenOrder.firma}</h2>
          <button onClick={() => togglePrintItems()}><IoPrint/></button>
        </div>

        <div className="detailed-items-container">
          <div className="detailed-items-title">
            <h2>Items</h2>
          </div>
          <div className="detailed-items-table">
            <table>
              <thead>
                <tr>
                  <th>Artikel-Nr. fertig</th>
                  <th>Einzelpreis</th>
                  <th>Farbe</th>
                  <th>G-Preis</th>
                  <th>Größe</th>
                  <th>Menge offen</th>
                  <th>Termin</th>
                  <th>Werkauftrag</th>
                  <th>urspr. Menge</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        </div>
      </div>

      {clickedItem && (
        <div className="inspection-input-container">
          <InspectionInput
            chosenOrder={chosenOrder}
            clickedItem={clickedItem}
            setClickedItem={setClickedItem}
            setInspectionsOptimistically={setInspectionsOptimistically}
          />
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
