import axios from "axios";

const API_BASE_URL = "https://reimagined-journey-5r599v49g9r2577-5000.app.github.dev"; // Change this to your actual backend URL

// Submit Inspection Report
export const submitInspectionReport = async (inspectionData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_BASE_URL}/api/inspection`, inspectionData, {
      headers: {
        Authorization: `Bearer ${token}`, // Send JWT in headers
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to submit inspection report";
  }
};

// Fetch Inspection Reports
export const fetchInspectionReports = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/inspection`, {
      headers: { Authorization: `Bearer ${token}` }, // Send JWT in headers
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch inspection reports";
  }
};

// Delete an Inspection Report
export const deleteInspectionReport = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/api/inspection/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete inspection report";
  }
};

// Update an Inspection Report
export const updateInspectionReport = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`${API_BASE_URL}/api/inspection/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to update inspection report";
  }
};

export const getInspectionsByAuftragsnummer = async (auftragsnummer) => {
  try {
    const response = await axios.get(
      `/api/inspection/by-auftragsnummer/${encodeURIComponent(auftragsnummer)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error; // Or handle error as needed
  }
};