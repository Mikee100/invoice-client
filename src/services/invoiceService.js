import api from './api';

/**
 * Create a new invoice
 * @param {Object} invoiceData - The invoice data to be saved
 * @returns {Promise<Object>} The created invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all invoices
 * @param {Object} filters - Optional filters for querying invoices
 * @returns {Promise<Array>} List of invoices
 */
export const getInvoices = async (filters = {}) => {
  try {
    const response = await api.get('/invoices', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single invoice by ID
 * @param {string} id - The invoice ID
 * @returns {Promise<Object>} The invoice data
 */
export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update an existing invoice
 * @param {string} id - The invoice ID
 * @param {Object} updates - The updates to apply to the invoice
 * @returns {Promise<Object>} The updated invoice
 */
export const updateInvoice = async (id, updates) => {
  try {
    const response = await api.put(`/invoices/${id}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete an invoice
 * @param {string} id - The invoice ID to delete
 * @returns {Promise<Object>} The deletion result
 */
export const deleteInvoice = async (id) => {
  try {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Send an invoice to a client
 * @param {string} id - The invoice ID
 * @param {Object} options - Email options (to, subject, message, etc.)
 * @returns {Promise<Object>} The email sending result
 */
export const sendInvoice = async (id, options = {}) => {
  try {
    const response = await api.post(`/invoices/${id}/send`, options);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Generate a PDF for an invoice
 * @param {string} id - The invoice ID
 * @returns {Promise<Blob>} The PDF file as a Blob
 */
export const generateInvoicePdf = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Approve an invoice
 * @param {string} id - The invoice ID
 * @returns {Promise<Object>} The updated invoice
 */
export const approveInvoice = async (id) => {
  try {
    const response = await api.patch(`/invoices/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reject an invoice
 * @param {string} id - The invoice ID
 * @returns {Promise<Object>} The updated invoice
 */
export const rejectInvoice = async (id) => {
  try {
    const response = await api.patch(`/invoices/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
