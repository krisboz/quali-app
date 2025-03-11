import BarChartComponent from "../components/BarChartComponent";

const AllTimeMangelGrund = ({inspections}) => {
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

    return (
         <div className="graph-container">
                                    <div className="graph-title">
                                        <h3>Defect Statistics by Mangelgrund (All Time)</h3>
                                    </div>
                                    <BarChartComponent data={allTimeData}/>
                                </div>
    )

}

export default AllTimeMangelGrund