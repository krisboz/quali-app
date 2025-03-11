const MonthYearSelector = ({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) => {
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="month-year-selector">
            <label>
                Select Month:
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                    ))}
                </select>
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
        </div>
    );
};

export default MonthYearSelector;