import { useState } from "react";
import "./DiamondScreeningForm.scss";

const DiamondScreeningForm = ({ orderData }) => {
  const [bestellnr, setBestellnr] = useState("");
  const [artikelnr, setArtikelnr] = useState("");
  const [liefertermin, setLiefertermin] = useState("");
  const [issueType, setIssueType] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState(null);

  const issueOptions = [
    "Phosphorescence detected",
    "Synthetic Diamond",
    "HPHT Treatment",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      bestellnr,
      artikelnr,
      liefertermin,
      issueType,
      notes,
      image,
    });
  };

  return (
    <div className="screening-form">
      <h2>Report Diamond Defect</h2>
      <form onSubmit={handleSubmit}>
        <label>Order Number (Bestellnr)</label>
        <input
          type="text"
          value={bestellnr}
          onChange={(e) => setBestellnr(e.target.value)}
          required
        />

        <label>Article Number (Artikelnr)</label>
        <input
          type="text"
          value={artikelnr}
          onChange={(e) => setArtikelnr(e.target.value)}
          required
        />

        <label>Delivery Date (Liefertermin)</label>
        <input
          type="date"
          value={liefertermin}
          onChange={(e) => setLiefertermin(e.target.value)}
          required
        />

        <label>Issue Type</label>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          required
        >
          <option value="">Select Issue</option>
          {issueOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

        <label>Upload Image</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default DiamondScreeningForm;
