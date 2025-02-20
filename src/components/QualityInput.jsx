import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../styles/components/QualityInput.scss";
import { IoMdRemoveCircleOutline as RemoveButton } from "react-icons/io";


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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="quality-input">
      <h2>Quality Input</h2>
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
          <input type="text" name="auftragsnummer" value={formData.auftragsnummer} onChange={handleChange} pattern="AB-\d{2}-\d{4}" required />
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
                <button type="button" className="remove-foto-button" onClick={() => removePhoto(index)}><RemoveButton/></button>
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
    </div>
  );
};

export default QualityInput;
