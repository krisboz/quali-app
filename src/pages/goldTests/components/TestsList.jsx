// TestsList.jsx
const TestsList = ({ tests, loading, onDelete, onUpdateRemark }) => {
    if (loading) return <div>Loading tests...</div>;
  
    return (
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Color</th>
              <th>Test Month</th>
              <th>Order No.</th>
              <th>Remark</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test.id}>
                <td>{test.lieferant}</td>
                <td>{test.farbe}</td>
                <td>{test.test_month}/{test.test_year}</td>
                <td>{test.bestellnr}</td>
                <td>
                  <input
                    type="text"
                    value={test.bemerkung}
                    onChange={e => onUpdateRemark(test.id, e.target.value)}
                    style={{ width: '150px' }}
                  />
                </td>
                <td>
                  <button onClick={() => onDelete(test.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default TestsList;