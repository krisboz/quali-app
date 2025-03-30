// CreateTestForm.jsx
import "../styles/CreateTestForm.scss";
import { useState } from "react";
const CreateTestForm = ({ suppliers, colors, newTest, onCreate, onUpdate }) => {
  const [clicked, setClicked] = useState(false);

  const toggleClicked = () => {
    setClicked((prev) => !prev);
  };

  if (!clicked) {
    return (
      <div className="add-test-plus-button">
        <h4>All tests</h4>
        <button onClick={toggleClicked}>+</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onCreate}
      style={{
        marginBottom: "30px",
        border: "1px solid #ccc",
        padding: "20px",
      }}
    >
      <div className="background-button-container">
        <h2>Create New Test</h2>

        <button type="button" onClick={toggleClicked}>
          X
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        <select
          value={newTest.lieferant}
          onChange={(e) => onUpdate("lieferant", e.target.value)}
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={newTest.farbe}
          onChange={(e) => onUpdate("farbe", e.target.value)}
          required
        >
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={newTest.test_month}
          onChange={(e) => onUpdate("test_month", e.target.value)}
          required
          placeholder="Test Month"
          min="1"
          max="12"
          disabled
        />

        <input
          type="number"
          value={newTest.test_year}
          onChange={(e) => onUpdate("test_year", e.target.value)}
          required
          placeholder="Test Year"
          disabled
        />

        <input
          type="text"
          value={newTest.bestellnr}
          onChange={(e) => onUpdate("bestellnr", e.target.value)}
          required
          placeholder="Order Number"
        />

        <input
          type="text"
          value={newTest.bemerkung}
          onChange={(e) => onUpdate("bemerkung", e.target.value)}
          placeholder="Remark"
        />

        <button type="submit">Create Test</button>
      </div>
    </form>
  );
};

export default CreateTestForm;
