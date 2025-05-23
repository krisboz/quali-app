import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/gold-tests`;
//const API_BASE_URL = "http://localhost:5000/gold-tests";
/**
 * Gold Tests API Service
 * Provides methods for interacting with all gold test endpoints
 */
export const goldTestsService = {
  /**
   * Create a new gold test entry
   * @param {Object} testData
   * @param {string} testData.lieferant - Supplier name
   * @param {string} testData.farbe - Color code (RG/YG/WG)
   * @param {string} testData.test_month - Test month in 'MM' format
   * @param {string} testData.test_year - Test year in 'YYYY' format
   * @param {string} testData.bestellnr - Order number
   * @param {string} [testData.bemerkung] - Optional remark
   * @returns {Promise<Object>} Created test entry with ID
   */
  createTest: async (testData) => {
    console.log({ testData });
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_BASE_URL, testData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Retrieve paginated gold tests with filters
   * @param {Object} [filters]
   * @param {string} [filters.lieferant] - Filter by supplier
   * @param {string} [filters.farbe] - Filter by color
   * @param {number} [filters.year] - Filter by year
   * @param {number} [filters.month] - Filter by month (1-12)
   * @param {number} [page=1] - Pagination page number
   * @param {number} [limit=100] - Items per page
   * @returns {Promise<{data: Array, meta: Object}>} Paginated response
   */
  getTests: async (filters = {}, page = 1, limit = 100) => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        ...filters,
        page,
        limit,
      };

      const response = await axios.get(API_BASE_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, "fetch tests");
    }
  },

  /**
   * Get missing tests for a specific month
   * @param {number} test_month - Month to check (1-12)
   * @param {number} test_year - Year to check
   * @returns {Promise<Object>} Missing tests information
   */
  getTestsByMonth: async (test_month, test_year, page = 1, limit = 100) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(API_BASE_URL, {
        params: {
          month: test_month,
          year: test_year,
          page,
          limit,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  /**
   * Get missing tests for a specific month
   * @param {number} year - Year to check
   * @param {number} month - Month to check (1-12)
   * @returns {Promise<Object>} Missing tests information
   */
  getMissingTests: async (year, month) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/missing`, {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.log("Error getting missing", error.message);
    }
  },

  /**
   * Update a test's remark
   * @param {number} id - Test entry ID
   * @param {string} bemerkung - New remark
   * @returns {Promise<Object>} Update confirmation
   */
  updateTestRemark: async (id, bemerkung) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        { bemerkung },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, "update test");
    }
  },

  /**
   * Delete a test entry
   * @param {number} id - Test entry ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteTest: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, "delete test");
    }
  },

  /**
   * Handle API errors consistently
   * @private
   */
  handleApiError: (error, action) => {
    console.error(`Error trying to ${action}:`, error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      `Unknown error occurred while trying to ${action}`;

    console.log(errorMessage);
  },
};
