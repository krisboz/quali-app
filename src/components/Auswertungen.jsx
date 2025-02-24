import { useState } from "react";
import ExcelInput from "./ExcelInput";
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
        </div>
    )
}

export default Auswertungen;