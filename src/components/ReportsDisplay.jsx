import React, { useState } from "react";
import "../styles/components/ReportsDisplay.scss";
import {fetchReports} from "../api/api"
import GraphComponent from "./GraphComponent";
import GenerateAllGraphs from "./GenerateAllGraphs";

const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const lieferanten = ["Adoma", "Breuning", "Giloy", "Rösch", "Schofer", "Sisti"];

const ReportsDisplay = () => {
  const [reportTime, setReportTime] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [lieferant, setLieferant] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [allResults, setAllResults] = useState(null)

  const handleReportTimeChange = (e) => {
    const value = e.target.value;
    setReportTime(value);
    if (value === "yearly") {
      setReportMonth("");
    }
  };

  const renderMonthInputs = (
    <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="border rounded p-2">
      <option value="">Select Month</option>
      {months.map((month, index) => (
        <option key={index} value={month}>
          {month}
        </option>
      ))}
    </select>
  );

  const renderLieferantInputs = (
    <select value={lieferant} onChange={(e) => setLieferant(e.target.value)} className="border rounded p-2" required={true}>
      <option value="">Select Lieferant</option>
      {lieferanten.map((liefOption, index) => (
        <option key={index} value={liefOption}>
          {liefOption}
        </option>
      ))}
    </select>
  );

  const renderReportTime = (
    <select value={reportTime} onChange={handleReportTimeChange} className="border rounded p-2">
      <option value="">Select Report Type</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
    </select>
  );

  const handleParameterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const currentYear = new Date().getFullYear();
      let formattedTermin = '';
      
      if (reportTime === "monthly") {
        const monthIndex = months.indexOf(reportMonth);
        formattedTermin = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      } else {
        formattedTermin = `${currentYear}`;
      }
  
      const reportData = await fetchReports({
        termin: formattedTermin,
        firma: lieferant
      });
  
      setResults(reportData);
  
    } catch (error) {
      setError("Failed to fetch report data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReportData = async () => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth(); // 0-indexed (January is 0)
    const allReportData = {};
  
    try {
      for (const lieferant of lieferanten) {
        const lieferantData = { yearly: {}, monthly: {} };
  
        // Fetch yearly data
        const yearlyResponse = await fetchReports({
          termin: `${currentYear}`,
          firma: lieferant,
        });
        lieferantData.yearly = {
          year: currentYear,
          qualityReports: yearlyResponse.qualityReports,
          auswertungen: yearlyResponse.auswertungen,
        };
  
        // Fetch monthly data up to and excluding the current month
        for (let monthIndex = 0; monthIndex < currentMonthIndex; monthIndex++) {
          const month = months[monthIndex];
          const formattedTermin = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`;
          const monthlyResponse = await fetchReports({
            termin: formattedTermin,
            firma: lieferant,
          });
          lieferantData.monthly[month] = {
            qualityReports: monthlyResponse.qualityReports,
            auswertungen: monthlyResponse.auswertungen,
          };
        }
  
        allReportData[lieferant] = lieferantData;
      }
      console.log({allReportData})
      setAllResults(allReportData);
    } catch (error) {
      console.error("Error fetching all report data:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };


  return (
    <div>
      <h1>Report Generation</h1>
      <div className="report-param-input-container">
        <h4>Report Parameters</h4>
        <form className="report-parameter-form" onSubmit={handleParameterSubmit}>
          {renderReportTime}
          {reportTime === "monthly" && renderMonthInputs}
          {renderLieferantInputs}
          <button type="submit">Submit</button>
        </form>
      </div>
      <button onClick={fetchAllReportData} type="button">Fetch All</button>
      <div className="graph-component-container">
        {results && <GraphComponent results={results}/>}
        {allResults && <GenerateAllGraphs allReportData={allResults}/>}
      </div>
    </div>
  );
};

export default ReportsDisplay;