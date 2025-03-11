import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchAllAuswertungen, fetchQualityReports } from "../../../api/api";
import "../styles/ReportPreview.scss"
import AllTimeFailRate from "./sections/AllTimeFailRate";
import AllTimeFailRateGroupedBySupplier from "./sections/AllTimeFailRateGroupedBySupplier";
import MonthYearSelector from "./components/MonthYearSelector";
import MonthlyBasedOnSupplier from "./sections/MonthlyBasedOnSupplier";
import AllTimeMangelGrund from "./sections/AllTimeMangelgrund";
import MonthlyMangelgrund from "./sections/MonthlyMangelgrund";
import SupplierSelector from "./components/SupplierSelector";
import MangelgrundBasedOnSupplier from "./sections/MangelgrundBasedOnSupplier";
import DefectiveItems from "./sections/DefectiveItems";
import DefectiveDetailedItems from "./sections/DefectiveDetailedItems";


const ReportPreview = () => {

        const [auswertungen, setAuswertungen] = useState([]);
        const [inspections, setInspections] = useState([]);
        const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() );
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
        const [selectedSupplier, setSelectedSupplier] = useState(null);
        const [selectedDataForReport, setSelectedDataForReport] = useState([]);
        
        useEffect(() => {
            const fetchAndSetData = async () => {
                try {
                    const [inspectionsRes, auswertungenRes] = await Promise.all([
                        fetchQualityReports(),
                        fetchAllAuswertungen()
                    ]);
                    console.log({inspectionsRes, auswertungenRes})
                    setInspections(inspectionsRes);
                    setAuswertungen(auswertungenRes.rows);
                } catch (err) {
                    console.error("Error fetching data:", err);
                    toast.error(err.message)
                }
            };
            fetchAndSetData();
        }, []);



        return (
            <div>
                <div className="generate-preview-container">
                    <button>Generate Quality Report</button>
                </div>
               <h1>Report Preview</h1>
            <SupplierSelector selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier}/>
               <h2>All Time</h2>
                <div className="all-time-graphs graphs">
                    <AllTimeFailRate inspections={inspections} auswertungen={auswertungen} />
                   <AllTimeFailRateGroupedBySupplier inspections={inspections} auswertungen={auswertungen}/>
                </div>

                <MonthYearSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />

                <h2>Monthly Reports</h2>
       

        <div className="monthly-graphs graphs">
            <MonthlyBasedOnSupplier selectedMonth={selectedMonth} selectedYear={selectedYear} inspections={inspections} auswertungen={auswertungen}/>
        </div>
        <h2>Defect Statistics by Mangelgrund</h2>
        <div className="mangelgrund-graphs bar-graphs">
        <AllTimeMangelGrund inspections={inspections}/>
            <MonthlyMangelgrund selectedMonth={selectedMonth} selectedYear={selectedYear} inspections={inspections}/>
            <MangelgrundBasedOnSupplier inspections={inspections} selectedSupplier={selectedSupplier} selectedMonth={selectedMonth} selectedYear={selectedYear}/>
        </div>

   
    <DefectiveItems inspections={inspections} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedSupplier={selectedSupplier}/>

    <DefectiveDetailedItems inspections={inspections} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedSupplier={selectedSupplier}/>

            </div>
        )

}

export default ReportPreview