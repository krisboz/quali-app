import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaDownload as Download } from "react-icons/fa6";
const STATUS_COLORS = {
  approved: "#4caf50",
  rejected: "#f44336",
  needs_review: "#ff9800",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

const PrintStichprobeButton = ({ entry, customClass = null }) => {
  const {
    allgemein_checks,
    allgemein_remarks,
    artikelnr,
    created_at,
    firma,
    masse_checks,
    masse_remarks,
    mechanik_checks,
    mechanik_remarks,
    mitarbeiter,
    oberflaeche_checks,
    oberflaeche_remarks,
    orderNumber,
    status,
    steine_checks,
    steine_remarks,
    weiter_checks,
    weiter_remarks,
  } = entry;

  // Helper to parse JSON arrays safely
  const parseChecks = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const sections = [
    {
      title: "Allgemein",
      checks: parseChecks(allgemein_checks),
      remarks: allgemein_remarks,
    },
    {
      title: "Oberfläche",
      checks: parseChecks(oberflaeche_checks),
      remarks: oberflaeche_remarks,
    },
    {
      title: "Maße",
      checks: parseChecks(masse_checks),
      remarks: masse_remarks,
    },
    {
      title: "Mechanik",
      checks: parseChecks(mechanik_checks),
      remarks: mechanik_remarks,
    },
    {
      title: "Steine",
      checks: parseChecks(steine_checks),
      remarks: steine_remarks,
    },
    {
      title: "Weiterer Verlauf",
      checks: parseChecks(weiter_checks),
      remarks: weiter_remarks,
    },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();

    // Logo placeholder
    doc.setFillColor(230);
    doc.rect(15, 10, 40, 20, "F");
    doc.setFontSize(10);
    doc.text("Company Logo", 35, 22, { align: "center" });

    // Header info
    doc.setFontSize(18);
    doc.text("Stichprobe Report", 105, 15, null, null, "center");

    doc.setFontSize(11);
    doc.text(`Firma: ${firma}`, 15, 40);
    doc.text(`Artikel-Nr: ${artikelnr}`, 15, 47);
    doc.text(`Order Number: ${orderNumber}`, 15, 54);
    doc.text(`Erstellt: ${formatDate(created_at)}`, 15, 61);

    // Status box
    doc.setFillColor(STATUS_COLORS[status] || "#999");
    doc.rect(150, 35, 45, 14, "F");
    doc.setTextColor("#fff");
    doc.setFontSize(14);
    doc.text(
      `Status: ${status.replace("_", " ").toUpperCase()}`,
      173,
      44,
      null,
      null,
      "center"
    );
    doc.setTextColor("#000");

    let y = 75;

    sections.forEach(({ title, checks, remarks }) => {
      doc.setFontSize(13);
      doc.text(title, 15, y);
      y += 6;

      checks.forEach((check) => {
        doc.setFontSize(10);
        doc.text(`- ${check}`, 20, y);
        y += 6;
      });

      if (remarks) {
        doc.setFontSize(10);
        doc.setTextColor("#555");
        doc.text(`Bemerkung: ${remarks}`, 20, y);
        y += 10;
        doc.setTextColor("#000");
      } else {
        y += 6;
      }
    });

    // Mitarbeiter & signature line
    y += 15;
    doc.setFontSize(12);
    doc.text(`Mitarbeiter: ${mitarbeiter}`, 15, y);
    y += 12;
    doc.line(15, y, 80, y); // signature line
    doc.text("Unterschrift", 15, y + 6);

    doc.save(`Stichprobe_${artikelnr || orderNumber || "Report"}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="download-stichproben action-svg-button"
    >
      <Download />
    </button>
  );
};

export default PrintStichprobeButton;
