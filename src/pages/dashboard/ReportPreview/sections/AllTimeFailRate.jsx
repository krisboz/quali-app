import PieChartComponent from "../components/PieChartComponent"

const AllTimeFailRate = ({inspections, auswertungen}) => {
    const noInspected = inspections.length;
    const noRecieved = auswertungen.length;
    const percentageOfProblematic = ((noInspected / noRecieved) * 100).toFixed(3);

    const data = [
        { name: "Passed", value: noRecieved - noInspected },
        { name: "Failed", value: noInspected }
    ];

  // Green for Passed, Red for Failed

    return (
              <div className="graph-container">
                            <div className="graph-title">
                                <p>All Time Fail Rate</p>
                            </div>
        
                            <div className="graph-content">
                            <p>Total recieved: {noRecieved}</p>
                            <PieChartComponent data={data}/>
                            <p>Fail rate: {percentageOfProblematic} %</p>
        
        
                            </div>
                           
                        </div>
    )

}

export default AllTimeFailRate