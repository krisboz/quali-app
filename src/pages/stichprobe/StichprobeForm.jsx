import React, { useState, useEffect } from "react";
import "./StichprobeForm.scss";
import { FaCheckCircle as Approved } from "react-icons/fa";
import { FaCircleXmark as Rejected } from "react-icons/fa6";
import { IoWarning as NeedsReview } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import { submitStichprobe } from "../../api/stichproben";
import { toast } from "react-toastify";

// Reusable section component
const Section = ({
  title,
  checks,
  sectionKey,
  data,
  handleCheck,
  handleRemark,
}) => {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        <div className="checkboxes">
          {checks.map((label, idx) => (
            <label key={idx} className="checkbox-item">
              <input
                type="checkbox"
                checked={data.checks.includes(label)}
                onChange={() => handleCheck(sectionKey, label)}
              />
              {label}
            </label>
          ))}
        </div>
        <textarea
          className="remarks"
          placeholder="Bemerkungen"
          value={data.remarks}
          onChange={(e) => handleRemark(sectionKey, e.target.value)}
        />
      </div>
    </div>
  );
};

const StichprobeForm = ({ clickedItem = null, closeForm = null }) => {
  const [formData, setFormData] = useState({
    allgemein: { checks: [], remarks: "" },
    oberflaeche: { checks: [], remarks: "" },
    masse: { checks: [], remarks: "" },
    mechanik: { checks: [], remarks: "" },
    steine: { checks: [], remarks: "" },
    weiter: { checks: [], remarks: "" },
  });

  const [status, setStatus] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState("");

  const [manualData, setManualData] = useState({
    firma: "",
    artikelnr: "",
    orderNumber: "",
  });

  const resetState = () => {
    setFormData({
      allgemein: { checks: [], remarks: "" },
      oberflaeche: { checks: [], remarks: "" },
      masse: { checks: [], remarks: "" },
      mechanik: { checks: [], remarks: "" },
      steine: { checks: [], remarks: "" },
      weiter: { checks: [], remarks: "" },
    });
    setStatus("");
    setManualData({
      firma: "",
      artikelnr: "",
      orderNumber: "",
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setMitarbeiter(decoded.username);
      console.log("USERNAME", decoded.username);
    }
  }, []);

  const handleCheck = (section, label) => {
    setFormData((prev) => {
      const checks = prev[section].checks.includes(label)
        ? prev[section].checks.filter((l) => l !== label)
        : [...prev[section].checks, label];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          checks,
        },
      };
    });
  };

  const handleRemark = (section, text) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        remarks: text,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledForm = {
      status,
      formData,
      basic: {
        artikelnr: clickedItem?.["Artikel-Nr. fertig"] || manualData.artikelnr,
        firma: clickedItem?.["firma"] || manualData.firma,
        orderNumber: clickedItem?.["orderNumber"] || manualData.orderNumber,
      },
      mitarbeiter,
    };

    try {
      const result = await submitStichprobe(filledForm);
      console.log("Submitted with id:", result.id);
      resetState();
      closeForm && closeForm();
      toast.success("Stichprobe successfully submitted");
    } catch (e) {
      console.error("Submit failed:", e);
    }
  };

  return (
    <form className="stichprobe-form" onSubmit={handleSubmit}>
      {closeForm && (
        <div className="close-btn-container">
          {" "}
          <button onClick={closeForm}>Close</button>
        </div>
      )}
      <div className="populated-data">
        <div className="basic-info">
          {clickedItem ? (
            <>
              <p>{clickedItem["firma"]}</p>
              <p className="artikel-nr-stichprobe">
                {clickedItem["Artikel-Nr. fertig"]}
              </p>
              <p>{clickedItem["orderNumber"]}</p>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Firma"
                value={manualData.firma}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    firma: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="Artikel-Nr."
                value={manualData.artikelnr}
                required={true}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    artikelnr: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="Order Number"
                value={manualData.orderNumber}
                onChange={(e) =>
                  setManualData((prev) => ({
                    ...prev,
                    orderNumber: e.target.value,
                  }))
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Section components */}
      <Section
        title="Allgemein"
        sectionKey="allgemein"
        data={formData.allgemein}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={[
          "Alle Elementen vorhanden",
          "Korrekte Zusammensetzung",
          "Stempel vorhanden und korrekt",
          "Goldlegierung passt",
        ]}
      />
      <Section
        title="Oberfläche"
        sectionKey="oberflaeche"
        data={formData.oberflaeche}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={[
          "Gute Oberfläche (Politur)",
          "Keine Kratzer / Matten Stellen",
          "Keine Poren",
          "Rhodium gleichmäßig verteilt, ohne Flecken",
        ]}
      />
      <Section
        title="Maße"
        sectionKey="masse"
        data={formData.masse}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={[
          "Maße stimmen mit dem PIS überein (in Toleranzbereich)",
          "Goldgewicht im Toleranzbereich",
        ]}
      />
      <Section
        title="Mechanik"
        sectionKey="mechanik"
        data={formData.mechanik}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={["Bewegliche Elemente sind beweglich", "Keine offenen Links"]}
      />
      <Section
        title="Steine"
        sectionKey="steine"
        data={formData.steine}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={[
          "Nicht beschädigt/kaputt",
          "Fest gefasst - kein wackeln",
          "Steine sitzen gerade in der Fassung",
          "Gute, saubere Fasskante",
          "Kein kleber vorhanden",
          "Diamanten getestet",
        ]}
      />
      <Section
        title="Weiterer Verlauf"
        sectionKey="weiter"
        data={formData.weiter}
        handleCheck={handleCheck}
        handleRemark={handleRemark}
        checks={[
          "Qualität genehmigt",
          "Zurück an Hersteller",
          "Wird in TCG überarbeitet",
          "Quali OK + Info an Hersteller",
        ]}
      />

      {/* Status selection */}
      <div className="status-selector">
        <h3>Status</h3>
        <div className="status-inputs">
          <label className="status approved">
            <input
              type="radio"
              name="status"
              value="approved"
              required={true}
              checked={status === "approved"}
              onChange={() => setStatus("approved")}
            />
            <Approved /> Approved
          </label>
          <label className="status rejected">
            <input
              type="radio"
              name="status"
              value="rejected"
              checked={status === "rejected"}
              onChange={() => setStatus("rejected")}
            />
            <Rejected /> Rejected
          </label>
          <label className="status needs-review">
            <input
              type="radio"
              name="status"
              value="needs_review"
              checked={status === "needs_review"}
              onChange={() => setStatus("needs_review")}
            />
            <NeedsReview /> Needs Review
          </label>
        </div>
      </div>

      <button type="submit" className="submit-button">
        Absenden
      </button>
    </form>
  );
};

export default StichprobeForm;
