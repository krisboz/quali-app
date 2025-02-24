import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../styles/components/QualityInput.scss";
import { IoMdRemoveCircleOutline as RemoveButton, IoMdAddCircleOutline as AddButton, IoIosCloseCircleOutline as CloseButton } from "react-icons/io";
import { submitQualityReport } from "../api/api"; // Import the new API function
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
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpanded = () => {
        setIsExpanded(prev=>!prev)
    }

    const resetFormData = () => {
        setFormData({liefertermin: "",
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
        loesung: ""})
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setFormData((prevData) => ({ ...prevData, mitarbeiter: decoded.username }));
            console.log("USERNAME", decoded.username)
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
        formDataToSend.append("liefertermin", formData.liefertermin);
        formDataToSend.append("lieferant", formData.lieferant);
        formDataToSend.append("auftragsnummer", formData.auftragsnummer);
        formDataToSend.append("artikelnr", formData.artikelnr);
        formDataToSend.append("produkt", formData.produkt);
        formDataToSend.append("mangel", formData.mangel);
        formDataToSend.append("mangelgrad", formData.mangelgrad);
        formDataToSend.append("mangelgrund", formData.mangelgrund);
        formDataToSend.append("mitarbeiter", formData.mitarbeiter);
        formDataToSend.append("lieferantInformiertAm", formData.lieferantInformiertAm);
        formDataToSend.append("loesung", formData.loesung);
        
        // Append each photo to the FormData
        for (let i = 0; i < formData.fotos.length; i++) {
            formDataToSend.append("fotos", formData.fotos[i]);
        }
        console.log(formDataToSend);
        // Send data to the backend using the new API function
        try {
            const result = await submitQualityReport(formDataToSend);
            console.log(result.message); // Handle success response
            resetFormData()
            setIsExpanded(false)
        } catch (error) {
            console.error("Error saving quality report:", error);
        }
    };

   

    return (
        <>
        {isExpanded ?        <div className="quality-input">
            <div className="quality-input-title-container">
                <div></div>
                <div>
                <h2>Quality Input</h2>

                </div>

                <div className="close-input-button-container">
                    <button className="close-input-button" onClick={toggleExpanded}><CloseButton/></button>
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
                    <input type="text" name="auftragsnummer" value={formData.auftragsnummer} onChange={handleChange} pattern="B-\d{2}-\d{4}" required />
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
                    Mangelgrad:
                    <select name="mangelgrad" value={formData.mangelgrad} onChange={handleChange} required>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </label>

                <label>
                    Mangel Grund:
                    <select name="mangelgrund" value={formData.mangelgrund} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Oberfläche verkratzt/Poren">Oberfläche verkratzt/Poren</option>
                        <option value="Stein Defekt">Stein Defekt</option>
                        <option value="Falsche Teile / Zusammensetzung">Falsche Teile / Zusammensetzung</option>
                        <option value="Falsche Länge">Falsche Länge</option>
                        <option value="Gold/Stein Toleranz">Gold/Stein Toleranz</option>
                        <option value="Andere">Andere</option>
                    
                    </select>
                </label>

                <label>
                    Lieferant informiert am:
                    <input type="date" name="lieferantInformiertAm" value={formData.lieferantInformiertAm} onChange={handleChange} />
                </label>

                <div className="foto-input-container">
                    <label>
                        Fotos:
                        <input type="file" name="fotos" onChange={handleChange} multiple />
                    </label>

                    {formData.fotos.length > 0 && (
                        <ul>
                            {formData.fotos.map((file, index) => (
                                <li key={index} className="uploaded-foto-preview">
                                    {file.name}
                                    <button type="button" className="remove-foto-button" onClick={() => removePhoto(index)}>
                                        <RemoveButton />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <label>
                    Lösung:
                    <textarea name="loesung" value={formData.loesung} onChange={handleChange}></textarea>
                </label>

                <p>Mitarbeiter: {formData.mitarbeiter}</p>

                <button type="submit">Submit</button>
            </form>

        </div>:<div className="add-report-button-container">
            <button onClick={toggleExpanded} className="add-report-button"><AddButton/> Add new report</button>
            </div>}
        <QualityReports/>

        </>

    );
};

export default QualityInput;
