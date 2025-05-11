import { useState, useEffect } from "react";
import ItemExcelInput from "./components/ItemExcelInput";
import { TbTags as ItemsIcon } from "react-icons/tb";
import "./Items.scss";
import { fetchItems } from "../../api/items";
import ItemsTable from "./components/ItemsTable";

const Items = () => {
  const [items, setItems] = useState([]);
  const [uploadMode, setUploadMode] = useState(false);

  useEffect(() => {
    const fetchApiItems = async () => {
      const data = await fetchItems();
      setItems(data);
    };

    fetchApiItems();
  }, []);

  const toggleUploadMode = () => {
    setUploadMode((prev) => !prev);
  };

  return (
    <main>
      <h1>
        <ItemsIcon /> Items
      </h1>

      <div className="item-excel-input-container">
        {uploadMode ? (
          <ItemExcelInput
            setItems={setItems}
            toggleFunction={toggleUploadMode}
          />
        ) : (
          <button className="excel-input-button" onClick={toggleUploadMode}>
            Add Excel
          </button>
        )}
      </div>
      <div className="items-table-container">
        <ItemsTable items={items} />
      </div>
    </main>
  );
};

export default Items;
