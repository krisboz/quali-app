import BarChartComponent from "../components/BarChartComponent";

const DefectiveItems = ({inspections, selectedMonth, selectedYear, selectedSupplier}) => {
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
                <div className="defects-by-item-graphs bar-graphs">
                    <div className="graph-container">
                        <div className="graph-title"><h3>Defects by Item (All Time)</h3></div>
                        <BarChartComponent  data={convertToChartData(allTimeGrouped)}/>
                    </div>
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Item ({selectedMonth}/{selectedYear})</h3>

                        </div>
                        <BarChartComponent data={convertToChartData(monthYearGrouped)}
                        />
                    </div>
                    {selectedSupplier && (
                        <div className="graph-container">
                            <div className="graph-title">
                            <h3>{selectedSupplier} - Defects by Item</h3>

                            </div>
                           <BarChartComponent data={convertToChartData(supplierGrouped)}
                           />
                        </div>
                    )}
                </div>
            );
}

export default DefectiveItems;