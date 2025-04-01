import axios from "axios";

const API_BASE_URL = "https://reimagined-journey-5r599v49g9r2577-5000.app.github.dev"; // Change this to your actual backend URL

// Create a new diamond screening entry
export const createDiamondScreening = async (screeningData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_BASE_URL}/api/diamond-screening`, screeningData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create diamond screening entry";
  }
};

// Retrieve diamond screenings with filtering
export const getDiamondScreenings = async (filters) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/diamond-screening`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch diamond screenings";
  }
};
