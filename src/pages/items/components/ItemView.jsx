import { useState, useEffect } from "react";
import "../styles/ItemView.scss";
import { searchAuswertungen } from "../../../api/api";
import { fetchStichproben } from "../../../api/stichproben";
import StichprobenDisplayTable from "../../stichprobe/StichprobenDisplayTable";

function orderByLieferanten(orders) {
  const grouped = {};

  orders.forEach((order) => {
    const lieferant = order.Firma;
    if (grouped[lieferant]) {
      grouped[lieferant]++;
    } else {
      grouped[lieferant] = 1;
    }
  });

  return Object.entries(grouped).map(([lieferant, count]) => ({
    lieferant,
    count,
  }));
}

const ItemView = ({ selectedItem, closeModal }) => {
  console.log("PROŽDRLJIVAC", { selectedItem });

  const [orders, setOrders] = useState([]);
  const [stichproben, setStichproben] = useState([]);
  const [orderLieferanten, setOrderLieferanten] = useState(null);

  useEffect(() => {
    /**
     *     beleg,
    firma,
    werkauftrag,
    artikelnr,
    termin,
    terminFrom,
    terminTo,
    artikelnrfertig,
    page = 1,
    limit = 100,
    pagesOff,
     */
    const fetchOrders = async () => {
      try {
        const orders = await searchAuswertungen({
          artikelnrfertig: selectedItem.Artikelnummer,
          pagesOff: true,
        });
        setOrders(orders.rows);
        const grouped = orderByLieferanten(orders.rows);
        console.log({ grouped });
        setOrderLieferanten(grouped);

        console.log(orders);
      } catch (error) {
        console.log("Error", error);
      }
    };

    const fetchStich = async () => {
      //artikelnr
      try {
        const fetchedStichproben = await fetchStichproben({
          artikelnr: selectedItem.Artikelnummer,
        });
        setStichproben(fetchedStichproben);
        console.log(fetchedStichproben);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchOrders();
    fetchStich();
  }, []);
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>
          &times;
        </button>
        <div className="big-art-nr-container">
          <p>{selectedItem.Artikelnummer}</p>
          <p className="artikelgruppe">{selectedItem.Artikelgruppe}</p>
        </div>
        <div className="item-info-container">
          <p className="description"> {selectedItem.Bezeichnung}</p>

          <div className="production-details">
            <p className="">{selectedItem.Lieferantenname}</p>
          </div>
        </div>

        <div className="recent-orders">
          <table>
            <thead>
              <tr>
                <th>Termin</th>
                <th>Beleg</th>
                <th>Lieferant</th>
                <th>Werkauftrag</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.Termin}</td>
                  <td
                    onClick={(e) =>
                      navigator.clipboard.writeText(order.Artikelnummer)
                    }
                    className="copy-on-click-p"
                  >
                    {order.Beleg}
                  </td>
                  <td>{order.Firma}</td>
                  <td
                    onClick={(e) =>
                      navigator.clipboard.writeText(order.Werkauftrag)
                    }
                    className="copy-on-click-p"
                  >
                    {order.Werkauftrag}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stichproben-for-item">
          <StichprobenDisplayTable data={stichproben} />
        </div>
      </div>
    </div>
  );
};

export default ItemView;
