import { useState, useEffect } from "react";
import { getDiamondItems } from "../../../api/auswertung";
import {
  parse,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
} from "date-fns";
import "../styles/DiamondScreeningPreview.scss";
import { IoMdRefresh as Reset } from "react-icons/io";
import { IoMdArrowRoundBack as Prev, IoMdArrowRoundForward as Next  } from "react-icons/io";

const DiamondScreeningPreview = () => {
  const [comingItems, setComingItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [itemCount, setItemCount] = useState(null)

  const [selectedBeleg, setSelectedBeleg] = useState(null);
  const [modalItems, setModalItems] = useState([]);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchDiamondItems = async () => {
      try {
        const res = await getDiamondItems(currentMonth, currentYear);
        if (res?.items) {
          setComingItems(res.items);
        }
      } catch (error) {
        console.error("error fetching diamond items", error);
      }
    };

    fetchDiamondItems();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    const filtered = comingItems.filter((item) => {
      const terminDate = parse(item.Termin, "dd.MM.yyyy", new Date());
      return isWithinInterval(terminDate, { start, end });
    });
    setItemCount(filtered.length)
    const grouped = Object.values(
      filtered.reduce((acc, item) => {
        const key = item.Beleg;
        if (!acc[key]) {
          acc[key] = {
            Beleg: key,
            Firma: item.Firma?.trim(),
            count: 0,
          };
        }
        acc[key].count += 1;
        return acc;
      }, {})
    );

    setGroupedItems(grouped);
  }, [comingItems, currentDate]);

  const goToPrevWeek = () => setCurrentDate((d) => addWeeks(d, -1));
  const goToNextWeek = () => setCurrentDate((d) => addWeeks(d, 1));
  const resetToNow = () => setCurrentDate(new Date());

  const displayWeek = `${startOfWeek(currentDate, { weekStartsOn: 1 }).toLocaleDateString()} - ${endOfWeek(currentDate, { weekStartsOn: 1 }).toLocaleDateString()}`;

  const handleRowClick = (beleg) => {
    const itemsForBeleg = comingItems.filter((item) => item.Beleg === beleg);
    console.log({itemsForBeleg})
    setModalItems(itemsForBeleg);
    setSelectedBeleg(beleg);
  };

  const closeModal = () => {
    setSelectedBeleg(null);
    setModalItems([]);
  };

  return (
    <div className="diamond-wrapper">
      <div className="diamond-title">
        <h2> Diamond Items Due This Week  <button className="week-control reset" onClick={resetToNow}><Reset/></button>
</h2>
      <p>Items: {itemCount}</p>
      </div>

      <div className="diamond-controls">
        <button className="week-control previous" onClick={goToPrevWeek}><Prev/></button>
        <p>        (Week of {displayWeek})</p>
        <button className="week-control next" onClick={goToNextWeek}><Next/></button>
      </div>

      {groupedItems.length === 0 ? (
        <div className="diamond-empty">No items this week.</div>
      ) : (
        <ul className="diamond-list">
          {groupedItems.map((group) => (
            <li
              key={group.Beleg}
              className="diamond-item"
              onClick={() => handleRowClick(group.Beleg)}
            >
              <div className="diamond-beleg">{group.Beleg}</div>
              <div className="diamond-firma">{group.Firma}</div>
              <div className="diamond-count">Items: {group.count}</div>
            </li>
          ))}
        </ul>
      )}

      {selectedBeleg && (
        <div className="diamond-modal-overlay" onClick={closeModal}>
          <div className="diamond-modal" onClick={(e) => e.stopPropagation()}>
            <div className="diamond-modal-header">
              <h3>Order Details: {selectedBeleg}</h3>
              <button className="diamond-modal-close" onClick={closeModal}>✕</button>
            </div>
           <table className="diamond-modal-table">
  <thead>
    <tr>
      <th>Werkauftrag</th>
      <th>Artikel-Nr.</th>
      <th>Menge Offen</th>
    </tr>
  </thead>
  <tbody>
    {modalItems.map((item, index) => (
      <tr key={index}>
        <td>{item.Werkauftrag}</td>
        <td>{item["Artikel-Nr. fertig"]}</td>
        <td>{item["Menge offen"]}</td>
      </tr>
    ))}
  </tbody>
</table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondScreeningPreview;
