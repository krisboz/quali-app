// TestsList.jsx
import { MdDeleteOutline as DeleteIcon} from "react-icons/md";

const TestsList = ({ tests, loading, onDelete, onUpdateRemark }) => {
  if (loading) return <div>Loading tests...</div>;

  console.log({ tests });

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Color</th>
            <th>Test Month</th>
            <th>Created At</th>
            <th>Order No.</th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.id}>
              <td>{test.lieferant}</td>
              <td>{test.farbe}</td>
              <td>
                {test.test_month}/{test.test_year}
              </td>
              <td>
                {test.created_at.split(" ")[0].split("-").reverse().join(".")}{" "}
                {test.created_at
                  .split(" ")[1]
                  .split(":")
                  .slice(0, -1)
                  .join(":")  }
              </td>
              <td>{test.bestellnr}</td>
              <td>
                <input
                  type="text"
                  value={test.bemerkung}
                  onChange={(e) => onUpdateRemark(test.id, e.target.value)}
                  style={{ width: "150px" }}
                />
              </td>
              <td>
                <button onClick={() => onDelete(test.id)}><DeleteIcon/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestsList;
