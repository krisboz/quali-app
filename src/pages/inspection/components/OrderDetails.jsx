import { useState } from "react";
import "../styles/OrderDetails.scss";
import { IoClose } from "react-icons/io5";
import InspectionInput from "./InspectionInput";

const OrderDetails = ({ chosenOrder, setChosenOrder }) => {
  const [clickedItem, setClickedItem] = useState(null);


  const handleRowClick  = (e, index) => {
    console.log(chosenOrder.items[index])
    const clickedItem = chosenOrder.items[index]
    setClickedItem(clickedItem)
  }
  // Render the table rows based on chosenOrder.items
  const renderTableRows = () => {
    return chosenOrder.items.map((item, index) => (
      <tr
        key={item.id || index}
        onClick={(e) => handleRowClick(e, index)} // log the index of the item clicked
      >
        <td>{item["Artikel-Nr. fertig"] || ""}</td>
        <td>{item["Einzelpreis"] || ""}</td>
        <td>{item["Farbe"] || ""}</td>
        <td>{item["G-Preis"] || ""}</td>
        <td>{item["Größe"] || ""}</td>
        <td>{item["Menge offen"] || ""}</td>
        <td>{item["Termin"] || ""}</td>
        <td>{item["Werkauftrag"] || ""}</td>
        <td>{item["urspr. Menge"] || ""}</td>
      </tr>
    ));
  };

  return (
    <div className="detailed-order-preview">
      <div className="close-button-container">
        <button onClick={(e) => setChosenOrder(null)}>
          <IoClose />
        </button>
      </div>

      <div className="detailed-order-content">
        <div className="detailed-order-title">
          <h1>{chosenOrder.orderNumber}</h1>
          <h2>{chosenOrder.firma}</h2>
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

      {clickedItem && <div className="inspection-input-container">
        
        <InspectionInput chosenOrder={chosenOrder} clickedItem={clickedItem} setClickedItem={setClickedItem}/></div>}
    </div>
  );
};

export default OrderDetails;
