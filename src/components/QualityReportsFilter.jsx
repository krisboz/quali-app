import React from "react";
import "../styles/components/QualityReportsFilter.scss";

const QualityReportsFilter = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="report-filter-container">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
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
          <tr>
            <td>
              <input
                type="date"
                name="liefertermin"
                value={filters.liefertermin || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <select
                name="lieferant"
                value={filters.lieferant || ""}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="Adoma">Adoma</option>
                <option value="Breuning">Breuning</option>
                <option value="Giloy">Giloy</option>
                <option value="Rösch">Rösch</option>
                <option value="Schofer">Schofer</option>
                <option value="Sisti">Sisti</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                name="auftragsnummer"
                value={filters.auftragsnummer || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="artikelnr"
                value={filters.artikelnr || ""}
                onChange={handleChange}
              />
            </td>
          
            <td>
              <input
                type="text"
                name="mangel"
                value={filters.mangel || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <select
                name="mangelgrad"
                value={filters.mangelgrad || ""}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </td>
            <td>
              <select
                name="mangelgrund"
                value={filters.mangelgrund || ""}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="Oberfläche verkratzt/Poren">Oberfläche verkratzt/Poren</option>
                <option value="Stein Defekt">Stein Defekt</option>
                <option value="Falsche Teile / Zusammensetzung">Falsche Teile / Zusammensetzung</option>
                <option value="Falsche Länge">Falsche Länge</option>
                <option value="Gold/Stein Toleranz">Gold/Stein Toleranz</option>
                <option value="Andere">Andere</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                name="mitarbeiter"
                value={filters.mitarbeiter || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <input
                type="date"
                name="lieferantInformiertAm"
                value={filters.lieferantInformiertAm || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="loesung"
                value={filters.loesung || ""}
                onChange={handleChange}
              />
            </td>
            <td></td> 
            <td>
              <button onClick={(e) => setFilters({})}>Clear</button> 
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default QualityReportsFilter;