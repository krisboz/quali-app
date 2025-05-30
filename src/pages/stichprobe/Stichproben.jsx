import React, { useEffect, useState } from "react";
import StichprobenTable from "./StichprobenTable";
import StichprobeForm from "./StichprobeForm";
import { fetchStichproben } from "../../api/stichproben";
import { PiEyedropperSampleFill as StichprobenIcon } from "react-icons/pi";

import "./Stichproben.scss";

const Stichproben = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchStichproben();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <p>Loading stichproben...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
          <h1><StichprobenIcon/> Prüfprotokoll</h1>
  <section>
      <button onClick={() => setFormOpen((prev) => !prev)}>Add Manually</button>
      {formOpen && <StichprobeForm closeForm={() => setFormOpen(false)} />}
      <StichprobenTable data={data} setData={setData} />
    </section>
    </>
  
  );
};

export default Stichproben;
