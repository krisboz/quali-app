import { useEffect, useState } from "react"
import "./styles/Inspection.scss";
import { searchAuswertungen } from "../../api/auswertung";

const Inspection = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleOrderLookUp = async (e) => {
        e.preventDefault();
        console.log(orderNumber)
        const beleg = orderNumber

        try {
            const result = await searchAuswertungen({beleg})
            console.log(result)
            setSearchResults(result.rows)
        }catch(error) {
            console.log("ERROr", error)
        }

    }

    return(<div className="inspection-page page">

            <div className="order-input-container">
                <h1>Quality Inspection</h1>
                
                <form onSubmit={handleOrderLookUp} className="inspection-order-form">
                    <label> Order number: 
                    <input type="text" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} required={true}/>
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </div>

            {searchResults.length>0 && <p>{searchResults.length}</p>}


    </div>)
}

export default Inspection