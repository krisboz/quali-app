import axios from "axios";

const API_BASE_URL = "https://reimagined-journey-5r599v49g9r2577-5000.app.github.dev"; // Update to match your deployment
//const API_BASE_URL = "http://localhost:5000"; // Change this to your actual backend URL

/**
 * Bulk upload or update multiple items.
 * Expects an array of item objects with the following fields:
 * {
 *   Artikelgruppe, Artikelnummer, Bestand, Bezeichnung, Inaktiv,
 *   LetzterEK, Lieferantenname, Lieferfrist, MakeOrBuy, Matchcode,
 *   Mengeneinheit, "UVP - Euro ", "VK 1 - Euro", "verfügbar in",
 *   _ARTIKELGRUPPENEU, _BESTSELLER, _MARKETINGFOCUS,
 *   _PARETOCLUSTER, _REGULARREPLENISHMENT, _SILHOUETTE
 * }
 */
export const uploadItems = async (itemsArray) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/items/upload`,
      itemsArray,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to upload items";
  }
};

// Usage example:
// await uploadItems([{ Artikelnummer: "123", Bezeichnung: "Test Item", Bestand: 5, ... }]);

/**
 * Insert or update a single item.
 * Expects the same object shape as `uploadItems`, but for a single item.
 */
export const upsertItem = async (itemData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/items`,
      itemData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to upsert item";
  }
};

// Usage example:
// await upsertItem({ Artikelnummer: "456", Bezeichnung: "Single Item", Bestand: 10, ... });

/**
 * Fetch all items, optionally filtered.
 * You can pass any item field as a query filter, and it will perform a LIKE search.
 * Example filters: { Artikelnummer: "123", MakeOrBuy: "Buy" }
 */
export const fetchItems = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/items`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch items";
  }
};

// Usage example:
// const results = await fetchItems({ Matchcode: "Diamond", _PARETOCLUSTER: "A" });

/**
 * Delete a specific item by its database ID (not Artikelnummer).
 */
export const deleteItem = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_BASE_URL}/api/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete item";
  }
};

// Usage example:
// await deleteItem(7); // Deletes item with ID = 7

/**
 * Partially update an item by ID.
 * Provide only the fields you want to update, e.g. { Bestand: 12, Inaktiv: true }
 */
export const updateItem = async (id, updateFields) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_BASE_URL}/api/items/${id}`,
      updateFields,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update item";
  }
};

// Usage example:
// await updateItem(3, { Bestand: 100, _BESTSELLER: true });
