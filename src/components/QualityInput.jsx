import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import "../styles/components/QualityInput.scss";
import { IoMdRemoveCircleOutline as RemoveButton, IoMdAddCircleOutline as AddButton, IoIosCloseCircleOutline as CloseButton } from "react-icons/io";
import { submitQualityReport } from "../api/api";
import QualityReports from "./QualityReports";

const QualityInput = () => {
    const [formData, setFormData] = useState({
        liefertermin: "",
        lieferant: "",
        auftragsnummer: "",
        artikelnr: "",
        produkt: "",
        mangel: "",
        mangelgrad: "1",
        mangelgrund: "",
        mitarbeiter: "",
        lieferantInformiertAm: "",
        fotos: [],
        loesung: ""
    });
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null); // Reference to quality-input container

    const toggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    const resetFormData = () => {
        setFormData({
            liefertermin: "",
            lieferant: "",
            auftragsnummer: "",
            artikelnr: "",
            produkt: "",
            mangel: "",
            mangelgrad: "1",
            mangelgrund: "",
            mitarbeiter: "",
            lieferantInformiertAm: "",
            fotos: [],
            loesung: ""
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setFormData((prevData) => ({ ...prevData, mitarbeiter: decoded.username }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setFormData((prevData) => ({ ...prevData, fotos: [...prevData.fotos, ...files] }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const removePhoto = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            fotos: prevData.fotos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "fotos") {
                value.forEach((file) => formDataToSend.append("fotos", file));
            } else {
                formDataToSend.append(key, value);
            }
        });

        try {
            const result = await submitQualityReport(formDataToSend);
            console.log(result.message);
            resetFormData();
            setIsExpanded(false);
        } catch (error) {
            console.error("Error saving quality report:", error);
        }
    };

    // Handle clicks outside of quality-input and overlay
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target) &&
                !event.target.classList.contains("quality-input-overlay")
            ) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isExpanded]);

    return (
        <>
            {isExpanded ? (
                <>
                    {/* Overlay to detect clicks outside */}
                    <div className="quality-input-overlay" onClick={toggleExpanded}></div>

                    <div ref={inputRef} className="quality-input">
                        <div className="quality-input-title-container">
                            <div></div>
                            <div>
                                <h2>Quality Input</h2>
                            </div>
                            <div className="close-input-button-container">
                                <button className="close-input-button" onClick={toggleExpanded}>
                                    <CloseButton />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="quality-input-form">
                            <label>
                                Datum Liefertermin:
                                <input type="date" name="liefertermin" value={formData.liefertermin} onChange={handleChange} required />
                            </label>

                            <label>
                                Lieferant:
                                <select name="lieferant" value={formData.lieferant} onChange={handleChange} required>
                                    <option value="">Select</option>
                                    <option value="Adoma">Adoma</option>
                                    <option value="Breuning">Breuning</option>
                                    <option value="Giloy">Giloy</option>
                                    <option value="Rösch">Rösch</option>
                                    <option value="Schofer">Schofer</option>
                                    <option value="Sisti">Sisti</option>
                                </select>
                            </label>

                            <label>
                                Auftragsnummer:
                                <input type="text" name="auftragsnummer" value={formData.auftragsnummer} onChange={handleChange} pattern="[B|S]-\d{2}-\d{4}" required />
                            </label>

                            <label>
                                Artikelnr:
                                <input type="text" name="artikelnr" value={formData.artikelnr} onChange={handleChange} required />
                            </label>

                            <label>
                                Produkt:
                                <textarea name="produkt" value={formData.produkt} onChange={handleChange} placeholder="Optional"></textarea>
                            </label>

                            <label>
                                Mangel:
                                <input type="text" name="mangel" value={formData.mangel} onChange={handleChange} required />
                            </label>

                            <label>
                                Lösung:
                                <textarea name="loesung" value={formData.loesung} onChange={handleChange}></textarea>
                            </label>

                            <p>Mitarbeiter: {formData.mitarbeiter}</p>

                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="add-report-button-container">
                    <button onClick={toggleExpanded} className="add-report-button">
                        <AddButton /> Add new report
                    </button>
                </div>
            )}
            <QualityReports />
        </>
    );
};

export default QualityInput;
