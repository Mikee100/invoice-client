import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getTemplateById, saveTemplate } from '../../../services/templateService';
import TemplateTabs from '../../../components/template/editor-tabs/TemplateTabs';

const TemplateEditor = () => {
  console.log('TemplateEditor component mounted');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [template, setTemplate] = useState({
    name: 'New Invoice Template',
    description: 'A customizable invoice template',
    category: 'invoice',
    isPublic: false,
    tags: ['invoice', 'billing', 'freelance'],
    content: {
      // Company/Business Information
      business: {
        name: 'Your Business Name',
        logo: '',
        address: '123 Business St, City',
        city: 'Your City',
        state: 'State',
        zip: '12345',
        country: 'Country',
        phone: '+1 (123) 456-7890',
        email: 'billing@yourbusiness.com',
        website: 'www.yourbusiness.com',
        taxId: 'TAX-123456789',
        registrationNumber: 'REG-987654321',
        bankDetails: {
          bankName: 'Your Bank Name',
          accountName: 'Your Business Name',
          accountNumber: '1234567890',
          iban: 'XX00 1234 5678 9012 3456 78',
          swiftCode: 'BANK1234XXX'
        }
      },
      
      // Line items configuration
      items: {
        columns: [
          { id: 'description', label: 'Description', type: 'text', width: '40%' },
          { id: 'quantity', label: 'Qty', type: 'number', width: '15%' },
          { id: 'rate', label: 'Rate', type: 'currency', width: '20%' },
          { id: 'amount', label: 'Amount', type: 'currency', width: '25%' }
        ]
      },
      
      // Summary section
      summary: {
        subtotal: { label: 'Subtotal' },
        tax: { 
          label: 'Tax', 
          rate: 0, 
          included: false 
        },
        discount: { 
          label: 'Discount',
          amount: 0,
          type: 'fixed'
        },
        total: { label: 'Total' }
      },
      
      // Styling
      styles: {
        primaryColor: '#4F46E5',
        fontFamily: 'sans-serif',
        customCSS: ''
      },
      
      // Client Information
      client: {
        name: 'Client Name',
        company: 'Client Company',
        address: '123 Client St, City',
        city: 'Client City',
        state: 'State',
        zip: '54321',
        country: 'Country',
        email: 'client@example.com',
        phone: '+1 (987) 654-3210',
        taxId: 'CLIENT-TAX-123'
      },
      
      // Invoice Details
      invoice: {
        title: 'INVOICE',
        number: 'INV-0001',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        poNumber: '',
        currency: 'USD',
        language: 'en',
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days of issue date.',
        paymentInstructions: 'Please make payment via bank transfer or credit card.',
        lateFee: {
          enabled: false,
          amount: 0,
          afterDays: 15
        },
        discount: {
          enabled: false,
          type: 'percentage', // 'percentage' or 'fixed'
          value: 0,
          description: ''
        },
        tax: {
          enabled: true,
          type: 'percentage', // 'percentage' or 'fixed'
          value: 0,
          description: 'VAT',
          registrationNumber: 'VAT-123456789'
        },
        shipping: {
          enabled: false,
          amount: 0,
          description: 'Shipping & Handling'
        },
        deposit: {
          enabled: false,
          amount: 0,
          description: 'Deposit',
          percentage: 50
        }
      },
      
      // Line Items
      items: {
        columns: [
          { id: 'description', label: 'Description', width: '40%', required: true },
          { id: 'quantity', label: 'Qty', width: '10%', type: 'number', required: true },
          { id: 'rate', label: 'Rate', width: '20%', type: 'currency', required: true },
          { id: 'amount', label: 'Amount', width: '20%', type: 'currency', calculated: true, formula: 'quantity * rate' },
          { id: 'tax', label: 'Tax', width: '10%', type: 'checkbox' }
        ],
        data: [
          {
            id: '1',
            description: 'Professional Services',
            quantity: 1,
            rate: 100,
            amount: 100,
            tax: true
          }
        ]
      },
      
      // Summary Section
      summary: {
        subtotal: { label: 'Subtotal', value: 0, calculated: true },
        tax: { label: 'Tax', value: 0, calculated: true },
        discount: { label: 'Discount', value: 0 },
        shipping: { label: 'Shipping', value: 0 },
        deposit: { label: 'Deposit', value: 0 },
        total: { label: 'Total', value: 0, calculated: true, bold: true },
        balanceDue: { label: 'Balance Due', value: 0, calculated: true, bold: true, large: true }
      },
      
      // Additional Sections
      additionalSections: {
        terms: {
          enabled: true,
          title: 'Terms & Conditions',
          content: '1. Payment is due within 30 days of invoice date.\n2. Late payments are subject to a 5% monthly finance charge.\n3. All sales are final.'
        },
        notes: {
          enabled: true,
          title: 'Notes',
          content: 'Thank you for your business!'
        },
        signature: {
          enabled: true,
          label: 'Authorized Signature',
          image: ''
        }
      },
      
      // Styling
      styles: {
        // Colors
        primaryColor: '#4F46E5',
        secondaryColor: '#6B7280',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        borderColor: '#E5E7EB',
        headerBg: '#F9FAFB',
        
        // Typography
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        headingFont: 'inherit',
        headingWeight: 'bold',
        
        // Layout
        logoSize: '150px',
        logoPosition: 'right', // 'left', 'right', or 'center'
        layout: 'modern', // 'modern', 'classic', 'minimal', 'corporate'
        
        // Custom CSS
        customCSS: ''
      },
      
      // Settings
      settings: {
        showLogo: true,
        showPageNumbers: true,
        showTaxId: true,
        showPaymentInstructions: true,
        showDueDate: true,
        showTerms: true,
        showNotes: true,
        showSignature: true,
        showBankDetails: true,
        autoCalculate: true
      }
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Load template if in edit mode
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) return;
      
      try {
        const { data } = await getTemplateById(id);
        console.log('API Response:', data);
        
        // Create a deep merge of the default template with the API data
        const defaultTemplate = {
          name: 'New Invoice Template',
          description: 'A customizable invoice template',
          category: 'invoice',
          isPublic: false,
          tags: ['invoice', 'billing', 'freelance'],
          content: {
            business: {
              name: '',
              logo: '',
              address: '',
              city: '',
              state: '',
              zip: '',
              country: '',
              phone: '',
              email: '',
              website: '',
              taxId: '',
              registrationNumber: '',
              bankDetails: {
                bankName: '',
                accountName: '',
                accountNumber: '',
                iban: '',
                swiftCode: ''
              }
            },
            items: {
              columns: [
                { id: 'description', label: 'Description', type: 'text', width: '40%' },
                { id: 'quantity', label: 'Qty', type: 'number', width: '15%' },
                { id: 'rate', label: 'Rate', type: 'currency', width: '20%' },
                { id: 'amount', label: 'Amount', type: 'currency', width: '25%' }
              ]
            },
            summary: {
              subtotal: { label: 'Subtotal' },
              tax: { 
                label: 'Tax', 
                rate: 0, 
                included: false 
              },
              discount: { 
                label: 'Discount',
                amount: 0,
                type: 'fixed'
              },
              total: { label: 'Total' }
            },
            styles: {
              primaryColor: '#4F46E5',
              fontFamily: 'sans-serif',
              customCSS: ''
            },
            client: {
              name: '',
              company: '',
              address: '',
              city: '',
              state: '',
              zip: '',
              country: '',
              email: '',
              phone: '',
              taxId: ''
            },
            invoice: {
              title: 'INVOICE',
              number: '',
              date: new Date().toISOString().split('T')[0],
              dueDate: '',
              poNumber: '',
              currency: 'USD',
              language: 'en',
              notes: ''
            }
          }
        };

        // Deep merge the API data with the default template
        const mergedTemplate = {
          ...defaultTemplate,
          ...data,
          content: {
            ...defaultTemplate.content,
            ...(data.content || {}),
            business: {
              ...defaultTemplate.content.business,
              ...(data.content?.business || {})
            },
            items: {
              ...defaultTemplate.content.items,
              ...(data.content?.items || {})
            },
            summary: {
              ...defaultTemplate.content.summary,
              ...(data.content?.summary || {})
            },
            styles: {
              ...defaultTemplate.content.styles,
              ...(data.content?.styles || {})
            },
            client: {
              ...defaultTemplate.content.client,
              ...(data.content?.client || {})
            },
            invoice: {
              ...defaultTemplate.content.invoice,
              ...(data.content?.invoice || {})
            }
          }
        };
        
        console.log('Merged template:', mergedTemplate);
        setTemplate(mergedTemplate);
      } catch (error) {
        console.error('Error loading template:', error);
        toast.error('Failed to load template');
        navigate('/admin/templates');
      }
    };
    
    loadTemplate();
  }, [id, navigate]);

  const handleTemplateChange = (updatedTemplate) => {
    console.log('Template changed:', updatedTemplate);
    setTemplate(updatedTemplate);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    
    // Ensure all required fields are present in the template
    const templateToSave = {
      name: template.name || 'Untitled Template',
      description: template.description || '',
      category: template.category || 'invoice',
      isPublic: Boolean(template.isPublic),
      tags: Array.isArray(template.tags) ? template.tags : [],
      content: {
        business: template.content?.business || {},
        items: template.content?.items || { columns: [] },
        summary: template.content?.summary || {},
        styles: template.content?.styles || {},
        invoice: template.content?.invoice || {},
        ...template.content
      },
      ...template
    };
    
    if (!templateToSave.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      setIsSaving(true);
      const savedTemplate = await saveTemplate(
        isEditMode 
          ? { ...templateToSave, _id: id } 
          : templateToSave
      );
      
      toast.success(`Template ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} template`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Template' : 'Create New Template'}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/admin/templates')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <FiX className="inline mr-1" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="inline mr-1" /> Save Template
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="p-2 bg-yellow-50 text-yellow-800 text-sm">
          Debug: TemplateTabs will be rendered here
        </div>
        <TemplateTabs 
          template={template} 
          onTemplateChange={handleTemplateChange} 
        />
      </div>
    </div>
  );
};

export default TemplateEditor;
