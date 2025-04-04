import { useState, useEffect } from "react";
import {
  getDiamondScreenings,
  deleteDiamondScreening,
} from "../../../api/diamondScreenings";
import { MdDeleteOutline } from "react-icons/md";


const TableMadeTests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    liefertermin: "",
    lieferant: "",
    bestellnr: "",
    artikelnr: "",
    quantity: "",
    bemerkung: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDiamondScreenings();
        setData(response.data);
        console.log("screening data", response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleDelete = async (id) => {
    console.log(id)
    try {
      await deleteDiamondScreening(id);
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete the item.");
    }
  };

  const filteredData = data.filter((item) =>
    Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      const itemValue = String(item[key]).toLowerCase();
      const filterValue = filters[key].toLowerCase();
      return itemValue.includes(filterValue);
    })
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setCurrentPage(1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        className="title-container"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <h3>Screened Diamond Items</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            margin: "20px 0",
          }}
        >
          <thead>
            <tr>
              {Object.keys(filters).map((column) => (
                <th
                  key={column}
                  style={{ padding: "8px", border: "1px solid #ddd" }}
                >
                  <input
                    type="text"
                    placeholder={`Filter ${column}`}
                    value={filters[column]}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    style={{ width: "100%", padding: "4px" }}
                  />
                </th>
              ))}
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{item.liefertermin}</td>
                <td style={{ padding: "8px" }}>{item.lieferant}</td>
                <td style={{ padding: "8px" }}>{item.bestellnr}</td>
                <td style={{ padding: "8px" }}>{item.artikelnr}</td>
                <td style={{ padding: "8px" }}>{item.quantity}</td>
                <td style={{ padding: "8px" }}>{item.bemerkung}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <MdDeleteOutline/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          No matching records found
        </div>
      )}
    </div>
  );
};

export default TableMadeTests;
