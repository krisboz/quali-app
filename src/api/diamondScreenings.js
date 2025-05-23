import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL; // Change this to your actual backend URL
//const API_BASE_URL = "http://localhost:5000";

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

// Create a new diamond screening entry
export const createDiamondScreening = async (screeningData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/diamond-screening`,
      screeningData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to create diamond screening entry"
    );
  }
};

// Batch create diamond screening entries
export const createDiamondScreeningsBatch = async (screenedItems) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/diamond-screening/batch`,
      screenedItems,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message;
    const detailedMessage =
      backendMessage || "Failed to batch insert diamond screenings";

    // Add failed items to error message if present
    if (error.response?.data?.failedItems) {
      const failedDetails = error.response.data.failedItems
        .map((item) => `${item.artikelnr}: ${item.reason}`)
        .join(", ");
      throw new Error(`${detailedMessage}. Issues: ${failedDetails}`);
    }

    throw new Error(detailedMessage);
  }
};

export const deleteDiamondScreening = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/diamond-screening/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to delete diamond screening entry"
    );
  }
};
