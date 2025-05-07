/**
 * so for now this component has two placeholder paragraphs
 * titled first notes at the beginning and additional notes at the end
 * i would like you to change this component so that instead of those
 * placeholder paragraphs in the preview there should be a button with a "+" 
 * on it and when the user presses it it should open an input for a title
 * and a input for the paragraph, then the user can input something and they should have
 * in the input mode two buttons to cancel and to submit, if they submit
 * the button should be replaced by the inputted title and paragraph
 * it should then, in the preview, show the inputted text but also allow the user to
 * edit it or delete it if they want
 * 
 * then when they press on the download report as pdf button if theres only + buttons,
 * meaning the user hasnt inputted anything it should just omit that part and if they've written anything
   it should display it nicely in the pdf
 */
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
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
import logo from "../../assets/tc-report-logo.svg";
import "./ReportGenerator.scss";
import {
  fetchAllAuswertungen,
  fetchQualityReports,
  searchAuswertungen,
} from "../../api/api";
import {
  format,
  subDays,
  subMonths,
  subYears,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

import DefectiveItems from "../../pages/dashboard/ReportPreview/sections/DefectiveItems";

const pieData = [
  { name: "Passed", value: 400 },
  { name: "Failed", value: 100 },
];

const barData = [
  { name: "Week 1", value: 200 },
  { name: "Week 2", value: 300 },
  { name: "Week 3", value: 150 },
];

const COLORS = ["#4caf50", "#f44336"];

// Assuming `auswertungen` and `qualityReports` are already fetched data arrays
const returnFailRateStats = (inspections, auswertungen) => {
  // Utility function to filter data based on a date range
  const filterDataByDateRange = (data, startDate, endDate) => {
    return data.filter((item) => {
      const itemDate = new Date(item.liefertermin || item.Termin); // Adjust this based on your date field
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  };

  // Get today's date
  const today = new Date();

  // Last Week: Get the start and end of the last week
  const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 }); // 1 means Monday
  const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });

  // Last Month: Get the start and end of the last month
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  // Last Year: Get the start and end of the last fiscal year (April 1st of the last year to March 31st of this year)
  const lastYearStart = new Date(today.getFullYear() - 1, 3, 1); // April 1st of last year
  const lastYearEnd = new Date(today.getFullYear(), 2, 31); // March 31st of this year

  // Filter inspections, auswertungen, and quality reports based on the time ranges
  const lastWeekInspections = filterDataByDateRange(
    inspections,
    lastWeekStart,
    lastWeekEnd
  );
  const lastWeekAuswertungen = filterDataByDateRange(
    auswertungen,
    lastWeekStart,
    lastWeekEnd
  );

  const lastMonthInspections = filterDataByDateRange(
    inspections,
    lastMonthStart,
    lastMonthEnd
  );
  const lastMonthAuswertungen = filterDataByDateRange(
    auswertungen,
    lastMonthStart,
    lastMonthEnd
  );

  const lastYearInspections = filterDataByDateRange(
    inspections,
    lastYearStart,
    lastYearEnd
  );
  const lastYearAuswertungen = filterDataByDateRange(
    auswertungen,
    lastYearStart,
    lastYearEnd
  );

  // Logging the filtered data for debugging or for UI rendering
  const stats = {
    lastWeek: {
      inspections: lastWeekInspections,
      auswertungen: lastWeekAuswertungen,
    },
    lastMonth: {
      inspections: lastMonthInspections,
      auswertungen: lastMonthAuswertungen,
    },
    lastYear: {
      inspections: lastYearInspections,
      auswertungen: lastYearAuswertungen,
    },
  };

  console.log("Data for Last Week, Month, and Year:", stats);
  console.table(stats);

  // Here you can calculate fail rates or other stats using the filtered data
};

const ReportGenerator = () => {
  const reportRef = useRef(null);

  const [first, setFirst] = useState("");
  const [additional, setAdditional] = useState("");

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const [auswertungen, setAuswertungen] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSupplier, setSelectedSupplier] = useState("Adoma");
  const [visibleSection, setVisibleSection] = useState("allTime");

  useEffect(() => {
    const fetchAndSetData = async () => {
      const today = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      const terminTo = `${today.getFullYear()}-${pad(
        today.getMonth() + 1
      )}-${pad(today.getDate())}`;
      try {
        const [inspectionsRes, auswertungenRes] = await Promise.all([
          fetchQualityReports("2024-04-01", "2025-05-04"),
          searchAuswertungen({
            terminFrom: "2024-04-01",
            terminTo: "2025-05-04",
            pagesOff: true,
          }),
        ]);
        const tempAuswertungen = auswertungenRes.rows;
        setInspections(inspectionsRes);
        setAuswertungen(auswertungenRes.rows);
        returnFailRateStats(inspectionsRes, tempAuswertungen);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error(err.message);
      }
    };
    fetchAndSetData();
  }, []);

  const handleExportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    // PDF configuration
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20; // 20mm margin
    let currentY = margin;

    // Helper function to add elements with page break check
    const addElementToPDF = async (element, isSectionBreak = false) => {
      const scale = 2; // Higher quality
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if we need a new page
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      // Add the image to PDF

      pdf.addImage(
        canvas,
        "PNG",
        margin,
        currentY,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
        0,
        { compression: "FAST", renderingIntent: "PERCEPTUAL" }
      );

      // Update current position
      currentY += imgHeight + (isSectionBreak ? 10 : 0);
    };

    // Temporarily modify styles for PDF export
    const originalStyles = {
      visibility: element.style.visibility,
      position: element.style.position,
    };
    element.style.visibility = "hidden";
    element.style.position = "absolute";

    // Capture each section separately
    const sections = element.querySelectorAll(
      ".report-section, .report-header"
    );
    for (const section of sections) {
      section.style.width = `${pageWidth - margin * 2}mm`;
      section.style.backgroundColor = "#ffffff";
      section.style.visibility = "visible";
      section.style.position = "relative";

      await addElementToPDF(section, true);

      // Reset styles
      section.style.width = "";
      section.style.backgroundColor = "";
      section.style.visibility = "";
      section.style.position = "";
    }

    // Restore original styles
    element.style.visibility = originalStyles.visibility;
    element.style.position = originalStyles.position;

    pdf.save("quality-report.pdf");
  };

  // Example usage of the function:
  // Assuming inspections, auswertungen, and qualityReports are already fetched data arrays

  /**
   * first notes
   * basic overview
   *  fail rate this month
   *    fail rate
   *    recieved/failed = fail rate
   *
   *    failed items
   *
   *  fail rate last month
   *  fail rate last business year
   *
   * stats per supplier
   * gold testing
   *  table, something with the wrong ones
   * diamond screening
   *  some display
   * additioinal notes
   */

  return (
    <div className="report-wrapper">
      <label>
        First
        <textarea value={first} onChange={(e) => setFirst(e.target.value)} />
      </label>

      <label>
        Additional
        <input
          type="text"
          value={additional}
          onChange={(e) => setAdditional(e.target.value)}
        />
      </label>

      <div className="report-content" ref={reportRef}>
        <div className="report-header">
          <img src={logo} alt="Company Logo" className="report-logo" />
          <div className="report-title">
            <h2>Quality Report</h2>
            <p>{currentDate}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>First Notes</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{first}</p>
        </div>

        <div className="report-section">
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

        <div className="report-section">
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

        <div className="report-section">
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

        <div className="report-section">
          <h3>Additional Notes</h3>
          <p>{additional}</p>
        </div>
      </div>
      <div className="report-download-button">
        <button onClick={handleExportPDF}>Download Report as PDF</button>
      </div>
    </div>
  );
};

export default ReportGenerator;

/**
 * 
 

const handleExportPDF = async () => {
  const element = reportRef.current;
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl);
  
};*/
