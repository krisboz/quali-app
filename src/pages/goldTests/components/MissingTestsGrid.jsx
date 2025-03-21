// MissingTestsGrid.jsx
const MissingTestsGrid = ({ suppliers, colors, missing, currentMonth, currentYear }) => {
    const handleCellClick = (lieferant, farbe) => {
      console.log(`${lieferant}, ${farbe}`);
    };
  
    return (
      <>
        <h3>Missing Tests for {currentMonth}/{currentYear}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Lieferant</th>
              {colors.map(color => <th key={color}>{color}</th>)}
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier}>
                <td>{supplier}</td>
                {colors.map(color => {
                  const isMissing = missing.some(item => 
                    item.lieferant === supplier && item.farbe === color
                  );
                  return (
                    <td
                      key={color}
                      onClick={() => handleCellClick(supplier, color)}
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: isMissing ? 'lightcoral' : 'lightgreen',
                      }}
                    >
                      {isMissing ? '-' : '✓'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };
  
  export default MissingTestsGrid;