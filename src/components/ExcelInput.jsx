import { useState } from "react";
import * as XLSX from "xlsx";
import { submitAuswertungData } from "../api/api";
import { toast } from "react-toastify";

const ExcelInput = ({ setAuswertungen }) => {
  const [data, setData] = useState(null);

  const normalizeSheetData = (sheetData) => {
    return sheetData.map((row) => {
      return {
        ...row,
        Einzelpreis: row["Einzelpreis"] / 100,
        "G-Preis": row["G-Preis"] / 100,
        "Menge offen": row["Menge offen"] / 100,
        "urspr. Menge": row["urspr. Menge"] / 100,
      };
    });
  };

  const cleanSheetData = (sheetData) => {
    return sheetData.map((row) => {
      const cleanedRow = {};
      for (let key in row) {
        const trimmedKey = key.trim();
        cleanedRow[trimmedKey] = row[key];
      }
      return cleanedRow;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      const cleanedData = cleanSheetData(sheetData);
      const normalizedData = normalizeSheetData(cleanedData); // Your divide-by-100 logic
      setData(normalizedData);
      setAuswertungen(normalizedData);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (data) {
      try {
        await submitAuswertungData(data);
        // Optionally clear the data state or show a success message
        setData(null);
        setAuswertungen(null);
        toast.success("Auswertung table uploaded successfully!");
      } catch (error) {
        console.error("Error submitting data:", error);
        // Handle the error, e.g., show an error message to the user
        alert("Error submitting data. Please try again.");
        toast.error(`Error submitting data: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleSubmit} disabled={!data}>
        Submit
      </button>
    </div>
  );
};

export default ExcelInput;
