import PieChartComponent from "../components/PieChartComponent";

const MonthlyBasedOnSupplier = ({selectedMonth, selectedYear, inspections, auswertungen}) => {
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
                            <PieChartComponent data={data}/>
                            <p>Fail rate: {percentageOfProblematic} %</p>
                        </div>
                    </div>
                );
            });

}

export default MonthlyBasedOnSupplier