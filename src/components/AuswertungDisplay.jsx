import { useState } from "react";
import { searchAuswertungen } from "../api/api";
import Loading from "./Loading";
import "../styles/components/AuswertungDisplay.scss";
import { toast } from "react-toastify";

const AuswertungDisplay = () => {
    const [searchParams, setSearchParams] = useState({
        beleg: "",
        firma: "",
        werkauftrag: "",
        termin: "",
        artikelnr: "",
        artikelnrfertig: "",
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 100,
        total: 0,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchAuswertungen({ ...searchParams, page: pagination.page, limit: pagination.limit });
            console.log("Auswertung data", data.rows)
            setResults(data.rows);
            setPagination({ ...pagination, total: data.total });
        } catch (error) {
            console.error("Search error:", error);
            toast.error(`Error searching: ${error.message}`)
        }
        setLoading(false);
    };

    const handlePageChange = async (newPage) => {
        setLoading(true);
        const newPagination = { ...pagination, page: newPage };
        setPagination(newPagination);
        
        try {
            const data = await searchAuswertungen({ 
                ...searchParams, 
                page: newPage, 
                limit: newPagination.limit 
            });
            setResults(data.rows);
            setPagination(prev => ({ ...prev, total: data.total }));
        } catch (error) {
            console.error("Page change error:", error);
            toast.error(`Error changing page: ${error.message}`)
        }
        setLoading(false);
    };

    const handleLimitChange = async (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
        setLoading(true);
        try {
            const data = await searchAuswertungen({ ...searchParams, page: 1, limit: newLimit });
            setResults(data.rows);
            setPagination((prev) => ({ ...prev, total: data.total }));
        } catch (error) {
            console.error("Limit change error:", error);
        }
        setLoading(false);
    };

    return (
        <div className="auswertung-display">
            <h2>Search Parameters</h2>
            <form style={{ display: "flex", gap: "10px", marginBottom: "10px" }} onSubmit={handleSearch}>
                {["beleg", "firma", "werkauftrag", "termin", "artikelnr", "artikelnrfertig"].map((field) => (
                    <input
                        key={field}
                        type={field === "termin" ? "date" : "text"}
                        name={field}
                        value={searchParams[field]}
                        onChange={handleInputChange}
                        placeholder={field.replace(/^\w/, c => c.toUpperCase())}
                    />
                ))}
                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {loading && <div className="loading-container-overlay"><Loading/></div>}

            {pagination.total > 0 && (
                <div className="pagination-controls-container"> 
                    <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>
                        Previous
                    </button>
                    <span>{pagination.page} / {Math.ceil(pagination.total/pagination.limit)}</span>
                    <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => handlePageChange(pagination.page + 1)}>
                        Next
                    </button>
                    <select value={pagination.limit} onChange={handleLimitChange}>
                        {[20, 50, 100, 200, 500].map(limit => (
                            <option key={limit} value={limit}>{limit} results per page</option>
                        ))}
                    </select>
                </div>
            )}

            {results.length > 0 ? (
                <table border="1" style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                    <thead>
                        <tr>
                            <th>Beleg</th>
                            <th>Firma</th>
                            <th>Werkauftrag</th>
                            <th>Termin</th>
                            <th>Artikel-Nr.</th>
                            <th>Beschreibung</th>
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
                                <td    onClick={(e) =>
                      navigator.clipboard.writeText(row.Beleg)
                    }
                    className="copy-on-click-p">{row.Beleg}</td>
                                <td>{row.Firma?.trim()}</td>
                                <td    onClick={(e) =>
                      navigator.clipboard.writeText(row.Werkauftrag)
                    }
                    className="copy-on-click-p">{row["Werkauftrag"]}</td>
                                <td>{row.Termin}</td>
                                <td    onClick={(e) =>
                      navigator.clipboard.writeText(row["Artikel-Nr. fertig"])
                    }
                    className="copy-on-click-p">{row["Artikel-Nr. fertig"]}</td>
                                <td>{row["Beschreibung 2"]}</td>
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
        </div>
    );
};

export default AuswertungDisplay;
