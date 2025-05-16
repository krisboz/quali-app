import React, { useEffect, useState, useContext } from "react";
import { fetchStichproben, updateStichprobe, deleteStichprobe } from "../../api/stichproben";
import AuthContext from "../../context/AuthContext";

const Stichproben = () => {
    const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchStichproben();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData({
      artikelnr: item.artikelnr,
      firma: item.firma,
      orderNumber: item.orderNumber,
      status: item.status,
    mitarbeiter: user?.username || "", // force mitarbeiter from logged-in user
    });
  };

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
      prev.map((item) => (item.id === editingId ? { ...item, ...editFormData } : item))
    );
    setEditingId(null);
    setEditFormData({});
  } catch (err) {
    alert("Update failed: " + err);
  }
};

  const handleDeleteClick = async (id) => {
    if (window.confirm("Bist du sicher, dass du diesen Eintrag löschen möchtest?")) {
      try {
        await deleteStichprobe(id);
        setData((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert("Löschen fehlgeschlagen: " + err);
      }
    }
  };

  if (loading) return <p>Loading stichproben...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <h1>Stichproben Übersicht</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
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
          {data.map((item) => (
            <tr key={item.id}>
              {editingId === item.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="artikelnr"
                      value={editFormData.artikelnr}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="firma"
                      value={editFormData.firma}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="orderNumber"
                      value={editFormData.orderNumber}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleInputChange}
                    >
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="needs_review">needs_review</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="mitarbeiter"
                      value={editFormData.mitarbeiter}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <button onClick={handleSaveClick}>Save</button>{" "}
                    <button onClick={handleCancelClick}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.artikelnr}</td>
                  <td>{item.firma}</td>
                  <td>{item.orderNumber}</td>
                  <td>{item.status}</td>
                  <td>{item.mitarbeiter}</td>
                  <td>
                    <button onClick={() => handleEditClick(item)}>Edit</button>{" "}
                    <button onClick={() => handleDeleteClick(item.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Stichproben;
