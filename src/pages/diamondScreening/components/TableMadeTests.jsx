import { useState } from "react";

const TableMadeTests = () => {
  const dummyData = [
    {
      liefertermin: "2025-03-10",
      lieferant: "Adoma",
      bestellnr: "B-25-1234",
      artikelnr: "P-MB-p-rg",

      quantity: 1,
      bemerkung: "Phosphorescence noticed",
    },
    {
      liefertermin: "2025-03-15",
      lieferant: "Breuning",
      bestellnr: "B-25-4321",
      artikelnr: "14-R-CV77-13-PrL-p",
      quantity: 2,
      bemerkung:
        "Possible synthetic diamonds, sent to a lab to do further testing",
    },
    {
      liefertermin: "2025-03-20",
      lieferant: "Rösch",
      bestellnr: "B-25-2134",
      artikelnr: "B-AD-alt-Cl-rg",
      quantity: 1,
      bemerkung: "Gives a questionable test result, sent for further testing",
    },
    {
      liefertermin: "2025-03-25",
      lieferant: "Sisti",
      bestellnr: "B-25-4132",
      artikelnr: "BA-Gyp-Cl-16-rg",
      quantity: 1,
      bemerkung: "Phosphorescence detected",
    },
    {
      liefertermin: "2025-03-30",
      lieferant: "Schofer",
      bestellnr: "B-25-1111",
      artikelnr: "B-BOU-Camel-Cl-rg",
      quantity: 7,
      bemerkung: "Unsure device results, sent to further testing to a lab.",
    },
  ];

  // State for filtering and pagination
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

  // Filter data based on filter inputs
  const filteredData = dummyData.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      const itemValue = String(item[key]).toLowerCase();
      const filterValue = filters[key].toLowerCase();
      return itemValue.includes(filterValue);
    });
  });

  // Paginate data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

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
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{item.liefertermin}</td>
                <td style={{ padding: "8px" }}>{item.lieferant}</td>
                <td style={{ padding: "8px" }}>{item.bestellnr}</td>
                <td style={{ padding: "8px" }}>{item.artikelnr}</td>
                <td style={{ padding: "8px" }}>{item.quantity}</td>
                <td style={{ padding: "8px" }}>{item.bemerkung}</td>
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
