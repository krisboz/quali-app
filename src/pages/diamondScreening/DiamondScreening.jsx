import { useState, useEffect } from "react";
import DiamondScreeningForm from "./components/DiamondScreeningForm";
import TableMadeTests from "./components/TableMadeTests";
import { getDiamondItems } from "../../api/auswertung";
import { MdFormatListBulletedAdd as ListAddIcon } from "react-icons/md";
import { FaThLarge as GroupedIcon } from "react-icons/fa";
import { IoAddOutline as AddIcon } from "react-icons/io5";
import { FaRegGem } from "react-icons/fa";




import DiamondItemsInput from "./components/DiamondItemsInput";
import "./DiamondScreening.scss";
import GroupedItemsInput from "./components/GroupedItemsInput";

const DiamondScreening = () => {
  const [itemsToTest, setItemsToTest] = useState([]);
  const [formToShow, setFormToShow] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());    // Current year


  useEffect(() => {
    //TODO custom month/year
    const fetchData = async () => {
      const formattedMonth = String(month).padStart(2, "0"); // Ensure MM format
      const selectedYear = year;
      try {
        const data = await getDiamondItems(formattedMonth, selectedYear);

        setItemsToTest(data.items);
      } catch (error) {
        console.error("Error fetching diamond screenings:", error);
      }
    };

    fetchData();
  }, [month, year]);

  return (
    <div>
              <h1 className="page-title"><FaRegGem/> Diamond Screening</h1>

      <div className="diamond-screening-container">
        <div className="title-container">
        <h2>Diamond Screening</h2>
        <div className="month-year-input">
          <input className="month-input" type="number" value={month} max={12} min={1} step={1} onChange={(e)=>setMonth(e.target.value)}/>
          <p> / </p>
          <input className="year-input" type="number" value={year} max={2100} min={2023} step={1} onChange={(e)=>setYear(e.target.value)}/>

        </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }} className="diamond-screening-controls-container">
          <button onClick={() => setFormToShow("single")}> <AddIcon/> </button>
          <button onClick={() => setFormToShow("list")}>
            <ListAddIcon />{" "}
          </button>
          <button onClick={() => setFormToShow("grouped")}><GroupedIcon/></button>
        </div>
      </div>
      {formToShow === "single" && (
        <DiamondScreeningForm setFormToShow={setFormToShow} />
      )}
      {formToShow === "list" && <DiamondItemsInput items={itemsToTest} />}
      {formToShow === "grouped" && <GroupedItemsInput items={itemsToTest} />}

      <TableMadeTests />
    </div>
  );
};

export default DiamondScreening;
