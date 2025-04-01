import { useState, useEffect } from "react";
import { getDiamondItems } from "../../../../api/auswertung";
import { getDiamondScreenings } from "../../../../api/diamondScreenings";
import "../styles/DiamondScreening.scss";

const DiamondScreening = ({ selectedMonth, selectedYear }) => {
  const formattedMonth = String(selectedMonth).padStart(2, "0"); // Ensure MM format

  const [diamondItems, setDiamondItems] = useState([]);
  const [madeTests, setMadeTests] = useState([]);
  const [problematicTests, setProblematicTests] = useState([]);

  useEffect(() => {
    const filterProblematicTests = (tests) => {
      return tests.filter(test => test.bemerkung && test.bemerkung.trim() !== '');
    };

    const fetchData = async () => {
      try {
        const liefertermin = `${selectedYear}-${formattedMonth}`;

        const data = await getDiamondItems(formattedMonth, selectedYear);
        const madeTests = await getDiamondScreenings({ liefertermin });

        setDiamondItems(data.items); // Assuming API response structure
        setMadeTests(madeTests.data);
        const problematic = filterProblematicTests(madeTests.data);
        setProblematicTests(problematic);
        console.log("Problematic Tests:", problematic);
      } catch (error) {
        console.error("Error fetching diamond screenings:", error);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  if (madeTests.length === 0) {
    return (
      <div>
        <p>No diamond screenings were performed for the {diamondItems.length} delivered items in {formattedMonth}/{selectedYear}.</p>
      </div>
    );
  }

  return (
    <div className="diamond-screening-container">
      <h2 className="title">Diamond Screening Report</h2>
      <p className="summary">For {formattedMonth}/{selectedYear}, a total of {diamondItems.length} diamond items were delivered.</p>
      <p className="summary">Out of the {diamondItems.length} delivered items, {madeTests.length} underwent screening tests.</p>
      <p className="summary">
        {madeTests.length - problematicTests.length} items passed the tests without any issues.
      </p>
      
      <h3 className="problematic-heading">Problematic Screenings:</h3>
      <div className="problematic-tests">
        {problematicTests.map((test, index) => (
          <div key={index} className="problematic-test">
            <div className="basic-info">
              <p> {test.lieferant}</p>
              <p>{test.bestellnr}</p>
            </div>
            <div className="detailed-info">
              <p> {test.artikelnr}</p>
              <p className="problem-description">{test.bemerkung}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiamondScreening;
