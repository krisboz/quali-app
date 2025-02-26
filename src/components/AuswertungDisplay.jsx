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
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchAuswertungen({ ...searchParams, page: pagination.page, limit: pagination.limit });
            console.log("DATA FROM BE", data);
            setResults(data.rows);
            setPagination({ ...pagination, total: data.total });
        } catch (error) {
            console.error("Search error:", error);
        }
        setLoading(false);
    };

    const handlePageChange = async (newPage) => {
        setLoading(true);
        // Create a new pagination object with the updated page
        const newPagination = { ...pagination, page: newPage };
        setPagination(newPagination);
        
        try {
            // Use the new pagination values directly
            const data = await searchAuswertungen({ 
                ...searchParams, 
                page: newPage, 
                limit: newPagination.limit 
            });
            setResults(data.rows);
            setPagination(prev => ({ ...prev, total: data.total }));
        } catch (error) {
            console.error("Page change error:", error);
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
                        type={field === "Termin" ? "date" : "text"}
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

            {/* Table rendering added here */}
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
                            <th>Beschreibung</th>
                            <th>Beschreibung 2</th>
                            <th>Einzelpreis</th>
                            <th>Farbe</th>
                            <th>G-Preis</th>
                            <th>Größe</th>
                            <th>Menge offen</th>
                            <th>Urspr. Menge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, index) => (
                            <tr key={index}>
                                <td>{row.Beleg}</td>
                                <td>{row.Firma?.trim()}</td>
                                <td>{row[" Werkauftrag"]}</td>
                                <td>{row.Termin}</td>
                                <td>{row["Artikel-Nr."]}</td>
                                <td>{row[" Artikel-Nr. fertig"]}</td>
                                <td>{row.Beschreibung}</td>
                                <td>{row[" Beschreibung 2"]}</td>
                                <td>{row.Einzelpreis}</td>
                                <td>{row.Farbe}</td>
                                <td>{row["G-Preis"]}</td>
                                <td>{row.Größe}</td>
                                <td>{row["Menge offen"]}</td>
                                <td>{row["urspr. Menge"]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No results found.</p>
            )}

            {pagination.total > 0 && (
                <div>
                    <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>
                        Previous
                    </button>
                    <span>Page {pagination.page}</span>
                    <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => handlePageChange(pagination.page + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuswertungDisplay;