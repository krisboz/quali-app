import React, { useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Sample data for the charts (replace with your real data)
const pieData = [
  { name: "Passed", value: 400 },
  { name: "Failed", value: 100 },
];

const barData = [
  { name: "Week 1", value: 200 },
  { name: "Week 2", value: 300 },
  { name: "Week 3", value: 150 },
];

const COLORS = ["#4caf50", "#f44336"]; // green, red

const ReportGenerator = () => {
  const reportRef = useRef(null);

  // Trigger PDF export
  const handleExportPDF = async () => {
    const element = reportRef.current;

    // Render the HTML to canvas
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Calculate image scaling for A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Quality_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="report-wrapper"
      style={{ fontFamily: "sans-serif", padding: "2rem" }}
    >
      {/* This is the printable area */}
      <div
        ref={reportRef}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header with logo and name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <img
            src="/logo.png"
            alt="Company Logo"
            style={{ height: "60px", marginRight: "1rem" }}
          />
          <div>
            <h2 style={{ margin: 0 }}>Awesome Company Inc.</h2>
            <p style={{ margin: 0, color: "#555" }}>
              Quality Report – {currentDate}
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>Quality Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>Weekly Quality Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Notes Section */}
        <div style={{ marginTop: "2rem" }}>
          <h3>Additional Notes</h3>
          <p>
            This month saw a consistent performance across all weeks. We
            recommend continuing the current quality assurance practices and
            reviewing the failed batch for further insights.
          </p>
        </div>
      </div>

      {/* Button to trigger PDF download */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={handleExportPDF}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Download Report as PDF
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator;
