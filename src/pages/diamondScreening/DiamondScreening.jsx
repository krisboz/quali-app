import { useState, useEffect } from "react";
import DiamondScreeningForm from "./components/DiamondScreeningForm";
import TableMadeTests from "./components/TableMadeTests";
import { getDiamondItems } from "../../api/auswertung";
import { MdFormatListBulletedAdd as ListAddIcon } from "react-icons/md";
import DiamondItemsInput from "./components/DiamondItemsInput";

const DiamondScreening = () => {
  const [itemsToTest, setItemsToTest] = useState([]);
  const [formToShow, setFormToShow] = useState(null);

  useEffect(() => {
    //TODO custom month/year
    const fetchData = async () => {
      const formattedMonth = String(3).padStart(2, "0"); // Ensure MM format
      const selectedYear = 2025;
      try {
        const data = await getDiamondItems(formattedMonth, selectedYear);

        setItemsToTest(data.items);
        console.log("Items to test:", data);
      } catch (error) {
        console.error("Error fetching diamond screenings:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="diamond-screening-container">
        <h2>Diamond Screening</h2>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button onClick={() => setFormToShow("single")}> + </button>
          <button onClick={() => setFormToShow("list")}>
            <ListAddIcon />{" "}
          </button>
        </div>
      </div>
      {formToShow === "single" && (
        <DiamondScreeningForm setFormToShow={setFormToShow} />
      )}
      {formToShow === "list" && <DiamondItemsInput items={itemsToTest} />}
      <TableMadeTests />
    </div>
  );
};

export default DiamondScreening;
