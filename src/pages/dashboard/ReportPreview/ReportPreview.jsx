import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchAllAuswertungen, fetchQualityReports } from "../../../api/api";
import "../styles/ReportPreview.scss";
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
import DiamondScreening from "./sections/DiamondScreening";
import GoldTestsTable from "../../goldTests/components/GoldTestsTable";

import { SiAlwaysdata as AllTimeIcon } from "react-icons/si";
import { TbCalendarMonth as MonthlyIcon } from "react-icons/tb";
import { CgPlayListRemove as MangelgrundIcon } from "react-icons/cg";
import { GiBigDiamondRing as DefectiveItemsIcon } from "react-icons/gi";
import { AiOutlineGold as GoldIcon } from "react-icons/ai";
import { FaRegGem as DiamondIcon } from "react-icons/fa";



const ReportPreview = () => {
    const [auswertungen, setAuswertungen] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()+ 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [visibleSection, setVisibleSection] = useState("allTime");

    useEffect(() => {
        const fetchAndSetData = async () => {
            try {
                const [inspectionsRes, auswertungenRes] = await Promise.all([
                    fetchQualityReports(),
                    fetchAllAuswertungen()
                ]);
                setInspections(inspectionsRes);
                setAuswertungen(auswertungenRes.rows);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error(err.message);
            }
        };
        fetchAndSetData();
    }, []);

    return (
        <div>
            <div className="stat-to-show-selector">
                <h4>Choose stats to show: </h4>
                <button className={visibleSection==="allTime"?"active":null} onClick={() => setVisibleSection("allTime")}> <AllTimeIcon/> All Time Statistics</button>
                <button className={visibleSection==="monthly"?"active":null} onClick={() => setVisibleSection("monthly")}> <MonthlyIcon/> Monthly Reports</button>
                <button className={visibleSection==="mangelgrund"?"active":null} onClick={() => setVisibleSection("mangelgrund")}> <MangelgrundIcon /> Defect Statistics</button>
                <button className={visibleSection==="defectiveItems"?"active":null} onClick={() => setVisibleSection("defectiveItems")}><DefectiveItemsIcon/> Defective Items</button>
                <button className={visibleSection==="diamondScreening"?"active":null} onClick={() => setVisibleSection("diamondScreening")}><DiamondIcon/> Diamond Screening</button>
                <button className={visibleSection==="goldTests"?"active":null} onClick={() => setVisibleSection("goldTests")}><GoldIcon/> Gold Tests</button>


            </div>

            <h1>Report Preview</h1>
            <div className="controls-container">
            <MonthYearSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
            <SupplierSelector selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />

            </div>
      
            {visibleSection === "allTime" && (
                <>
                    <h2>All Time</h2>
                    <div className="all-time-graphs graphs">
                        <AllTimeFailRate inspections={inspections} auswertungen={auswertungen} />
                        <AllTimeFailRateGroupedBySupplier inspections={inspections} auswertungen={auswertungen} />
                    </div>
                </>
            )}

            {visibleSection === "monthly" && (
                <>
                    <h2>Monthly Reports</h2>
                    <div className="monthly-graphs graphs">
                        <MonthlyBasedOnSupplier selectedMonth={selectedMonth} selectedYear={selectedYear} inspections={inspections} auswertungen={auswertungen} />
                    </div>
                </>
            )}

            {visibleSection === "mangelgrund" && (
                <>
                    <h2>Defect Statistics by Mangelgrund</h2>
                    <div className="mangelgrund-graphs bar-graphs">
                        <AllTimeMangelGrund inspections={inspections} />
                        <MonthlyMangelgrund selectedMonth={selectedMonth} selectedYear={selectedYear} inspections={inspections} />
                        <MangelgrundBasedOnSupplier inspections={inspections} selectedSupplier={selectedSupplier} selectedMonth={selectedMonth} selectedYear={selectedYear} />
                    </div>
                </>
            )}

            {visibleSection === "defectiveItems" && (
                <>
                    <DefectiveItems inspections={inspections} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedSupplier={selectedSupplier} />
                    <DefectiveDetailedItems inspections={inspections} selectedMonth={selectedMonth} selectedYear={selectedYear} selectedSupplier={selectedSupplier} />
                </>
            )}
             {visibleSection === "diamondScreening" && (
                <>
                    <DiamondScreening selectedMonth={selectedMonth} selectedYear={selectedYear}/>
                </>
            )}

            {visibleSection === "goldTests" && (
                            <>
                                <GoldTestsTable isDemoOnly={true}/>
                            </>
                        )}
        </div>
    );
};

export default ReportPreview;
