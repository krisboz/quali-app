import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/api/stichproben`;
//const API_BASE_URL = "http://localhost:5000/api/stichproben";
// Helper to flatten form input
const flattenStichprobeForm = (formInput) => {
  const { basic, status, mitarbeiter, formData } = formInput;

  const extractSection = (section) => ({
    checks: JSON.stringify(section.checks || []),
    remarks: section.remarks || "",
  });

  const sections = [
    "allgemein",
    "oberflaeche",
    "masse",
    "mechanik",
    "steine",
    "weiter",
  ];
  const flattened = {
    artikelnr: basic.artikelnr,
    firma: basic.firma,
    orderNumber: basic.orderNumber,
    status,
    mitarbeiter,
  };

  sections.forEach((section) => {
    const { checks, remarks } = extractSection(formData[section] || {});
    flattened[`${section}_checks`] = checks;
    flattened[`${section}_remarks`] = remarks;
  });

  return flattened;
};

export const submitStichprobe = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const flattenedData = flattenStichprobeForm(formData);
    console.log({ flattenedData });
    const response = await axios.post(API_BASE_URL, flattenedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to submit Stichprobe";
  }
};
// Fetch Stichproben (filter by id, artikelnr, status, or combinations)
export const fetchStichproben = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch Stichproben";
  }
};

// Update a specific Stichprobe by ID
export const updateStichprobe = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update Stichprobe";
  }
};

// Delete a Stichprobe by ID
export const deleteStichprobe = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete Stichprobe";
  }
};
