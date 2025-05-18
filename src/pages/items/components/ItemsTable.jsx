import React, { useState } from "react";
import "../styles/ItemsTable.scss";
import ItemView from "./ItemView";

const ItemsTable = ({ items }) => {
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState("default");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter((item) =>
    item.Artikelnummer.toLowerCase().includes(filterText.toLowerCase())
  );

  const groupByFirstLetter = () => {
    return filteredItems.reduce((acc, item) => {
      const firstLetter = item.Artikelnummer[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(item);
      return acc;
    }, {});
  };

  const groupBySubgroup = (groupItems) => {
    return groupItems.reduce((acc, item) => {
      const parts = item.Artikelnummer.split("-");
      const subgroup = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : parts[0];
      if (!acc[subgroup]) acc[subgroup] = [];
      acc[subgroup].push(item);
      return acc;
    }, {});
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const renderTable = (items) => (
    <table className="jewelry-table">
      <thead>
        <tr>
          <th>Artikelnummer</th>
          <th>Bezeichnung</th>
          <th>Bestand</th>
          <th>Lieferantenname</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.Artikelnummer} onClick={() => handleRowClick(item)}>
            <td>{item.Artikelnummer}</td>
            <td>{item.Bezeichnung}</td>
            <td>{item.Bestand}</td>
            <td>{item.Lieferantenname}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderGroupedView = () => {
    const groups = groupByFirstLetter();

    if (selectedSubgroup) {
      const subgroupItems =
        groups[selectedGroup]?.filter((item) =>
          item.Artikelnummer.startsWith(selectedSubgroup)
        ) || [];
      return (
        <>
          <button
            className="back-button"
            onClick={() => setSelectedSubgroup(null)}
          >
            ← Back to {selectedGroup}
          </button>
          {renderTable(subgroupItems)}
        </>
      );
    }

    if (selectedGroup) {
      const subgroups = groupBySubgroup(groups[selectedGroup]);
      return (
        <>
          <button
            className="back-button"
            onClick={() => setSelectedGroup(null)}
          >
            ← Back to groups
          </button>
          <div className="subgroup-container">
            {Object.keys(subgroups).map((subgroup) => (
              <div
                key={subgroup}
                className="subgroup-box"
                onClick={() => setSelectedSubgroup(subgroup)}
              >
                {subgroup}
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="group-container">
        {Object.keys(groups).map((group) => (
          <div
            key={group}
            className="group-box"
            onClick={() => setSelectedGroup(group)}
          >
            {group}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="jewelry-table-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Filter by Artikelnummer..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <button
          className="toggle-view"
          onClick={() =>
            setViewMode((prev) => (prev === "default" ? "grouped" : "default"))
          }
        >
          {viewMode === "default"
            ? "Switch to Grouped View"
            : "Switch to Default View"}
        </button>
      </div>

      {viewMode === "default"
        ? renderTable(filteredItems)
        : renderGroupedView()}

      {/**
           * 
  "Artikelgruppe": "100.15.05",
  "Artikelnummer": "A-Dr-p-rg",
  "Bestand": 19,
  "Bezeichnung": "SIGNATURE Drop Clasp Diamond Pavé",
  "Inaktiv": 0,
  "LetzterEK": 51.33,
  "Lieferantenname": "BREUNING CO. LTD.",
  "Lieferfrist": 35,
  "MakeOrBuy": "K",
  "Matchcode": "rg",
  "Mengeneinheit": "piece",
  "UVP - Euro ": 1050,
  "VK 1 - Euro": 477,
  "verfügbar in": 42,
  "_ARTIKELGRUPPENEU": "101.001.00.02",
  "_BESTSELLER": 1,
  "_MARKETINGFOCUS": 1,
  "_PARETOCLUSTER": "AA",
  "_REGULARREPLENISHMENT": 1,
  "_SILHOUETTE": "SIGNATURE Accessory Drop Clasp"
           */}

      {selectedItem && (
        <ItemView selectedItem={selectedItem} closeModal={closeModal} />
      )}
    </div>
  );
};

export default ItemsTable;
