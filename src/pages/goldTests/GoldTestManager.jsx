import { useState, useEffect } from 'react';
import { goldTestsService } from '../../api/goldTests'; // Adjust import path

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
  
  // Form state
  const [newTest, setNewTest] = useState({
    lieferant: '',
    farbe: 'RG',
    test_month: '',
    bestellnr: '',
    bemerkung: ''
  });

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
      const month =  new Date().getMonth() + 1
      const year = new Date().getFullYear()
      try {
          const result = await goldTestsService.getMissingTests(year, month)
          console.log({result})
      } catch (err) {
        setError(err.message);
      } 
    }

    fetchTests();
    fetchMissing()
  }, [filters, pagination.page]);

  // Form handlers
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await goldTestsService.createTest(newTest);
      setNewTest({
        lieferant: '',
        farbe: 'RG',
        test_month: '',
        bestellnr: '',
        bemerkung: ''
      });
      // Refresh list
      setPagination(prev => ({ ...prev }));
    } catch (err) {
      setError(err.message);
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
            type="date"
            value={newTest.test_month}
            onChange={e => setNewTest({ ...newTest, test_month: e.target.value })}
            required
            placeholder="Test Month"
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

      {/* Filters */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filters.lieferant}
            onChange={e => setFilters({ ...filters, lieferant: e.target.value })}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.farbe}
            onChange={e => setFilters({ ...filters, farbe: e.target.value })}
          >
            <option value="">All Colors</option>
            {colors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            value={filters.year}
            onChange={e => setFilters({ ...filters, year: e.target.value })}
            placeholder="Year"
          />

          <input
            type="number"
            value={filters.month}
            onChange={e => setFilters({ ...filters, month: e.target.value })}
            placeholder="Month"
            min="1"
            max="12"
          />
        </div>
      </div>

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
                  <td>{new Date(test.test_month).toLocaleDateString()}</td>
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
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldTestManager;