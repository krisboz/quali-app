import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../styles/InspectionInput.scss";
import { IoMdRemoveCircleOutline as RemoveButton, IoMdAddCircleOutline as AddButton, IoIosCloseCircleOutline as CloseButton } from "react-icons/io";
import { submitQualityReport } from "../../../api/api"; // Import the new API function
import Loading from "../../../components/Loading"; // Import loading component

const InspectionInput = ({ chosenOrder, clickedItem, setClickedItem }) => {
  const [formData, setFormData] = useState({
    liefertermin: "",
    lieferant: chosenOrder.firma,
    auftragsnummer: chosenOrder.orderNumber,
    artikelnr: clickedItem["Artikel-Nr. fertig"],
    produkt: "",
    mangel: "",
    mangelgrad: "1",
    mangelgrund: "",
    mitarbeiter: "",
    lieferantInformiertAm: "",
    fotos: [],
    loesung: ""
  });
  const [loading, setLoading] = useState(false);

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
      console.log("USERNAME", decoded.username);
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

    setLoading(true);

    // Send data to the backend using the new API function
    try {
      const result = await submitQualityReport(formDataToSend);
      console.log(result.message); // Handle success response
      resetFormData();
      setLoading(false); // Stop the loading spinner
      setClickedItem(null); // Reset the clicked item when closing
    } catch (error) {
      console.error("Error saving quality report:", error);
      setLoading(false); // Stop loading on error
    }
  };

  const handleClose = () => {
    setClickedItem(null); // Reset the clicked item when the close button is pressed
  };

  return (
    <>
      {/* Loading spinner */}
      {loading && <Loading />}
      
      {/* Form in background */}
      <div className="quality-input-overlay">
        <div className="quality-input">
          <div className="quality-input-title-container">
            <h2>Quality Input</h2>
            <button className="close-input-button" onClick={handleClose}>
              <CloseButton />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="quality-input-form">
            <label>
              Datum Liefertermin:
              <input
                type="date"
                name="liefertermin"
                value={formData.liefertermin}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Lieferant:
              <p>{formData.lieferant}</p>
            </label>

            <label>
              Auftragsnummer:
              <input
                type="text"
                name="auftragsnummer"
                value={formData.auftragsnummer}
                onChange={handleChange}
                pattern="[B|S]-\d{2}-\d{4}"
                required
              />
            </label>

            <label>
              Artikelnr:
              <input
                type="text"
                name="artikelnr"
                value={formData.artikelnr}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Produkt:
              <textarea
                name="produkt"
                value={formData.produkt}
                onChange={handleChange}
                placeholder="Optional"
              ></textarea>
            </label>

            <label>
              Mangel:
              <input
                type="text"
                name="mangel"
                value={formData.mangel}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Mangelgrad:
              <select
                name="mangelgrad"
                value={formData.mangelgrad}
                onChange={handleChange}
                required
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>

            <label>
              Mangel Grund:
              <select
                name="mangelgrund"
                value={formData.mangelgrund}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Oberfläche verkratzt/Poren">
                  Oberfläche verkratzt/Poren
                </option>
                <option value="Stein Defekt">Stein Defekt</option>
                <option value="Falsche Teile / Zusammensetzung">
                  Falsche Teile / Zusammensetzung
                </option>
                <option value="Falsche Länge">Falsche Länge</option>
                <option value="Gold/Stein Toleranz">Gold/Stein Toleranz</option>
                <option value="Andere">Andere</option>
              </select>
            </label>

            <label>
              Lieferant informiert am:
              <input
                type="date"
                name="lieferantInformiertAm"
                value={formData.lieferantInformiertAm}
                onChange={handleChange}
              />
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
                      <button
                        type="button"
                        className="remove-foto-button"
                        onClick={() => removePhoto(index)}
                      >
                        <RemoveButton />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label>
              Lösung:
              <textarea
                name="loesung"
                value={formData.loesung}
                onChange={handleChange}
              ></textarea>
            </label>

            <p>Mitarbeiter: {formData.mitarbeiter}</p>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default InspectionInput;
