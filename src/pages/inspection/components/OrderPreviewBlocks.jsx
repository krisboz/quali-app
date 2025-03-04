import { useState } from "react"
import "../styles/OrderPreviewBlocks.scss";
import { BsHandIndexFill } from "react-icons/bs";

const OrderPreviewBlocks = ({groupedResults}) => {
    const [chosenOrder, setChosenOrder] = useState(null)

    const handleBlockClick = (e, index) => {
        console.log(groupedResults[index])
        setChosenOrder(groupedResults[index])
    }

return (
    <div className="grouped-results-container">
    {groupedResults.map((result, index)=><div className="order-preview-block" key={index} onClick={e=>handleBlockClick(e, index)}>
        <h2>{result.orderNumber}</h2>
        <h3>{result.firma}</h3>
        <p> Items: {result.items.length}</p>
    </div>)}
</div>)
}

export default OrderPreviewBlocks