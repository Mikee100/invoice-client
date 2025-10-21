import api from './api';

// Get all templates
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

// Get a single template by ID
export const getTemplateById = async (id) => {
  try {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw error;
  }
};

// Create or update a template
export const saveTemplate = async (template) => {
  try {
    if (template._id) {
      // Update existing template
      const response = await api.put(`/templates/${template._id}`, template);
      return response.data;
    } else {
      // Create new template
      const response = await api.post('/templates', template);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

// Delete a template
export const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    throw error;
  }
};

// Get templates by category
export const getTemplatesByCategory = async (category) => {
  try {
    const response = await api.get(`/templates/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching templates for category ${category}:`, error);
    throw error;
  }
};

// Get public templates
export const getPublicTemplates = async () => {
  try {
    const response = await api.get('/templates/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public templates:', error);
    throw error;
  }
};
