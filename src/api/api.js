import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

//const API_BASE_URL = "http://localhost:5000"; // Change this to your actual backend URL

// Login function
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

//Change password
export const changePassword = async (newPassword) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/change-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } } // Send JWT in headers
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to change password";
  }
};

// Function to submit quality report
export const submitQualityReport = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/quality-reports`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure the content type is set for file uploads
          Authorization: `Bearer ${token}`, // Send JWT in headers
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to submit quality report";
  }
};

// Function to fetch quality reports, optionally filtered by date range
export const fetchQualityReports = async (terminFrom, terminTo) => {
  try {
    const token = localStorage.getItem("token");

    const params = {};
    if (terminFrom) params.terminFrom = terminFrom;
    if (terminTo) params.terminTo = terminTo;

    const response = await axios.get(`${API_BASE_URL}/quality-reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch quality reports";
  }
};

export const filterInspectionsByDateOfInspection = async (inspectionFrom, inspectionTo) => {
  try {
    const token = localStorage.getItem("token");

    const params = {};
    if (inspectionFrom) params.inspectionFrom = inspectionFrom;
    if (inspectionTo) params.inspectionTo = inspectionTo;

    const response = await axios.get(`${API_BASE_URL}/quality-reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch quality reports";
  }
};

export const searchQualityReportsByAuftragsnummer = async (auftragsnummer) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/quality-reports/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { auftragsnummer },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to search quality reports";
  }
};

export const searchQualityReportsByUsername = async (username) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/quality-reports/search-by-username`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { mitarbeiter: username },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to search quality reports by username"
    );
  }
};

// Function to delete a quality report
export const deleteQualityReport = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/quality-reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete quality report";
  }
};

// Function to update a quality report
export const updateQualityReport = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`${API_BASE_URL}/quality-reports/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to update quality report";
  }
};

//Submit Auswertung Excel Table
export const submitAuswertungData = async (auswertungData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/auswertungen`,
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

export const searchAuswertungen = async (searchParams) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/auswertungen`, {
      headers: { Authorization: `Bearer ${token}` },
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch Auswertung data";
  }
};

export const fetchAllAuswertungen = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/auswertungen`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 10000 },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch Auswertung data";
  }
};

export const fetchReports = async (params) => {
  const token = localStorage.getItem("token");
  console.log("Params", { params });
  const response = await axios.get(`${API_BASE_URL}/reports`, {
    params: {
      date: params.termin,
      lieferant: params.firma,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
