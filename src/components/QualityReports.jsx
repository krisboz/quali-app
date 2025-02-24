import React, { useState, useEffect } from "react";
import QualityReportsFilter from "./QualityReportsFilter";
import { fetchQualityReports, deleteQualityReport, updateQualityReport } from "../api/api"; // Import API calls
import Loading from "./Loading";
import QualityReportImage from "./QualityReportImages";

const QualityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await fetchQualityReports();
      console.log(data)
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report.id);
    setEditedData(report);
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

  console.log({filteredReports})

  return (
    <div>
      <h2>Quality Reports</h2>
      <QualityReportsFilter filters={filters} setFilters={setFilters} />
      {filteredReports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
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
                <tr key={report.id}>
                  <td>{report.liefertermin}</td>
                  <td>{report.lieferant}</td>
                  <td>{report.auftragsnummer}</td>
                  <td>{report.artikelnr}</td>
                  <td>{report.produkt}</td>
                  <td>{report.mangel}</td>
                  <td>{report.mangelgrad}</td>
                  <td>{report.mangelgrund}</td>
                  <td>{report.mitarbeiter}</td>
                  <td>{report.lieferantInformiertAm}</td>
                  <td>{report.loesung}</td>
                  <td>{report.fotos ?                              <QualityReportImage images={JSON.parse(report.fotos)} />
 : "No images"}</td>
                  <td>
                    <button onClick={() => handleEdit(report)}>Edit</button>
                    <button onClick={() => handleDelete(report.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QualityReports;
