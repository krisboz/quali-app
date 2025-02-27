import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const defectReasons = [
  "Oberfläche verkratzt/Poren",
  "Stein Defekt",
  "Falsche Teile / Zusammensetzung",
  "Falsche Länge",
  "Gold/Stein Toleranz",
  "Andere",
];

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const GenerateAllGraphs = ({ allReportData }) => {
  const generateChartData = (qualityReports, auswertungen) => {
    const chartData = [
      {
        name: "Gelieferte Positionen",
        value: auswertungen.length,
      },
      ...defectReasons.map((reason) => ({
        name: reason.replace(/\//g, "-"),
        value: 0,
      })),
    ];

    qualityReports.forEach((report) => {
      const reportReason = report.mangelgrund.trim().toLowerCase();
      const reasonEntry = chartData.find(
        (entry) => entry.name.toLowerCase() === reportReason.replace(/\//g, "-")
      );
      if (reasonEntry) {
        reasonEntry.value += 1;
      }
    });

    return chartData;
  };

  const generateSummaryRow = (chartData, title) => {
    const totalPositions = chartData.find((entry) => entry.name === "Gelieferte Positionen")?.value || 0;
    const totalDefects = chartData.reduce((sum, entry) =>
      entry.name !== "Gelieferte Positionen" ? sum + entry.value : sum, 0);
    const qualityDefectPercentage = totalPositions > 0 ? ((totalDefects / totalPositions) * 100).toFixed(1) + "%" : "0%";

    return (
      <table style={{ borderCollapse: "collapse", marginBottom: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f8d8" }}>
            <th style={{ padding: "5px", border: "1px solid black" }}>{title}</th>
            {defectReasons.map((reason, index) => (
              <th key={index} style={{ padding: "5px", border: "1px solid black" }}>{reason}</th>
            ))}
            <th style={{ padding: "5px", border: "1px solid black", backgroundColor: "yellow" }}>Qualitätsmängel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "5px", border: "1px solid black" }}>{totalPositions}</td>
            {defectReasons.map((reason, index) => {
              const defectEntry = chartData.find((entry) => entry.name === reason.replace(/\//g, "-"));
              return <td key={index} style={{ padding: "5px", border: "1px solid black" }}>{defectEntry?.value || 0}</td>;
            })}
            <td style={{ padding: "5px", border: "1px solid black", backgroundColor: "yellow" }}>{qualityDefectPercentage}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const generateMonthlySummaryTable = (monthlyData) => {
    return (
      <table style={{ borderCollapse: "collapse", marginBottom: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#ddd" }}>
            <th style={{ padding: "5px", border: "1px solid black" }}>Monat</th>
            <th style={{ padding: "5px", border: "1px solid black" }}>Gelieferte Artikel im Monat</th>
            <th style={{ padding: "5px", border: "1px solid black" }}>Qualitätsproblem in Stück</th>
            <th style={{ padding: "5px", border: "1px solid black" }}>Qualitätsproblem in Prozent</th>
          </tr>
        </thead>
        <tbody>
          {monthNames.map((month, index) => {
            const monthData = monthlyData[month] || { qualityReports: [], auswertungen: [] };
            const totalPositions = monthData.auswertungen.length;
            const totalDefects = monthData.qualityReports.length;
            const qualityDefectPercentage = totalPositions > 0 ? ((totalDefects / totalPositions) * 100).toFixed(1) + "%" : "No value";

            return (
              <tr key={index}>
                <td style={{ padding: "5px", border: "1px solid black" }}>{month}</td>
                <td style={{ padding: "5px", border: "1px solid black" }}>{totalPositions}</td>
                <td style={{ padding: "5px", border: "1px solid black" }}>{totalDefects}</td>
                <td style={{ padding: "5px", border: "1px solid black" }}>{qualityDefectPercentage}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {Object.entries(allReportData).map(([lieferant, data]) => (
        <div key={lieferant}>
          <h2>{lieferant}</h2>

          {/* Yearly Report */}
          <h3>Yearly Report</h3>
          {data.yearly.qualityReports.length > 0 && (
            <>
              {generateSummaryRow(generateChartData(data.yearly.qualityReports, data.yearly.auswertungen), "Gelieferte Positionen im Jahr")}
              {generateMonthlySummaryTable(data.monthly)}
              <BarChart
                width={600}
                height={400}
                layout="vertical"
                data={generateChartData(data.yearly.qualityReports, data.yearly.auswertungen)}
              >
                <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                <XAxis type="number" />
                <CartesianGrid stroke="#f5f5f5" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" barSize={20} />
              </BarChart>
            </>
          )}

          {/* Monthly Reports */}
          <h3>Monthly Reports</h3>
          {Object.entries(data.monthly).map(([month, monthData]) => (
            <div key={month}>
              <h4>{month}</h4>
              {monthData.qualityReports.length > 0 && (
                <>
                  {generateSummaryRow(generateChartData(monthData.qualityReports, monthData.auswertungen), `Gelieferte Positionen im ${month}`)}
                  <BarChart
                    width={600}
                    height={400}
                    layout="vertical"
                    data={generateChartData(monthData.qualityReports, monthData.auswertungen)}
                  >
                    <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                    <XAxis type="number" />
                    <CartesianGrid stroke="#f5f5f5" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" barSize={20} />
                  </BarChart>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GenerateAllGraphs;
