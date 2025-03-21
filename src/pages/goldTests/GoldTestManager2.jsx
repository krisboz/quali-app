import { useState, useEffect } from 'react';
import { goldTestsService } from '../../api/goldTests'; // Adjust import path
import { toast } from 'react-toastify';

const GoldTestManager = () => {
  const suppliers = ['Adoma', 'Breuning', 'Sisti', 'Rösch', 'Schofer'];
  const colors = ['RG', 'YG', 'WG'];

  // State management
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    lieferant: '',
    farbe: '',
    year: '',
    month: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0
  });

  const [missing, setMissing] = useState([]); // State for storing missing tests

  const [newTest, setNewTest] = useState({
    lieferant: '',
    farbe: 'RG',
    test_month: '',   // Empty initially
    test_year: '',    // Empty initially
    bestellnr: '',
    bemerkung: ''
  });

  // Set current month and year for the new test on mount
  useEffect(() => {
    const currentDate = new Date();
    setNewTest(prevState => ({
      ...prevState,
      test_month: currentDate.getMonth() + 1, // Months are 0-indexed, so add 1
      test_year: currentDate.getFullYear()
    }));
  }, []);

  // Fetch tests on mount and filter change
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await goldTestsService.getTests(
          filters,
          pagination.page,
          pagination.limit
        );
        console.log({ response });

        setTests(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.meta.total,
          totalPages: response.meta.totalPages
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMissing = async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      try {
        const result = await goldTestsService.getMissingTests(year, month);
        console.log({ result });
        setMissing(result.missingTests); // Save missing tests data to state
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTests();
    fetchMissing();
  }, [filters, pagination.page]);

  // Form handlers
// Form handlers
const handleCreateTest = async (e) => {
  e.preventDefault();
  try {
    // Send the request to the API
    const createdTest = await goldTestsService.createTest(newTest);

    console.log({createdTest, tests})
    // Add the new test to the state
    setTests(prevTests => [newTest, ...prevTests]);

    // Reset the form (except for test_month and test_year)
    setNewTest(prevState => ({
      ...prevState,
      lieferant: '',
      farbe: 'RG',
      bestellnr: '',
      bemerkung: ''
    }));
    toast.success("Gold test successfully added.")
  } catch (err) {
    // Handle errors
    setError(err.message);
    toast.error(err.message); // Assuming you're using a toast library for notifications
  }
};
  // Table actions
  const handleDelete = async (id) => {
    if (window.confirm('Delete this test entry?')) {
      try {
        await goldTestsService.deleteTest(id);
        setTests(tests.filter(test => test.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateRemark = async (id, newRemark) => {
    try {
      await goldTestsService.updateTestRemark(id, newRemark);
      setTests(tests.map(test =>
        test.id === id ? { ...test, bemerkung: newRemark } : test
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCellClick = (lieferant, farbe) => {
    console.log(lieferant, farbe);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gold Tests Management</h1>

      {/* Error Display */}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      {/* Create New Test Form */}
      <form onSubmit={handleCreateTest} style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '20px' }}>
        <h2>Create New Test</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          <select
            value={newTest.lieferant}
            onChange={e => setNewTest({ ...newTest, lieferant: e.target.value })}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={newTest.farbe}
            onChange={e => setNewTest({ ...newTest, farbe: e.target.value })}
            required
          >
            {colors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            value={newTest.test_month}
            onChange={e => setNewTest({ ...newTest, test_month: e.target.value })}
            required
            placeholder="Test Month (1-12)"
            min="1"
            max="12"
            disabled // Disable the input
          />

          <input
            type="number"
            value={newTest.test_year}
            onChange={e => setNewTest({ ...newTest, test_year: e.target.value })}
            required
            placeholder="Test Year"
            disabled // Disable the input
          />

          <input
            type="text"
            value={newTest.bestellnr}
            onChange={e => setNewTest({ ...newTest, bestellnr: e.target.value })}
            required
            placeholder="Order Number"
          />

          <input
            type="text"
            value={newTest.bemerkung}
            onChange={e => setNewTest({ ...newTest, bemerkung: e.target.value })}
            placeholder="Remark"
          />

          <button type="submit">Create Test</button>
        </div>
      </form>

      {/* Missing Tests Table */}
      <h3>Missing Tests for {new Date().toLocaleDateString()}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>Lieferant</th>
            {colors.map(color => (
              <th key={color}>{color}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier}>
              <td>{supplier}</td>
              {colors.map(color => {
                const isMissing = missing.some(
                  (item) => item.lieferant === supplier && item.farbe === color
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
                    {isMissing ? '-' : 'X'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tests List */}
      {loading ? (
        <div>Loading tests...</div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px' }}>
            Showing {tests.length} of {pagination.total} tests
          </div>

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
                      onChange={e => handleUpdateRemark(test.id, e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDelete(test.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
              Previous
            </button>

            <span>Page {pagination.page} of {pagination.totalPages}</span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldTestManager;