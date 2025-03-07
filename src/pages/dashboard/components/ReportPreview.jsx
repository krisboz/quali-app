import { useState, useEffect, useMemo } from "react";
import { fetchAllAuswertungen, fetchQualityReports, searchAuswertungen } from "../../../api/api";
import { PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, Bar } from 'recharts';
import "../styles/ReportPreview.scss"


const ReportPreview = () => {

        const [auswertungen, setAuswertungen] = useState([]);
        const [inspections, setInspections] = useState([]);
        const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() );
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
        const suppliers = ["Adoma", "Breuning", "Rösch", "Schofer", "Sisti"];
        const [selectedSupplier, setSelectedSupplier] = useState(null);
        
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
        const renderBasedOnMangelgrund = (selectedMonth, selectedYear) => {
            const mangelTypes = [
                "Oberfläche verkratzt/Poren",
                "Stein Defekt",
                "Falsche Teile / Zusammensetzung",
                "Falsche Länge",
                "Gold/Stein Toleranz",
                "Andere"
            ];
        
            const allTimeData = mangelTypes.map((mangel) => ({
                name: mangel,
                value: inspections.filter(i => i.mangelgrund === mangel).length
            }));
        
            const monthlyData = mangelTypes.map((mangel) => ({
                name: mangel,
                value: inspections.filter(i =>
                    i.mangelgrund === mangel &&
                    new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
                    new Date(i.liefertermin).getFullYear() === selectedYear
                ).length
            }));
        
            return (
                <div className="mangelgrund-section">
                    <div className="mangelgrund-graphs graphs">
                        <div className="graph-container">
                            <div className="graph-title">
                                <h3>Defect Statistics by Mangelgrund (All Time)</h3>
                            </div>
                            <BarChart
                                width={900}
                                height={400}
                                data={allTimeData}
                                layout="vertical"
                                margin={{ left: 120, right: 20 }}
                            >
                                <YAxis type="category" dataKey="name" />
                                <XAxis type="number" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#dc3545" />
                            </BarChart>
                        </div>
                        <div className="graph-container">
                            <div className="graph-title">
                                <h3>Defect Statistics by Mangelgrund ({selectedMonth}/{selectedYear})</h3>
                            </div>
                            <BarChart
                                width={900}
                                height={400}
                                data={monthlyData}
                                layout="vertical"
                                margin={{ left: 120, right: 20 }}
                            >
                                <YAxis type="category" dataKey="name" />
                                <XAxis type="number" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#28a745" />
                            </BarChart>
                        </div>
                    </div>
        
                    <div className="supplier-buttons">
                        {suppliers.map((supplier) => (
                            <button 
                                key={supplier} 
                                onClick={() => setSelectedSupplier(selectedSupplier === supplier ? null : supplier)}
                            >
                                {supplier}
                            </button>
                        ))}
                    </div>
        
                    {selectedSupplier && (() => {
                        const normalizedSupplier = selectedSupplier.toLowerCase();
                        
                        const supplierAllTimeData = mangelTypes.map((mangel) => ({
                            name: mangel,
                            value: inspections.filter(i =>
                                i.mangelgrund === mangel &&
                                i.lieferant.toLowerCase().includes(normalizedSupplier)
                            ).length
                        }));
        
                        const supplierMonthlyData = mangelTypes.map((mangel) => ({
                            name: mangel,
                            value: inspections.filter(i =>
                                i.mangelgrund === mangel &&
                                i.lieferant.toLowerCase().includes(normalizedSupplier) &&
                                new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
                                new Date(i.liefertermin).getFullYear() === selectedYear
                            ).length
                        }));
        
                        return (
                            <div className="mangelgrund-graphs graphs">
                                <div className="graph-container">
                                    <div className="graph-title">
                                        <h3>{selectedSupplier} - Defect Statistics (All Time)</h3>
                                    </div>
                                    <BarChart
                                        width={900}
                                        height={400}
                                        data={supplierAllTimeData}
                                        layout="vertical"
                                        margin={{ left: 120, right: 20 }}
                                    >
                                        <YAxis type="category" dataKey="name" />
                                        <XAxis type="number" />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#dc3545" />
                                    </BarChart>
                                </div>
                                <div className="graph-container">
                                    <div className="graph-title">
                                        <h3>{selectedSupplier} - Defect Statistics ({selectedMonth}/{selectedYear})</h3>
                                    </div>
                                    <BarChart
                                        width={900}
                                        height={400}
                                        data={supplierMonthlyData}
                                        layout="vertical"
                                        margin={{ left: 120, right: 20 }}
                                    >
                                        <YAxis type="category" dataKey="name" />
                                        <XAxis type="number" />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#28a745" />
                                    </BarChart>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            );
        };
        
        const renderDefectsByItem = (selectedMonth, selectedYear, selectedSupplier) => {
            const groupDefectsByItem = (inspectionsToConsider) => {
                return inspectionsToConsider.reduce((acc, inspection) => {
                    const itemParts = inspection.artikelnr.split("-");
                    const itemId = `${itemParts[0]}-${itemParts[1]}`;
                    acc[itemId] = (acc[itemId] || 0) + 1;
                    return acc;
                }, {});
            };
        
            const allTimeGrouped = groupDefectsByItem(inspections);
            const monthYearGrouped = groupDefectsByItem(
                inspections.filter(i => 
                    new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
                    new Date(i.liefertermin).getFullYear() === selectedYear
                )
            );
            const supplierGrouped = selectedSupplier ? groupDefectsByItem(
                inspections.filter(i => i.lieferant.toLowerCase() === selectedSupplier.toLowerCase())
            ) : {};
        
            const convertToChartData = (groupedData) => {
                return Object.entries(groupedData)
                    .map(([item, count]) => ({ name: item, value: count }))
                    .sort((a, b) => b.value - a.value); // Sort descending by value
            };
        
            return (
                <div className="defects-by-item-graphs graphs">
                    <div className="graph-container">
                        <div className="graph-title"><h3>Defects by Item (All Time)</h3></div>
                        <BarChart
                            width={600}
                            height={500}
                            data={convertToChartData(allTimeGrouped)}
                            layout="vertical"
                            margin={{ left: 120, right: 20 }}
                        >
                            <YAxis type="category" dataKey="name" />
                            <XAxis type="number" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#dc3545" />
                        </BarChart>
                    </div>
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Item ({selectedMonth}/{selectedYear})</h3>

                        </div>
                        <BarChart
                            width={600}
                            height={400}
                            data={convertToChartData(monthYearGrouped)}
                            layout="vertical"
                            margin={{ left: 120, right: 20 }}
                        >
                            <YAxis type="category" dataKey="name" />
                            <XAxis type="number" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#28a745" />
                        </BarChart>
                    </div>
                    {selectedSupplier && (
                        <div className="graph-container">
                            <div className="graph-title">
                            <h3>{selectedSupplier} - Defects by Item</h3>

                            </div>
                            <BarChart
                                width={600}
                                height={300}
                                data={convertToChartData(supplierGrouped)}
                                layout="vertical"
                                margin={{ left: 120, right: 20 }}
                            >
                                <YAxis type="category" dataKey="name" />
                                <XAxis type="number" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ff5733" />
                            </BarChart>
                        </div>
                    )}
                </div>
            );
        };
        
        const renderDefectsByDetailedItem = (selectedMonth, selectedYear, selectedSupplier) => {
            const groupDefectsByItem = (inspectionsToConsider) => {
                return inspectionsToConsider.reduce((acc, inspection) => {
                    const itemNumber = inspection.artikelnr;
                    acc[itemNumber] = (acc[itemNumber] || 0) + 1;
                    return acc;
                }, {});
            };
        
            const allTimeGrouped = groupDefectsByItem(inspections);
            const monthYearGrouped = groupDefectsByItem(
                inspections.filter(i => 
                    new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
                    new Date(i.liefertermin).getFullYear() === selectedYear
                )
            );
            const supplierGrouped = selectedSupplier ? groupDefectsByItem(
                inspections.filter(i => i.lieferant.toLowerCase() === selectedSupplier.toLowerCase())
            ) : {};
        
            const convertToChartData = (groupedData) => {
                return Object.entries(groupedData)
                    .map(([item, count]) => ({ name: item, value: count }))
                    .sort((a, b) => b.value - a.value); // Sort descending by value
            };
        
            return (
                <div className="defects-by-detailed-item-graphs graphs">
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Detailed Item (All Time)</h3>
                        </div>
                        <BarChart
                            width={500}
                            height={300}
                            data={convertToChartData(allTimeGrouped)}
                            layout="vertical"
                            margin={{ left: 150, right: 20 }}
                        >
                            <YAxis type="category" dataKey="name" />
                            <XAxis type="number" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#dc3545" />
                        </BarChart>
                    </div>
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Detailed Item ({selectedMonth}/{selectedYear})</h3>

                        </div>
                        <BarChart
                            width={500}
                            height={300}
                            data={convertToChartData(monthYearGrouped)}
                            layout="vertical"
                            margin={{ left: 150, right: 20 }}
                        >
                            <YAxis type="category" dataKey="name" />
                            <XAxis type="number" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#28a745" />
                        </BarChart>
                    </div>
                    {selectedSupplier && (
                        <div className="graph-container">
                            <div className="graph-title">
                            <h3>{selectedSupplier} - Defects by Detailed Item</h3>

                            </div>
                            <BarChart
                                width={500}
                                height={300}
                                data={convertToChartData(supplierGrouped)}
                                layout="vertical"
                                margin={{ left: 150, right: 20 }}
                            >
                                <YAxis type="category" dataKey="name" />
                                <XAxis type="number" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ff5733" />
                            </BarChart>
                        </div>
                    )}
                </div>
            );
        };

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
        <h2>Defect Statistics by Mangelgrund</h2>

    {renderBasedOnMangelgrund(selectedMonth, selectedYear)}
    <div className="defects-by-item-graphs graphs">
    {renderDefectsByItem(selectedMonth, selectedYear, selectedSupplier)}
</div>

    <div className="defects-by-item-graphs graphs">
    {renderDefectsByDetailedItem(selectedMonth, selectedYear, selectedSupplier)}
</div>
  

            </div>
        )

}

export default ReportPreview