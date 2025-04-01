import React, { useState } from "react";
import "../styles/DiamondScreeningForm.scss";
import { createDiamondScreening } from "../../../api/diamondScreenings";
import { toast } from "react-toastify";

const supplierOptions = [
  "Adoma",
  "Breuning",
  "Rösch",
  "Sisti",
  "Schofer",
  "Scheingraber",
];

export default function DiamondScreeningForm() {
  const [formData, setFormData] = useState({
    liefertermin: "",
    lieferant: "",
    artikelnr: "",
    quantity: 1,
    bestellnr:"",
    bemerkung: "",
  });

  //TODO useEffect that fetches the data

  const resetFormData = () => {
    setFormData({
      liefertermin: "",
      lieferant: "",
      artikelnr: "",
      quantity: 1,
      bemerkung: "",
    });
  };

  const [clicked, setClicked] = useState(false);

  const toggleClicked = () => {
    setClicked((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  

    try {
      const entry = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      };
      console.log(entry);
      const result = await createDiamondScreening(entry)
      //TODO make a backend call to add to the sql table
      console.log("result", result);
      toast.success(`${formData.lieferant}'s diamond screening for ${formData.artikelnr} successfully submitted`)
      resetFormData();
      setClicked(false);

    }catch(error) {
      console.log(error)
    }
  };

  if (!clicked) {
    return (
      <div className="diamond-screening-container">
        <h2>Diamond Screening</h2>
        <button onClick={toggleClicked}> + </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="diamond-screening-form-container">
      <div className="diamond-screening-title-container">
        <h3>Diamond Screening Input</h3>
        <button onClick={toggleClicked}>X</button>
      </div>
      <div className="artikel-quantity-container">
        <label>
          Liefertermin:
          <input
            type="date"
            name="liefertermin"
            value={formData.liefertermin}
            onChange={handleChange}
            required
            className="input"
          />
        </label>

        <label>
          Lieferant:
          <select
            name="lieferant"
            value={formData.lieferant}
            onChange={handleChange}
            required
            className="input lieferant-input"
          >
            <option value="" disabled>
              -- Choose a supplier --
            </option>
            {supplierOptions.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="artikel-quantity-container">
        <label>
          Artikelnummer:
          <input
            type="text"
            name="artikelnr"
            value={formData.artikelnr}
            onChange={handleChange}
            required
            className="input artikel-input"
          />
        </label>

        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="input quantity-input"
            min="1"
          />
        </label>
      </div>

      <div className="bemerkung-container">
      <label>
          Bestellnr:
          <input
            type="text"
            name="bestellnr"
            value={formData.bestellnr}
            onChange={handleChange}
            className="input"
          />
        </label>
        <label>
          Bemerkung:
          <input
            type="text"
            name="bemerkung"
            value={formData.bemerkung}
            onChange={handleChange}
            className="input"
          />
        </label>
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
