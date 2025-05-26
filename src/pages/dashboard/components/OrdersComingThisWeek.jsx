import { useState, useEffect } from "react";
import { searchAuswertungen } from "../../../api/api";
import "../styles/OrdersComingThisWeek.scss";
import { IoMdRefresh as Reset } from "react-icons/io";
import { IoMdArrowRoundBack as Prev, IoMdArrowRoundForward as Next  } from "react-icons/io";



import {
  startOfWeek,
  addWeeks,
  addDays,
  format,
} from "date-fns";

const OrdersComingThisWeek = () => {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false)

  const getDateRange = (offset = 0) => {
    const baseMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const targetMonday = addWeeks(baseMonday, offset);
    const targetFriday = addDays(targetMonday, 4);
    return {
      from: format(targetMonday, "yyyy-MM-dd"),
      to: format(targetFriday, "yyyy-MM-dd"),
      displayFrom: format(targetMonday, "dd.MM.yyyy"),
      displayTo: format(targetFriday, "dd.MM.yyyy"),
    };
  };

  const fetchAuswertungen = async () => {
    const { from, to } = getDateRange(weekOffset);
    try {
      const res = await searchAuswertungen({
        terminFrom: from,
        terminTo: to,
        pagesOff: "true",
      });

      const grouped = Object.values(
        res.rows.reduce((acc, item) => {
          const key = item.Beleg.trim();
          if (!acc[key]) {
            acc[key] = {
              Beleg: key,
              Firma: item.Firma.trim(),
              items: [],
            };
          }
          acc[key].items.push(item);
          return acc;
        }, {})
      );
      setGroupedOrders(grouped);
    } catch (error) {
      console.log("Error in Orders", error);
    }
  };

  useEffect(() => {
        setLoading(true)

    fetchAuswertungen();
        setLoading(false)

  }, [weekOffset]);

  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);

  const { displayFrom, displayTo } = getDateRange(weekOffset);

  const determineHeadingTitle = () => {
    if(weekOffset === 0) {
      return "Orders Due This Week"
    }
    if(weekOffset === 1) {
      return "Orders Due Next Week"
    }
    if(weekOffset === -1) {
      return ("Orders Due Last Week")
    }

    else return `Orders Due ${weekOffset>0?"Next":"Last"} Week ${weekOffset}`


  }

  return (
    <div className="orders-coming-this-week">
      <div className="title-container">
        <h2>{determineHeadingTitle()}  {"  "}  <button className="week-control reset" onClick={() => setWeekOffset(0)}><Reset/></button>  </h2>
                   
<p>Orders: {groupedOrders.length}</p>
      </div>

      <div className="controls">
        <button className="week-control previous" onClick={handlePrevWeek}><Prev/>  </button>
        <span>
          Time range shown <br></br>
         <strong>{displayFrom}</strong> -{" "}
          <strong>{displayTo}</strong>
        </span>
        <button className="week-control next" onClick={handleNextWeek}>  <Next/></button>
      </div>

      <div className="order-groups">
        {groupedOrders.length === 0 ? (
          <p>No orders found for this week.</p>
        ) : (
          groupedOrders.map((group) => (
            <div
              key={group.Beleg}
              className="order-summary"
              onClick={() => setSelectedGroup(group)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <p className="termin-preview">{group.items[0].Termin}</p>
              <div className="basic-preview-info">
       <strong> {group.Beleg} </strong> 
              <strong>{group.Firma}</strong>
              <p>{group.items.length} items</p>
              </div>
       
            </div>
          ))
        )}
      </div>

      {selectedGroup && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedGroup.Firma} — {selectedGroup.Beleg}</h2>
            <ul>
              {selectedGroup.items.map((item) => (
                <li key={item.id} style={{ marginBottom: "8px" }}>
                  <strong>{item["Artikel-Nr. fertig"]}</strong> — Termin: {item.Termin}
                </li>
              ))}
            </ul>
            <button
              style={{ marginTop: "16px" }}
              onClick={() => setSelectedGroup(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersComingThisWeek;
