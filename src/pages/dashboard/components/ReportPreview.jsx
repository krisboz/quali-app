import { useState, useEffect, useMemo } from "react";
import { fetchAllAuswertungen, fetchQualityReports, searchAuswertungen } from "../../../api/api";
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import "../styles/ReportPreview.scss"


const ReportPreview = () => {

        const [auswertungen, setAuswertungen] = useState([]);
        const [inspections, setInspections] = useState([]);
        const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() );
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
        
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
                }
            };
            fetchAndSetData();
        }, []);
    
        const renderAllTimeData = () => {
            const noInspected = inspections.length;
            const noRecieved = auswertungen.length;
            const percentageOfProblematic = ((noInspected / noRecieved) * 100).toFixed(3);
        
            const data = [
                { name: "Passed", value: noRecieved - noInspected },
                { name: "Failed", value: noInspected }
            ];
        
            const COLORS = ["#28a745", "#dc3545"]; // Green for Passed, Red for Failed
        
        
            return (
                <div className="graph-container">
                    <div className="graph-title">
                        <p>All Time Fail Rate</p>
                    </div>

                    <div className="graph-content">
                    <p>Total recieved: {noRecieved}</p>
                    <PieChart width={200} height={200}>
                        <Pie 
                            data={data} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={80} 
                            fill="#8884d8" 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <p>Fail rate: {percentageOfProblematic} %</p>


                    </div>
                   
                </div>
            );
        };

        //Adoma, Breuning, Rösch, Schofer, Sisti
        //in inspection -> lieferant | in auswertung -> Firma
        //filter both of those arrays dynamically based on the lieferant/Firma and display 
        //pie charts for each
        //for each of those in the first comment make a pie chart akin to the renderAllTimeData
        //But instead of the title being All Time Fail Rate make it Adoma All Time Fail Rate...

        const renderAllTimeBasedOnLieferant = () => {
            const suppliers = ["Adoma", "Breuning", "Rösch", "Schofer", "Sisti"];
        
            return suppliers.map((supplier) => {
                // Filter based on supplier name
                const filteredInspections = inspections.filter(i => i.lieferant === supplier);
                const filteredAuswertungen = auswertungen.filter(a => 
                    a["Firma"]?.toLowerCase().includes(supplier.toLowerCase())
                );
        
                const noInspected = filteredInspections.length;
                const noRecieved = filteredAuswertungen.length;
                const percentageOfProblematic = noRecieved > 0 ? ((noInspected / noRecieved) * 100).toFixed(3) : "0.000";
        
                const data = [
                    { name: "Passed", value: noRecieved - noInspected },
                    { name: "Failed", value: noInspected }
                ];
        
                const COLORS = ["#28a745", "#dc3545"]; // Green for Passed, Red for Failed
        
                return (
                    <div className="graph-container" key={supplier}>
                        <div className="graph-title">
                            <p>{supplier} All Time Fail Rate</p>
                        </div>
                        <div className="graph-content">
                            <p>Total received: {noRecieved}</p>
                            <PieChart width={200} height={200}>
                                <Pie 
                                    data={data} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={50} 
                                    outerRadius={80} 
                                    fill="#8884d8" 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <p>Fail rate: {percentageOfProblematic} %</p>
                        </div>
                    </div>
                );
            });
        };

        const renderMonthlyBasedOnLieferant = (selectedMonth, selectedYear) => {
            const suppliers = ["Adoma", "Breuning", "Rösch", "Schofer", "Sisti"];
        
            return suppliers.map((supplier) => {
                // Normalize supplier name (trim and lowercase)
                const normalizedSupplier = supplier.toLowerCase().trim();
        
                // Filter inspections based on supplier name and selected date
                const filteredInspections = inspections.filter(i => 
                    i.lieferant.toLowerCase().trim() === normalizedSupplier &&
                    new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
                    new Date(i.liefertermin).getFullYear() === selectedYear
                );
        
                // Filter auswertungen by checking if the Firma **includes** the supplier name
                const filteredAuswertungen = auswertungen.filter(a => 
                    a["Firma"]?.toLowerCase().includes(normalizedSupplier) &&
                    new Date(a.Termin.split(".").reverse().join("-")).getMonth() + 1 === selectedMonth &&
                    new Date(a.Termin.split(".").reverse().join("-")).getFullYear() === selectedYear
                );
        
                console.log(`Supplier: ${supplier}`, { filteredInspections, filteredAuswertungen });
        
                const noInspected = filteredInspections.length;
                const noRecieved = filteredAuswertungen.length;
                const percentageOfProblematic = noRecieved > 0 ? ((noInspected / noRecieved) * 100).toFixed(3) : "0.000";
        
                const data = [
                    { name: "Passed", value: noRecieved - noInspected },
                    { name: "Failed", value: noInspected }
                ];
        
                const COLORS = ["#28a745", "#dc3545"]; // Green for Passed, Red for Failed
        
                return (
                    <div className="graph-container" key={`${supplier}-${selectedMonth}-${selectedYear}`}>
                        <div className="graph-title">
                            <p>{supplier} - {selectedMonth}/{selectedYear} Fail Rate</p>
                        </div>
                        <div className="graph-content">
                            <p>Total received: {noRecieved}</p>
                            <PieChart width={200} height={200}>
                                <Pie 
                                    data={data} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={50} 
                                    outerRadius={80} 
                                    fill="#8884d8" 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <p>Fail rate: {percentageOfProblematic} %</p>
                        </div>
                    </div>
                );
            });
        };
        
    
        const thisMonthAuswertungen = useMemo(() => {
            const now = new Date();
            return auswertungen.filter(a => {
                const date = new Date(a.Termin);  // Assuming `date` exists
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
        }, [auswertungen]);


        return (
            <div>
               <h1>Report Preview</h1>

               <h2>All Time</h2>
                <div className="all-time-graphs graphs">
                    {renderAllTimeData()}
                    {renderAllTimeBasedOnLieferant()}
                </div>

                <h2>Monthly Reports</h2>
        <label>
            Select Month:
            <input 
                type="number" 
                min="4" 
                max="12" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))} 
            />
        </label>
        <label>
            Select Year:
            <input 
                type="number" 
                min="2024" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))} 
            />
        </label>

        <div className="monthly-graphs graphs">
            {renderMonthlyBasedOnLieferant(selectedMonth, selectedYear)}
        </div>
            </div>
        )

}

export default ReportPreview