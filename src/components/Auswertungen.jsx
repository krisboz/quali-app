import { useState } from "react";
import ExcelInput from "./ExcelInput";
import AuswertungDisplay from "./AuswertungDisplay";

const Auswertungen = () => {
    const [auswertungen, setAuswertungen] = useState([]);

    const handleSetAuswertungen = (data) => {
        console.log("logged table",data)
        setAuswertungen(data)        
    }

    return (
        <div>
           <h2>Auswertungen</h2>
           <ExcelInput setAuswertungen={handleSetAuswertungen}/>
           <AuswertungDisplay/>
        </div>
    )
}

export default Auswertungen;