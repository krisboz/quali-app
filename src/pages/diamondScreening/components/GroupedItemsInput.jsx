import { useState } from "react"
import DiamondItemsInput from "./DiamondItemsInput"

const GroupedItemsInput = ({items}) => {

    const [groupedItems, setGroupedItems] = useState([]);

    console.log("Grouped", items)
    return(
        <div>
            GroupedItemsInput
        </div>
    )
}

export default GroupedItemsInput