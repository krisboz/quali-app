import React from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { FaDownload as Download } from "react-icons/fa6";

const STATUS_COLORS = {
  approved: "#4caf50",
  rejected: "#f44336",
  needs_review: "#ff9800",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  logoPlaceholder: {
    fontSize: 10,
    fontStyle: "italic",
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  topDate: {
    fontSize: 10,
    color: "#888",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  statusBadge: {
    textAlign: "center",
    marginBottom: 10,
    paddingVertical: 4,
    color: "white",
    fontSize: 12,
    borderRadius: 4,
    width: 180,
    alignSelf: "center",
  },
  sectionContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLeft: {
    flex: 2,
  },
  sectionRight: {
    flex: 1,
    paddingLeft: 10,
    marginTop: 12, // push remarks block downward
  },
  sectionHeader: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#2c3e50",
    borderBottom: 1,
    paddingBottom: 4,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  checkmark: {
    fontWeight: "bold",
    width: 10,
    textAlign: "center",
    marginRight: 6,
  },
  remarkTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  remarkText: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#555",
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "left",
  },
});

const SECTIONS_CONFIG = [
  {
    key: "allgemein",
    title: "Allgemein",
    possibleChecks: [
      "Alle Elementen vorhanden",
      "Korrekte Zusammensetzung",
      "Stempel vorhanden und korrekt",
      "Goldlegierung passt",
    ],
  },
  {
    key: "oberflaeche",
    title: "Oberfläche",
    possibleChecks: [
      "Gute Oberfläche (Politur)",
      "Keine Kratzer / Matten Stellen",
      "Keine Poren",
      "Rhodium gleichmäßig verteilt, ohne Flecken",
    ],
  },
  {
    key: "masse",
    title: "Maße",
    possibleChecks: [
      "Maße stimmen mit dem PIS überein (in Toleranzbereich)",
      "Goldgewicht im Toleranzbereich",
    ],
  },
  {
    key: "mechanik",
    title: "Mechanik",
    possibleChecks: [
      "Bewegliche Elemente sind beweglich",
      "Keine offenen Links",
    ],
  },
  {
    key: "steine",
    title: "Steine",
    possibleChecks: [
      "Nicht beschädigt/kaputt",
      "Fest gefasst - kein wackeln",
      "Steine sitzen gerade in der Fassung",
      "Gute, saubere Fasskante",
      "Kein kleber vorhanden",
      "Diamanten getestet",
    ],
  },
  {
    key: "weiter",
    title: "Weiterer Verlauf",
    possibleChecks: [
      "Qualität genehmigt",
      "Zurück an Hersteller",
      "Wird in TCG überarbeitet",
      "Quali OK + Info an Hersteller",
    ],
  },
];

const StichprobePDF = ({ entry }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.topHeader}>
        <Text style={styles.logoPlaceholder}>LOGO-PLACE</Text>
        <Text style={styles.topTitle}>Prüfprotokoll</Text>
        <Text style={styles.topDate}>
          {new Date(entry.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text>Firma</Text>
          <Text>{entry.firma}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text>Artikel-Nr</Text>
          <Text>{entry.artikelnr}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text>Auftragsnummer</Text>
          <Text>{entry.orderNumber}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text>Erstellt am</Text>
          <Text>{new Date(entry.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.statusBadge,
          { backgroundColor: STATUS_COLORS[entry.status] || "#999" },
        ]}
      >
        Status: {entry.status.replace("_", " ").toUpperCase()}
      </Text>

      {SECTIONS_CONFIG.map(({ key, title, possibleChecks }) => {
        const checks = JSON.parse(entry[`${key}_checks`] || "[]");
        const remarks = entry[`${key}_remarks`];

        const filteredChecks =
          key === "weiter"
            ? possibleChecks.filter((check) => checks.includes(check))
            : possibleChecks;

        return (
          <View key={key} style={styles.sectionContainer}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionHeader}>{title}</Text>
              {filteredChecks.map((check, idx) => {
                const isChecked = checks.includes(check);
                return (
                  <View style={styles.checklistItem} key={idx}>
                    <Text
                      style={[
                        styles.checkmark,
                        { color: isChecked ? "#4caf50" : "#f44336" },
                      ]}
                    >
                      {isChecked ? "✓" : "✗"}
                    </Text>
                    <Text style={{ color: isChecked ? "black" : "#999" }}>
                      {check}
                    </Text>
                  </View>
                );
              })}
            </View>
            {remarks && (
              <View style={styles.sectionRight}>
                <Text style={styles.remarkTitle}>Bemerkungen</Text>
                <Text style={styles.remarkText}>{remarks}</Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text>Prüfer: {entry.mitarbeiter}</Text>
        <Text>__________________________</Text>
        <Text>Unterschrift</Text>
      </View>
    </Page>
  </Document>
);

const PrintStichprobeButton = ({ entry }) => {
  const handleOpenPDF = async () => {
    const blob = await pdf(<StichprobePDF entry={entry} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleOpenPDF}
      className="download-stichproben action-svg-button"
    >
      <Download />
    </button>
  );
};

export default PrintStichprobeButton;
