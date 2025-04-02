import { useState, useEffect } from "react";
import { goldTestsService } from "../../../api/goldTests";
import { toast } from "react-toastify";
import "../styles/GoldTestsTable.scss";

const MonthYearInput = ({ month, setMonth, year, setYear }) => {
  return (
    <div className="gold-test-month-year-input">
      <h3>Gold Tests</h3>
      <input
        type="number"
        className="gt-month-input"
        value={month}
        step={1}
        min={1}
        max={12}
        onChange={(e) => setMonth(e.target.value)}
      />

      {" / "}
      <input
        type="number"
        className="gt-year-input"
        value={year}
        step={1}
        min={2024}
        max={year}
        onChange={(e) => setYear(e.target.value)}
      />
    </div>
  );
};

const RenderTableCell = ({ test }) => {
  if (!test) {
    return <p>-</p>;
  }

  return (
    <div className="populated-gold-test-cell">
      <p className="gold-test-date">      {test.created_at ? test.created_at.split(" ")[0].split("-").reverse().join("."): "Now"}
      </p>
 <p className="gold-made-test-cell" style={{ color: `${test.bemerkung ? "red" : "green"}` }}>
      {test.bestellnr.toUpperCase()}
    </p>
    </div>
   
  );
};

const GoldTestsTable = ({isDemoOnly = false}) => {
  const suppliers = ["Adoma", "Breuning", "Sisti", "Rösch", "Schofer"];
  const colors = ["RG", "YG", "WG"];
  const [cellClicked, setCellClicked] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newBestellnr, setNewBestellnr] = useState("");
  const [newRemarks, setNewRemarks] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await goldTestsService.getTestsByMonth(month, year);
        setTests(response.data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchTests();
  }, [month, year]);

  const handleCellClick = (lieferant, farbe, test) => {
    if(isDemoOnly) {
      return;
    }
    //If test is false, theyve clicked an empty cell
    //  opens up the form to input new bestellnr and bemerkung
    //otherwise its one that has already been filled
    //onclick renders a box showing details
    if (!test) {
      console.log(`${lieferant}, ${farbe}, `, { test });
      setSelectedTest(null);
      setCellClicked({ lieferant, farbe });
      return;
    }
    console.log({ test });
    setCellClicked(false);
    setSelectedTest(test);
    //
  };

  const handleCloseCellExtraWindow = () => {
    setCellClicked(false);
    setSelectedTest(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!cellClicked) {
      toast.error("No cell chosen");
      return;
    }
    const testData = {
      lieferant: cellClicked.lieferant,
      farbe: cellClicked.farbe,
      test_month: month,
      test_year: year,
      bestellnr: newBestellnr,
      bemerkung: newRemarks,
    };
    try {
      const res = await goldTestsService.createTest(testData);
      //Optimistic updating
      setTests([...tests, { ...testData, createdAt: "Now" }]);
      toast.success(
        `Successfully added ${testData.farbe} to ${testData.lieferant}`
      );
      console.log("testData to put through to the backend", testData, { res });
      handleCloseCellExtraWindow();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="gold-tests-container">
      <MonthYearInput
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
      />
      {selectedTest && (
        <div className="single-gold-test-container">
          <div className="single-gold-test">
            <div
              className={`close-btn-container  ${
                selectedTest.bemerkung && "gold-failed"
              }`}
            >
              <p>
                {selectedTest.created_at
                  .split(" ")[0]
                  .split("-")
                  .reverse()
                  .join("-")}
              </p>
              <button type="button" onClick={handleCloseCellExtraWindow}>
                X
              </button>
            </div>

            <div className="basic-info">
              <p>{selectedTest.lieferant}</p>
              <p style={{ fontWeight: "bold" }}>
                {selectedTest.bestellnr.toUpperCase()}
              </p>
              <p>{selectedTest.farbe}</p>
            </div>
            {selectedTest.bemerkung && (
              <div className="bemerkung-container">
                <p>Reported problem</p>
                <p className="bemerkung-content">{selectedTest.bemerkung}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {cellClicked && (
        <div className="quick-grid-input-container">
          <div className="qgi-inner-container">
            <div className="close-btn-container">
              <button type="button" onClick={handleCloseCellExtraWindow}>
                X
              </button>
            </div>
            <div className="qgi-content">
              <div className="clicked-qgi-cell">
                <p>{cellClicked.lieferant}</p>
                <p className={`color-header ${cellClicked.farbe}`}>
                  {cellClicked.farbe}
                </p>
              </div>
              <form onSubmit={handleFormSubmit}>
                <label>
                  Bestellnr:
                  <input
                    type="text"
                    value={newBestellnr}
                    onChange={(e) => setNewBestellnr(e.target.value)}
                  />
                </label>
                <label>
                  Remark
                  <input
                    type="text"
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                  />
                </label>
                <button>Submit</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <table className="gold-tests-table">
        <thead>
          <tr>
            <th>Lieferant</th>
            {colors.map((color) => (
              <th key={color}>{color}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier}>
              <td className="supplier-name">{supplier}</td>
              {colors.map((color) => {
                const test = tests.find(
                  (t) => t.lieferant === supplier && t.farbe === color
                );

                return (
                  <td
                    key={color}
                    className="test-info"
                    onClick={() => handleCellClick(supplier, color, test)}
                  >
                    {<RenderTableCell test={test} />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoldTestsTable;
