import BarChartComponent from "../components/BarChartComponent";

const DefectiveDetailedItems = ({inspections, selectedMonth, selectedYear, selectedSupplier}) => {
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
                <div className="defects-by-detailed-item-graphs bar-graphs">
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Detailed Item (All Time)</h3>
                        </div>
                        <BarChartComponent data={convertToChartData(allTimeGrouped)}
                        />
                    </div>
                    <div className="graph-container">
                        <div className="graph-title">
                        <h3>Defects by Detailed Item ({selectedMonth}/{selectedYear})</h3>

                        </div>
                        <BarChartComponent data={convertToChartData(monthYearGrouped)}
                        />
                    </div>
                    {selectedSupplier && (
                        <div className="graph-container">
                            <div className="graph-title">
                            <h3>{selectedSupplier} - Defects by Detailed Item</h3>

                            </div>
                           <BarChartComponent data={convertToChartData(monthYearGrouped)}
                           />
                        </div>
                    )}
                </div>
            );
}

export default DefectiveDetailedItems