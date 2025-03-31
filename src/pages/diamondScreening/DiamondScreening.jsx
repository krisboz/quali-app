import { useState } from "react";
import DiamondScreeningForm from "./components/DiamondScreeningForm";
import TableMadeTests from "./components/tableMadeTests";
const DiamondScreening = () => {
  return (
    <div>
      <DiamondScreeningForm />
      <TableMadeTests />
    </div>
  );
};

export default DiamondScreening;
