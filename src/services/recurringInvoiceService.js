import api from './api';

/**
 * Create a new recurring invoice
 * @param {Object} recurringInvoiceData - The recurring invoice data to be saved
 * @returns {Promise<Object>} The created recurring invoice
 */
export const createRecurringInvoice = async (recurringInvoiceData) => {
  try {
    const response = await api.post('/recurring-invoices', recurringInvoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all recurring invoices
 * @param {Object} filters - Optional filters for querying recurring invoices
 * @returns {Promise<Array>} List of recurring invoices
 */
export const getRecurringInvoices = async (filters = {}) => {
  try {
    const response = await api.get('/recurring-invoices', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing recurring invoice
 * @param {string} id - The recurring invoice ID
 * @param {Object} updates - The updates to apply to the recurring invoice
 * @returns {Promise<Object>} The updated recurring invoice
 */
export const updateRecurringInvoice = async (id, updates) => {
  try {
    const response = await api.put(`/recurring-invoices/${id}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a recurring invoice
 * @param {string} id - The recurring invoice ID to delete
 * @returns {Promise<Object>} The deletion result
 */
export const deleteRecurringInvoice = async (id) => {
  try {
    const response = await api.delete(`/recurring-invoices/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Pause a recurring invoice
 * @param {string} id - The recurring invoice ID
 * @returns {Promise<Object>} The updated recurring invoice
 */
export const pauseRecurringInvoice = async (id) => {
  try {
    const response = await api.patch(`/recurring-invoices/${id}/pause`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Resume a recurring invoice
 * @param {string} id - The recurring invoice ID
 * @returns {Promise<Object>} The updated recurring invoice
 */
export const resumeRecurringInvoice = async (id) => {
  try {
    const response = await api.patch(`/recurring-invoices/${id}/resume`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
