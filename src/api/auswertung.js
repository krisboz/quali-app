import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL; // Change this to your actual backend URL
//const API_BASE_URL = "http://localhost:5000";
// Submit an Auswertung (Evaluation) Table
export const submitAuswertungData = async (auswertungData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/auswertungen`,
      auswertungData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send JWT in headers
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to submit Auswertung data";
  }
};

// Search for Auswertungen
export const searchAuswertungen = async (searchParams) => {
  console.log(searchParams);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/auswertungen`, {
      headers: { Authorization: `Bearer ${token}` },
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch Auswertung data";
  }
};

// Delete an Auswertung entry
export const deleteAuswertung = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/api/auswertungen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete Auswertung data";
  }
};

// Update an Auswertung entry
export const updateAuswertung = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`${API_BASE_URL}/api/auswertungen/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to update Auswertung data";
  }
};

// Fetch diamond items based on month and year
export const getDiamondItems = async (month, year) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/auswertungen/diamond_items`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch diamond items";
  }
};
