import BarChartComponent from "../components/BarChartComponent";

const MangelgrundBasedOnSupplier = ({selectedSupplier, inspections, selectedMonth, selectedYear}) => {
    const mangelTypes = [
        "Oberfläche verkratzt/Poren",
        "Stein Defekt",
        "Falsche Teile / Zusammensetzung",
        "Falsche Länge",
        "Gold/Stein Toleranz",
        "Andere"
    ];

    const normalizedSupplier = selectedSupplier &&  selectedSupplier.toLowerCase() ;
                            
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


      if(!selectedSupplier) {
        return(null)
      }                      
            
    return (
       <>
            <div className="graph-container">
                <div className="graph-title">
                    <h3>{selectedSupplier} - Defect Statistics (All Time)</h3>
                </div>
                <BarChartComponent data={supplierAllTimeData}/>
            </div>
            <div className="graph-container">
                <div className="graph-title">
                    <h3>{selectedSupplier} - Defect Statistics ({selectedMonth}/{selectedYear})</h3>
                </div>
                <BarChartComponent data={supplierMonthlyData}/>
            </div>
            </>
        
    );

}

export default MangelgrundBasedOnSupplier;