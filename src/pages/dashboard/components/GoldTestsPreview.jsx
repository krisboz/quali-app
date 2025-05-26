import { useState, useEffect } from "react";
import { goldTestsService } from "../../../api/goldTests";
import "../styles/GoldTestsPreview.scss"; // Assuming this is the SCSS file

const GoldTestsPreview = () => {
  const [missingTests, setMissingTests] = useState([]);

useEffect(() => {
  const fetchMissing = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0–11

    const res = await goldTestsService.getMissingTests(currentYear, currentMonth);
    setMissingTests(res?.missingTests || []);
  };

  fetchMissing();
}, []);


  const grouped = missingTests.reduce((acc, { lieferant, farbe }) => {
    if (!acc[lieferant]) acc[lieferant] = [];
    acc[lieferant].push(farbe);
    return acc;
  }, {});

  return (
    <div className="gold-tests-preview">
      <h2 className="gold-tests-preview__title">Missing Gold Tests - May 2025</h2>
      <p className="gold-tests-preview__summary">
        <strong>{missingTests.length}</strong> gold tests are missing across{" "}
        <strong>{Object.keys(grouped).length}</strong> suppliers.
      </p>

      <ul className="gold-tests-preview__list">
        {Object.entries(grouped).map(([supplier, colors]) => (
          <li key={supplier} className="gold-tests-preview__supplier">
            <span className="gold-tests-preview__supplier-name">{supplier}</span>
            <div className="gold-tests-preview__colors">
              {colors.map((color, idx) => (
                <span key={idx} className={`gold-tests-preview__color gold-tests-preview__color--${color.toLowerCase()}`}>
                  {color}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoldTestsPreview;
