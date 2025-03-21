// GoldTestManager.jsx
import { useState, useEffect } from 'react';
import { goldTestsService } from '../../api/goldTests';
import { toast } from 'react-toastify';
import CreateTestForm from './components/CreateTestForm';
import MissingTestsGrid from './components/MissingTestsGrid';
import TestsList from './components/TestsList';
import Pagination from './components/Pagination';

const GoldTestManager = () => {
  // Constants
  const suppliers = ['Adoma', 'Breuning', 'Sisti', 'Rösch', 'Schofer'];
  const colors = ['RG', 'YG', 'WG'];

  // State management
  const [state, setState] = useState({
    tests: [],
    loading: false,
    error: '',
    filters: { lieferant: '', farbe: '', year: '', month: '' },
    pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    missing: [],
    newTest: {
      lieferant: '',
      farbe: 'RG',
      test_month: new Date().getMonth() + 1,
      test_year: new Date().getFullYear(),
      bestellnr: '',
      bemerkung: ''
    }
  });

  // Derived values
  const currentDate = new Date();

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const [testsResponse, missingResponse] = await Promise.all([
          goldTestsService.getTests(state.filters, state.pagination.page, state.pagination.limit),
          goldTestsService.getMissingTests(currentDate.getFullYear(), currentDate.getMonth() + 1)
        ]);

        setState(prev => ({
          ...prev,
          tests: testsResponse.data,
          missing: missingResponse.missingTests,
          pagination: {
            ...prev.pagination,
            total: testsResponse.meta.total,
            totalPages: testsResponse.meta.totalPages
          }
        }));
      } catch (err) {
        setState(prev => ({ ...prev, error: err.message }));
        toast.error(err.message);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [state.filters, state.pagination.page]);

  // Handlers
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const createdTest = await goldTestsService.createTest(state.newTest);
      setState(prev => ({
        ...prev,
        tests: [createdTest, ...prev.tests],
        newTest: { ...prev.newTest, lieferant: '', farbe: 'RG', bestellnr: '', bemerkung: '' }
      }));
      toast.success("Gold test successfully added.");
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message }));
      toast.error(err.message);
    }
  };

  const handleUpdate = (field, value) => {
    setState(prev => ({ 
      ...prev, 
      newTest: { ...prev.newTest, [field]: value } 
    }));
  };

  // Render
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gold Tests Management</h1>
      
      {state.error && <div style={{ color: 'red', margin: '10px 0' }}>{state.error}</div>}

      <CreateTestForm
        suppliers={suppliers}
        colors={colors}
        newTest={state.newTest}
        onCreate={handleCreateTest}
        onUpdate={handleUpdate}
      />

      <MissingTestsGrid
        suppliers={suppliers}
        colors={colors}
        missing={state.missing}
        currentMonth={currentDate.getMonth() + 1}
        currentYear={currentDate.getFullYear()}
      />

      <TestsList
        tests={state.tests}
        loading={state.loading}
        onDelete={async (id) => {
          await goldTestsService.deleteTest(id);
          setState(prev => ({ ...prev, tests: prev.tests.filter(test => test.id !== id) }));
        }}
        onUpdateRemark={async (id, remark) => {
          await goldTestsService.updateTestRemark(id, remark);
          setState(prev => ({
            ...prev,
            tests: prev.tests.map(test => 
              test.id === id ? { ...test, bemerkung: remark } : test
            )
          }));
        }}
      />

      <Pagination
        currentPage={state.pagination.page}
        totalPages={state.pagination.totalPages}
        onPageChange={(page) => setState(prev => ({
          ...prev,
          pagination: { ...prev.pagination, page }
        }))}
      />
    </div>
  );
};

export default GoldTestManager;