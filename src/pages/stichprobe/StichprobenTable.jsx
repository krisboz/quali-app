import React, { useState, useContext } from "react";
import { updateStichprobe, deleteStichprobe } from "../../api/stichproben";
import AuthContext from "../../context/AuthContext";
import "./Stichproben.scss";
import PrintStichprobeButton from "./PrintStichprobeButton";
import { FaEdit as Edit } from "react-icons/fa";
import { FaTrashCan as Delete } from "react-icons/fa6";

const StichprobenTable = ({ data, setData }) => {
  const { user } = useContext(AuthContext);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});



  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      await updateStichprobe(editingId, editFormData);
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...editFormData } : item
        )
      );
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      alert("Update failed: " + err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm("Bist du sicher, dass du diesen Eintrag löschen möchtest?")
    ) {
      try {
        await deleteStichprobe(id);
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert("Löschen fehlgeschlagen: " + err);
      }
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Artikelnummer</th>
          <th>Firma</th>
          <th>Order Number</th>
          <th>Status</th>
          <th>Mitarbeiter</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan="6" style={{ textAlign: "center" }}>
              Keine Einträge gefunden
            </td>
          </tr>
        )}
        {Array.isArray(data) &&
          data.map((item) => (
            <tr key={item.id}>
            
                <>
                  <td
                    onClick={() =>
                      navigator.clipboard.writeText(item.artikelnr)
                    }
                    className="copy-on-click-p"
                  >
                    {item.artikelnr}
                  </td>
                  <td>{item.firma}</td>
                  <td
                    onClick={() =>
                      navigator.clipboard.writeText(item.orderNumber)
                    }
                    className="copy-on-click-p"
                  >
                    {item.orderNumber}
                  </td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>{item.mitarbeiter}</td>
                  <td className="action-container">
                
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="action-svg-button delete-stichproben"
                    >
                      <Delete />
                    </button>
                    <PrintStichprobeButton entry={item} />{" "}
                  </td>
                </>
              
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default StichprobenTable;
