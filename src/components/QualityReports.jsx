import React, { useEffect, useState } from "react";
import { fetchQualityReports, deleteQualityReport, updateQualityReport } from "../api/api"; // Import API calls
import Loading from "./Loading";

const QualityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editedData, setEditedData] = useState({}); // Holds the data being edited

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await fetchQualityReports();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report.id);
    setEditedData(report); // Populate form with selected row's data
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteQualityReport(id);
        setReports(reports.filter((report) => report.id !== id));
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateQualityReport(editingReport, editedData);
      setEditingReport(null);
      loadReports(); // Reload reports after update
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Quality Reports</h2>
      {reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <th style={thStyle}>Liefertermin</th>
                <th style={thStyle}>Lieferant</th>
                <th style={thStyle}>Auftragsnummer</th>
                <th style={thStyle}>Artikelnummer</th>
                <th style={thStyle}>Produkt</th>
                <th style={thStyle}>Mangel</th>
                <th style={thStyle}>Mangelgrad</th>
                <th style={thStyle}>Mangelgrund</th>
                <th style={thStyle}>Mitarbeiter</th>
                <th style={thStyle}>Lieferant informiert am</th>
                <th style={thStyle}>Lösung</th>
                <th style={thStyle}>Fotos</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: "1px solid #ddd" }}>
                  {editingReport === report.id ? (
                    <>
                      <td><input type="text" name="liefertermin" value={editedData.liefertermin || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="lieferant" value={editedData.lieferant || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="auftragsnummer" value={editedData.auftragsnummer || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="artikelnr" value={editedData.artikelnr || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="produkt" value={editedData.produkt || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="mangel" value={editedData.mangel || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="mangelgrad" value={editedData.mangelgrad || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="mangelgrund" value={editedData.mangelgrund || ""} onChange={handleChange} /></td>
                      <td>{report.mitarbeiter}</td> {/* Read-only field */}
                      <td><input type="text" name="lieferantInformiertAm" value={editedData.lieferantInformiertAm || ""} onChange={handleChange} /></td>
                      <td><input type="text" name="loesung" value={editedData.loesung || ""} onChange={handleChange} /></td>
                      <td>{report.fotos ? "Images" : "No images"}</td>
                      <td>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setEditingReport(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{report.liefertermin || ""}</td>
                      <td style={tdStyle}>{report.lieferant || ""}</td>
                      <td style={tdStyle}>{report.auftragsnummer || ""}</td>
                      <td style={tdStyle}>{report.artikelnr || ""}</td>
                      <td style={tdStyle}>{report.produkt || ""}</td>
                      <td style={tdStyle}>{report.mangel || ""}</td>
                      <td style={tdStyle}>{report.mangelgrad || ""}</td>
                      <td style={tdStyle}>{report.mangelgrund || ""}</td>
                      <td style={tdStyle}>{report.mitarbeiter || ""}</td>
                      <td style={tdStyle}>{report.lieferantInformiertAm || ""}</td>
                      <td style={tdStyle}>{report.loesung || ""}</td>
                      <td style={tdStyle}>
                        {report.fotos ? (
                          <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {JSON.parse(report.fotos).map((foto, index) => (
                              <img
                                key={index}
                                src={foto}
                                alt={`Upload ${index}`}
                                style={{ width: "50px", height: "50px", margin: "3px", borderRadius: "3px", objectFit: "cover" }}
                              />
                            ))}
                          </div>
                        ) : (
                          "No images"
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => handleEdit(report)}>Edit</button>
                        <button onClick={() => handleDelete(report.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Table styles
const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #ddd",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "8px",
  borderBottom: "1px solid #ddd",
  verticalAlign: "middle",
};

export default QualityReports;
