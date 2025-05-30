import { useEffect, useState } from "react"
import "./styles/Inspection.scss";
import { searchAuswertungen } from "../../api/auswertung";
import OrderPreviewBlocks from "./components/OrderPreviewBlocks";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { FaMagnifyingGlass as InspectionIcon } from "react-icons/fa6";


const groupResultsByOrderNumber = (results) => {
    const grouped = {};

    results.forEach((entry) => {
        const orderNumber = entry.Beleg;
        
        if (!grouped[orderNumber]) {
            grouped[orderNumber] = {
                orderNumber,
                firma: entry.Firma,
                items: []
            };
        }

        grouped[orderNumber].items.push({
            "Artikel-Nr. fertig": entry["Artikel-Nr. fertig"],
            "Werkauftrag": entry["Werkauftrag"],
            Einzelpreis: entry.Einzelpreis,
            Farbe: entry.Farbe,
            "G-Preis": entry["G-Preis"],
            Größe: entry.Größe,
            "Menge offen": entry["Menge offen"],
            Termin: entry.Termin,
            id: entry.id,
            "urspr. Menge": entry["urspr. Menge"]
        });
    });

    return Object.values(grouped);
};


const Inspection = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleOrderLookUp = async (e) => {
        e.preventDefault();
        console.log(orderNumber)
        const beleg = orderNumber
        setLoading(true)
        setSearchResults([]);

        try {
            const result = await searchAuswertungen({beleg})
            const groupedResults = groupResultsByOrderNumber(result.rows);
            console.log({groupedResults})
            setSearchResults(groupedResults)
            setLoading(false)
            toast.info(`${groupedResults.length>1?`${groupedResults.length} orders`: `${groupedResults.length} order`}  found.`)
        }catch(error) {
            console.log("ERROr", error)
            toast.error(error.message)
        }

    }

    return(<div className="inspection-page page">

            <div className="order-input-container">
                <h1 className="page-title"><InspectionIcon/> Quality Inspection</h1>
                <div className="short-description">
                    <p>Enter the order number below to find the order you're working on. Select the correct order from the list, then click on any individual item to begin the quality control process.</p>

<p><strong>Note:</strong> You only need to complete a report for items that are <strong>defective</strong>. If everything looks good, there's no need to take any action.</p>
                </div>
                
                <form onSubmit={handleOrderLookUp} className="inspection-order-form">
                    <label> Order number: 
                    <input type="text" value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} required={true}/>
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </div>

            {loading && <Loading/>}

            {searchResults.length>0 && <OrderPreviewBlocks groupedResults={searchResults}/>}


    </div>)
}

export default Inspection