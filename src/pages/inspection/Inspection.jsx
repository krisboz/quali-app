import { useEffect, useState } from "react"
import "./styles/Inspection.scss";
import { searchAuswertungen } from "../../api/auswertung";
import OrderPreviewBlocks from "./components/OrderPreviewBlocks";

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
            "Artikel-Nr. fertig": entry[" Artikel-Nr. fertig"],
            "Werkauftrag": entry[" Werkauftrag"],
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

    const handleOrderLookUp = async (e) => {
        e.preventDefault();
        console.log(orderNumber)
        const beleg = orderNumber

        try {
            const result = await searchAuswertungen({beleg})
            const groupedResults = groupResultsByOrderNumber(result.rows);
console.log({groupedResults});
            setSearchResults(groupedResults)
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

            {searchResults.length>0 && <OrderPreviewBlocks groupedResults={searchResults}/>}


    </div>)
}

export default Inspection