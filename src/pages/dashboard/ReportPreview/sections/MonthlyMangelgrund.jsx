import BarChartComponent from "../components/BarChartComponent";

const MonthlyMangelgrund = ({selectedMonth, selectedYear, inspections}) => {
    const mangelTypes = [
        "Oberfläche verkratzt/Poren",
        "Stein Defekt",
        "Falsche Teile / Zusammensetzung",
        "Falsche Länge",
        "Gold/Stein Toleranz",
        "Andere"
    ];


    const monthlyData = mangelTypes.map((mangel) => ({
        name: mangel,
        value: inspections.filter(i =>
            i.mangelgrund === mangel &&
            new Date(i.liefertermin).getMonth() + 1 === selectedMonth &&
            new Date(i.liefertermin).getFullYear() === selectedYear
        ).length
    }));

    return (
        <div className="graph-container">
                                    <div className="graph-title">
                                        <h3>Defect Statistics by Mangelgrund ({selectedMonth}/{selectedYear})</h3>
                                    </div>
                                   <BarChartComponent data={monthlyData} />
                                </div>
    )
}

export default MonthlyMangelgrund