import { useState } from "react";
import DiamondScreeningForm from "./components/DiamondScreeningForm";
import TableMadeTests from "./components/TableMadeTests";
const DiamondScreening = () => {
  return (
    <div>
      <DiamondScreeningForm />
      <TableMadeTests />
    </div>
  );
};

export default DiamondScreening;
