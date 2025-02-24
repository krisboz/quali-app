import { useState } from "react";
import { searchAuswertungen } from "../api/api";
const AuswertungDisplay = () => {
    const [searchParams, setSearchParams] = useState({
        Beleg: "",
        Firma: "",
        Werkauftrag: "",
        Termin: "",
        ArtikelNr: "",
        ArtikelNrFertig: "",
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchAuswertungen(searchParams);
            setResults(data);
        } catch (error) {
            console.error("Search error:", error);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Search Auswertungen</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                {["Beleg", "Firma", "Werkauftrag", "Termin", "ArtikelNr", "ArtikelNrFertig"].map((field) => (
                    <input
                        key={field}
                        type="text"
                        name={field}
                        value={searchParams[field]}
                        onChange={handleInputChange}
                        placeholder={field}
                        style={{ padding: "5px", borderRadius: "5px", border: "1px solid gray" }}
                    />
                ))}
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {results.length > 0 ? (
                <table border="1" style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                    <thead>
                        <tr>
                            <th>Beleg</th>
                            <th>Firma</th>
                            <th>Werkauftrag</th>
                            <th>Termin</th>
                            <th>Artikel-Nr.</th>
                            <th>Artikel-Nr. fertig</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, index) => (
                            <tr key={index}>
                                <td>{row.Beleg}</td>
                                <td>{row.Firma}</td>
                                <td>{row[" Werkauftrag"]}</td>
                                <td>{row.Termin}</td>
                                <td>{row["Artikel-Nr."]}</td>
                                <td>{row[" Artikel-Nr. fertig"]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default AuswertungDisplay;
