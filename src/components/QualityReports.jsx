import React, { useState, useEffect } from "react";
import QualityReportsFilter from "./QualityReportsFilter";
import { fetchQualityReports, deleteQualityReport, updateQualityReport } from "../api/api";
import Loading from "./Loading";
import QualityReportImage from "./QualityReportImages";
import { jwtDecode } from "jwt-decode";

const QualityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [filters, setFilters] = useState({});
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  

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
    setEditedData({ ...report });
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
      loadReports();
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleCancel = () => {
    setEditingReport(null);
    setEditedData({});
  };

  const filteredReports = reports.filter(report => {
    return (
      (!filters.liefertermin || report.liefertermin.includes(filters.liefertermin)) &&
      (!filters.lieferant || report.lieferant === filters.lieferant) &&
      (!filters.artikelnr || report.artikelnr.includes(filters.artikelnr)) &&
      (!filters.auftragsnummer || report.auftragsnummer.includes(filters.auftragsnummer))
    );
  });

  const uniqueLieferanten = [...new Set(reports.map(report => report.lieferant))];
  console.log({uniqueLieferanten, reports})

  if (loading) return <Loading />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quality Reports</h2>
      <QualityReportsFilter 
        filters={filters} 
        setFilters={setFilters} 
        uniqueLieferanten={uniqueLieferanten}
      />
      
      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Liefertermin</th>
              <th>Lieferant</th>
              <th>Auftragsnummer</th>
              <th>Artikelnummer</th>
              <th>Produkt</th>
              <th>Mangel</th>
              <th>Mangelgrad</th>
              <th>Mangelgrund</th>
              <th>Mitarbeiter</th>
              <th>Lieferant informiert am</th>
              <th>Lösung</th>
              <th>Fotos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #ddd" }}>
                {/* Liefertermin */}
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="date"
                      name="liefertermin"
                      value={editedData.liefertermin || ""}
                      onChange={handleChange}
                      style={{ padding: "4px" }}
                    />
                  ) : (
                    report.liefertermin
                  )}
                </td>

                {/* Lieferant */}
                <td>
                  {editingReport === report.id ? (
                    <select
                      name="lieferant"
                      value={editedData.lieferant || ""}
                      onChange={handleChange}
                      style={{ padding: "4px" }}
                    >
                      {uniqueLieferanten.map((lieferant) => (
                        <option key={lieferant} value={lieferant}>
                          {lieferant}
                        </option>
                      ))}
                    </select>
                  ) : (
                    report.lieferant
                  )}
                </td>

                {/* Auftragsnummer */}
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      name="auftragsnummer"
                      value={editedData.auftragsnummer || ""}
                      onChange={handleChange}
                      style={{ width: "120px", padding: "4px" }}
                    />
                  ) : (
                    report.auftragsnummer
                  )}
                </td>

                {/* Artikelnummer */}
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      name="artikelnr"
                      value={editedData.artikelnr || ""}
                      onChange={handleChange}
                      style={{ width: "120px", padding: "4px" }}
                    />
                  ) : (
                    report.artikelnr
                  )}
                </td>

                {/* Produkt */}
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      name="produkt"
                      value={editedData.produkt || ""}
                      onChange={handleChange}
                      style={{ padding: "4px" }}
                    />
                  ) : (
                    report.produkt
                  )}
                </td>

                {/* Mangel */}
                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="mangel"
                      value={editedData.mangel || ""}
                      onChange={handleChange}
                      style={{ padding: "4px", minWidth: "150px" }}
                    />
                  ) : (
                    report.mangel
                  )}
                </td>

                {/* Mangelgrad */}
                <td>
                  {editingReport === report.id ? (
                    <select
                      name="mangelgrad"
                      value={editedData.mangelgrad || ""}
                      onChange={handleChange}
                      style={{ padding: "4px" }}
                    >
                      <option value="1">1</option>
                      <option value="Major">2</option>
                    
                    </select>
                  ) : (
                    report.mangelgrad
                  )}
                </td>

                {/* Mangelgrund */}
                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="mangelgrund"
                      value={editedData.mangelgrund || ""}
                      onChange={handleChange}
                      style={{ padding: "4px", minWidth: "150px" }}
                    />
                  ) : (
                    report.mangelgrund
                  )}
                </td>

                {/* Mitarbeiter */}
                <td>
                  {editingReport === report.id ? (
                    decoded.username
                  ) : (
                    report.mitarbeiter
                  )}
                </td>

                {/* Lieferant informiert am */}
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="date"
                      name="lieferantInformiertAm"
                      value={editedData.lieferantInformiertAm || ""}
                      onChange={handleChange}
                      style={{ padding: "4px" }}
                    />
                  ) : (
                    report.lieferantInformiertAm
                  )}
                </td>

                {/* Lösung */}
                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="loesung"
                      value={editedData.loesung || ""}
                      onChange={handleChange}
                      style={{ padding: "4px", minWidth: "150px" }}
                    />
                  ) : (
                    report.loesung
                  )}
                </td>

                {/* Fotos */}
                <td>
                  {report.fotos ? (
                    <QualityReportImage images={JSON.parse(report.fotos)} />
                  ) : (
                    "No images"
                  )}
                </td>

                {/* Actions */}
                <td>
                  {editingReport === report.id ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={handleSave} style={{ background: "#4CAF50", color: "white" }}>
                        Save
                      </button>
                      <button onClick={handleCancel} style={{ background: "#f44336", color: "white" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEdit(report)}>Edit</button>
                      <button onClick={() => handleDelete(report.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QualityReports;