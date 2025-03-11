import PieChartComponent from "../components/PieChartComponent";

const AllTimeFailRateGroupedBySupplier = ({inspections, auswertungen}) => {
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
                             <PieChartComponent data={data}/>
                             <p>Fail rate: {percentageOfProblematic} %</p>
                         </div>
                     </div>
                 );
             });


}

export default AllTimeFailRateGroupedBySupplier