import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { filterInspectionsByDateOfInspection } from "../../../api/api";
import "../styles/InspectionsMadeThisWeek.scss";

const InspectionsMadeThisWeek = () => {
  const [inspections, setInspections] = useState([]);
  const [activeRange, setActiveRange] = useState("week");
  const [selectedInspection, setSelectedInspection] = useState(null);

  const getRange = () => {
    const today = new Date();
    if (activeRange === "today") {
      return {
        from: format(startOfDay(today), "yyyy-MM-dd"),
        to: format(endOfDay(today), "yyyy-MM-dd"),
      };
    } else if (activeRange === "week") {
      return {
        from: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        to: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    } else {
      return {
        from: format(startOfMonth(today), "yyyy-MM-dd"),
        to: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    }
  };

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const { from, to } = getRange();
        const res = await filterInspectionsByDateOfInspection(from, to);
        setInspections(res);
      } catch (error) {
        console.error("Error fetching inspections", error);
      }
    };
    fetchInspections();
  }, [activeRange]);

  return (
    <div className="inspections-dashboard">
      <div className="header">
        <h3>Recent Defects</h3>
        <div className="filters">
          {["today", "week", "month"].map((range) => (
            <button
              key={range}
              className={range === activeRange ? "active" : ""}
              onClick={() => setActiveRange(range)}
            >
              {range === "today" ? "Today" : range === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
        <p className="count">{inspections.length} inspections found</p>
      </div>

      <div className="inspection-list">
        {inspections.map((insp) => (
          <div key={insp.id} className="inspection-item" onClick={() => setSelectedInspection(insp)}>
            <div className="top-row">
              <span className="artikelnr">{insp.artikelnr}</span>
              <span className="date">{insp.dateOfInspection}</span>
            </div>
            <div className="lieferant">{insp.lieferant?.trim() || "Unbekannter Lieferant"}</div>
          </div>
        ))}
      </div>

      {selectedInspection && (
        <div className="modal" onClick={() => setSelectedInspection(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Inspection Details</h2>
            {Object.entries(selectedInspection).map(([key, value]) => (
              <div className="detail-row" key={key}>
                <span className="label">{key}</span>
                <span className="value">{value?.toString() || "—"}</span>
              </div>
            ))}
            <button className="close-btn" onClick={() => setSelectedInspection(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsMadeThisWeek;
