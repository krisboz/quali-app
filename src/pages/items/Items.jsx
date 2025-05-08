import { useState, useEffect } from "react"
import ItemExcelInput from "./components/ItemExcelInput"
import { TbTags as ItemsIcon } from "react-icons/tb";
import "./Items.scss";


const Items = () => {
    const [items, setItems] = useState([])
    const [uploadMode, setUploadMode] = useState(false)

    const toggleUploadMode = () => {
        setUploadMode(prev=>!prev)
    }

    return(<main>
        <h1><ItemsIcon/> Items</h1>

        <div className="item-excel-input-container">
       {uploadMode? <ItemExcelInput setItems={setItems} toggleFunction={toggleUploadMode}/>:<button className="excel-input-button" onClick={toggleUploadMode}>Add Excel</button>}
        </div>
    </main>)
}

export default Items