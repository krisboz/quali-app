import React from "react";
import "./Stichproben.scss"; // optional, in case you want styling like .status-pill
import "./StichprobenDisplayTable.scss";
import PrintStichprobeButton from "./PrintStichprobeButton";

const StichprobenDisplayTable = ({ data }) => {
  if(!data) {
    return <div>No Prüfprotokolle gemacht</div>
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Erstellt am</th>
          <th>Order Number</th>
          <th>Firma</th>
          <th>Status</th>
          <th>Mitarbeiter</th>
          <th>Download</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              Keine Daten vorhanden
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>{item.orderNumber}</td>
              <td>{item.firma}</td>
              <td>
                <span className={`status-pill ${item.status}`}>
                  {item.status.replace("_", " ")}
                </span>
              </td>
              <td>{item.mitarbeiter}</td>
              <tr>
                <PrintStichprobeButton entry={item} />
              </tr>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default StichprobenDisplayTable;
