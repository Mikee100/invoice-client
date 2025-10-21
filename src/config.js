// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Other configuration constants
export const APP_NAME = 'Invoice Management';
export const APP_VERSION = '1.0.0';

// Local Storage Keys
export const TOKEN_KEY = 'invoice_management_token';
export const USER_KEY = 'invoice_management_user';

// Default Pagination Settings
export const DEFAULT_PAGE_SIZE = 10;

// Available Template Categories
export const TEMPLATE_CATEGORIES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'estimate', label: 'Estimate' },
  { value: 'other', label: 'Other' },
];

// Default Template Structure
export const DEFAULT_TEMPLATE = {
  name: '',
  description: '',
  category: 'invoice',
  isPublic: false,
  tags: [],
  content: {
    header: {},
    client: {},
    items: { columns: [], data: [] },
    summary: {},
    footer: {},
    styles: {
      primaryColor: '#4F46E5',
      secondaryColor: '#6B7280',
      fontFamily: 'Arial, sans-serif',
      headerBg: '#F9FAFB',
      borderColor: '#E5E7EB'
    }
  }
};
