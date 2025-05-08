import { useState, useEffect } from "react";
import DiamondItemsInput from "./DiamondItemsInput";
import "../styles/GroupedItemsInput.scss";

// Group items by 'Beleg' and return a sorted array based on 'Termin'
const groupByBeleg = (items) => {
  const grouped = items.reduce((acc, item) => {
    if (acc[item.Beleg]) {
      acc[item.Beleg].items.push(item);
    } else {
      acc[item.Beleg] = {
        beleg: item.Beleg,
        termin: item.Termin,
        firma: item.Firma,
        items: [item],
      };
    }
    return acc;
  }, {});

  // Sort groups by termin (format: dd.mm.yyyy)
  return Object.values(grouped).sort((a, b) => {
    const dateA = new Date(a.termin.split('.').reverse().join('-'));
    const dateB = new Date(b.termin.split('.').reverse().join('-'));
    return dateA - dateB;
  });
};

const GroupedItemsInput = ({ items }) => {
  const [groupedItems, setGroupedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const grouped = groupByBeleg(items);
    setGroupedItems(grouped);
  }, [items]);

  const handleClick = (items) => {
    console.log("Selected items:", items);
    setSelectedItems(items);
  };

  if(selectedItems.length!==0) {
    return (<div>
      <div className="close-button-container">
        <button onClick={()=>setSelectedItems([])}>X</button>
      </div>
      <DiamondItemsInput items={selectedItems}/>
    </div>)
  }

  return (
    <div className="grouped-items-wrapper">
      <h2>Grouped Items</h2>

      <div className="grouped-items-container">
        {groupedItems.map((group) => (
          <div
            key={group.beleg}
            className="grouped-items-block"
            onClick={() => handleClick(group.items)}
          >
            <p>{group.termin}</p>
            <h3>{group.beleg}</h3>
            <p>{group.firma}</p>
            <p>Diamond Items: {group.items.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupedItemsInput;
