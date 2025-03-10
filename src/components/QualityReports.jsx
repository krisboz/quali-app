import React, { useState, useEffect } from "react";
import QualityReportsFilter from "./QualityReportsFilter";
import { fetchQualityReports, deleteQualityReport, updateQualityReport } from "../api/api";
import Loading from "./Loading";
import QualityReportImage from "./QualityReportImages";
import { jwtDecode } from "jwt-decode";
import "../styles/components/QualityReports.scss";

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

  if (loading) return <Loading />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="quality-reports-container">
      <h2>Quality Reports</h2>
      <QualityReportsFilter 
        filters={filters} 
        setFilters={setFilters} 
        uniqueLieferanten={uniqueLieferanten}
      />
      
      <div className="scroll-container">
        <table className="reports-table">
          <thead>
            <tr className="table-header">
              <th>Liefertermin</th>
              <th>Lieferant</th>
              <th>Auftragsnummer</th>
              <th>Artikelnummer</th>
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
              <tr key={report.id} className="table-row">
                <td>
                  {editingReport === report.id ? (
                    <input
                      type="date"
                      name="liefertermin"
                      value={editedData.liefertermin || ""}
                      onChange={handleChange}
                      className="editable-input"
                    />
                  ) : (
                    report.liefertermin
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <select
                      name="lieferant"
                      value={editedData.lieferant || ""}
                      onChange={handleChange}
                      className="select-input"
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

                <td>
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      name="auftragsnummer"
                      value={editedData.auftragsnummer || ""}
                      onChange={handleChange}
                      className="auftragsnummer-input"
                    />
                  ) : (
                    report.auftragsnummer
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <input
                      type="text"
                      name="artikelnr"
                      value={editedData.artikelnr || ""}
                      onChange={handleChange}
                      className="artikelnr-input"
                    />
                  ) : (
                    report.artikelnr
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="mangel"
                      value={editedData.mangel || ""}
                      onChange={handleChange}
                      className="textarea-input"
                    />
                  ) : (
                    report.mangel
                  )}
                </td>

                <td className="center-content">
                  {editingReport === report.id ? (
                    <select
                      name="mangelgrad"
                      value={editedData.mangelgrad || ""}
                      onChange={handleChange}
                      className="select-input"
                    >
                      <option value="1">1</option>
                      <option value="Major">2</option>
                    </select>
                  ) : (
                    report.mangelgrad
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="mangelgrund"
                      value={editedData.mangelgrund || ""}
                      onChange={handleChange}
                      className="textarea-input"
                    />
                  ) : (
                    report.mangelgrund
                  )}
                </td>

                <td>
                  {editingReport === report.id ? decoded.username : report.mitarbeiter}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <input
                      type="date"
                      name="lieferantInformiertAm"
                      value={editedData.lieferantInformiertAm || ""}
                      onChange={handleChange}
                      className="editable-input"
                    />
                  ) : (
                    report.lieferantInformiertAm
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <textarea
                      name="loesung"
                      value={editedData.loesung || ""}
                      onChange={handleChange}
                      className="textarea-input"
                    />
                  ) : (
                    report.loesung
                  )}
                </td>

                <td>
                  {report.fotos ? (
                    <QualityReportImage images={JSON.parse(report.fotos)} />
                  ) : (
                    "No images"
                  )}
                </td>

                <td>
                  {editingReport === report.id ? (
                    <div className="actions-container">
                      <button className="save-button" onClick={handleSave}>
                        Save
                      </button>
                      <button className="cancel-button" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="actions-container">
                      <button className="edit-delete-button" onClick={() => handleEdit(report)}>
                        Edit
                      </button>
                      <button className="edit-delete-button" onClick={() => handleDelete(report.id)}>
                        Delete
                      </button>
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