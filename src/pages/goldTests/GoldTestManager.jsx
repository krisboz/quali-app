// GoldTestManager.jsx
import { useState, useEffect } from "react";
import { goldTestsService } from "../../api/goldTests";
import { toast } from "react-toastify";
import CreateTestForm from "./components/CreateTestForm";
import TestsList from "./components/TestsList";
import Pagination from "./components/Pagination";
import GoldTestsTable from "./components/GoldTestsTable";
import { AiOutlineGold as GoldIcon } from "react-icons/ai";

//TODO handle that if there is a remark its a bad one and if none its passed
const GoldTestManager = () => {
  // Constants
  const suppliers = ["Adoma", "Breuning", "Sisti", "Rösch", "Schofer"];
  const colors = ["RG", "YG", "WG"];

  // State management
  const [state, setState] = useState({
    tests: [],
    loading: false,
    error: "",
    filters: { lieferant: "", farbe: "", year: "", month: "" },
    pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    missing: [],
    newTest: {
      lieferant: "",
      farbe: "RG",
      test_month: new Date().getMonth() + 1,
      test_year: new Date().getFullYear(),
      bestellnr: "",
      bemerkung: "",
    },
  });

  //TODO add functionality of setting  customMonth and customYear
  const [customMonth, setCustomMonth] = useState(null);
  const [customYear, setCustomYear] = useState(null);
  const [doneTests, setDoneTests] = useState([]);

  // Derived values
  const currentDate = new Date();

  const setTests = (newTestObj) => {
    setState((prevState) => ({
      ...prevState,
      tests: [...prevState.tests, newTestObj],
    }));
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const [testsResponse, missingResponse] = await Promise.all([
          goldTestsService.getTests(
            state.filters,
            state.pagination.page,
            state.pagination.limit
          ),
          goldTestsService.getMissingTests(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1
          ),
        ]);

        setState((prev) => ({
          ...prev,
          tests: testsResponse.data,
          missing: missingResponse.missingTests,
          pagination: {
            ...prev.pagination,
            total: testsResponse.meta.total,
            totalPages: testsResponse.meta.totalPages,
          },
        }));
      } catch (err) {
        setState((prev) => ({ ...prev, error: err.message }));
        toast.error(err.message);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [state.filters, state.pagination.page]);

  useEffect(() => {
    //Fetches and sets the made gold tests for a given month and or year
    const month = customMonth || new Date().getMonth() + 1;
    const year = customYear || new Date().getFullYear();
    const fetchMadeTestsForMonth = async () => {
      try {
        const result = await goldTestsService.getTestsByMonth(month, year);
        setDoneTests(result.data);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };
    fetchMadeTestsForMonth();
  }, []);

  // Handlers
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const createdTest = await goldTestsService.createTest(state.newTest);
      setState((prev) => ({
        ...prev,
        tests: [createdTest, ...prev.tests],
        newTest: {
          ...prev.newTest,
          lieferant: "",
          farbe: "RG",
          bestellnr: "",
          bemerkung: "",
        },
      }));
      toast.success("Gold test successfully added.");
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
      toast.error(err.message);
    }
  };

  const handleUpdate = (field, value) => {
    setState((prev) => ({
      ...prev,
      newTest: { ...prev.newTest, [field]: value },
    }));
  };

  // Render
  return (
    
    <div style={{ padding: "20px", margin: "0 auto" }}>
      {state.error && (
        <div style={{ color: "red", margin: "10px 0" }}>{state.error}</div>
      )}
      
      <h1 className="page-title"><GoldIcon/> Gold Tests</h1>
      <GoldTestsTable />

      <CreateTestForm
        suppliers={suppliers}
        colors={colors}
        newTest={state.newTest}
        onCreate={handleCreateTest}
        onUpdate={handleUpdate}
      />

      <TestsList
        tests={state.tests}
        loading={state.loading}
        onDelete={async (id) => {
          await goldTestsService.deleteTest(id);
          setState((prev) => ({
            ...prev,
            tests: prev.tests.filter((test) => test.id !== id),
          }));
        }}
        onUpdateRemark={async (id, remark) => {
          await goldTestsService.updateTestRemark(id, remark);
          setState((prev) => ({
            ...prev,
            tests: prev.tests.map((test) =>
              test.id === id ? { ...test, bemerkung: remark } : test
            ),
          }));
        }}
      />

      <Pagination
        currentPage={state.pagination.page}
        totalPages={state.pagination.totalPages}
        onPageChange={(page) =>
          setState((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, page },
          }))
        }
      />
    </div>
  );
};

export default GoldTestManager;
