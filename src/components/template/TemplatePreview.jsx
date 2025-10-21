import React from 'react';

const TemplatePreview = ({ template = {} }) => {
  // Safely destructure with defaults
  const { 
    header = {}, 
    client = {}, 
    items = { columns: [], data: [] }, 
    summary = {},
    styles = {}
  } = template.content || template; // Support both template.content and direct template props

  // Check if template is empty
  if (!template || Object.keys(template).length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No template data available. Start editing to see a preview.</p>
      </div>
    );
  }

  // Apply styles
  const templateStyles = {
    container: {
      fontFamily: styles.fontFamily || 'Arial, sans-serif',
      color: styles.secondaryColor || '#6B7280',
      maxWidth: '800px',
      margin: '0 auto',
      border: `1px solid ${styles.borderColor || '#E5E7EB'}`,
      borderRadius: '0.5rem',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: styles.headerBg || '#F9FAFB',
      padding: '1.5rem',
      borderBottom: `1px solid ${styles.borderColor || '#E5E7EB'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    title: {
      color: styles.primaryColor || '#4F46E5',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    },
    section: {
      padding: '1.5rem',
      borderBottom: `1px solid ${styles.borderColor || '#E5E7EB'}`
    },
    sectionTitle: {
      color: styles.primaryColor || '#4F46E5',
      fontSize: '1.125rem',
      fontWeight: '600',
      marginTop: 0,
      marginBottom: '1rem'
    },
    row: {
      display: 'flex',
      marginBottom: '0.5rem'
    },
    col: {
      flex: 1
    },
    label: {
      fontWeight: '500',
      color: styles.secondaryColor || '#6B7280',
      marginBottom: '0.25rem',
      display: 'block'
    },
    value: {
      color: '#111827',
      margin: 0
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      margin: '1rem 0'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      backgroundColor: styles.headerBg || '#F9FAFB',
      borderBottom: `2px solid ${styles.borderColor || '#E5E7EB'}`,
      color: styles.primaryColor || '#4F46E5',
      fontWeight: '600'
    },
    td: {
      padding: '0.75rem',
      borderBottom: `1px solid ${styles.borderColor || '#E5E7EB'}`,
      verticalAlign: 'top'
    },
    totalRow: {
      fontWeight: '600',
      backgroundColor: styles.headerBg || '#F9FAFB'
    },
    footer: {
      padding: '1rem 1.5rem',
      textAlign: 'center',
      color: styles.secondaryColor || '#6B7280',
      fontSize: '0.875rem'
    }
  };

  return (
    <div style={templateStyles.container}>
      {/* Header */}
      <div style={templateStyles.header}>
        <div>
          {header.logo && (
            <img 
              src={header.logo} 
              alt="Company Logo" 
              style={{ maxHeight: '50px', marginBottom: '1rem' }} 
            />
          )}
          <h1 style={templateStyles.title}>{header.title || 'INVOICE'}</h1>
          <p style={{ margin: '0.5rem 0 0 0' }}>{header.companyName}</p>
          <p style={{ margin: '0.25rem 0' }}>{header.companyAddress}</p>
          <p style={{ margin: '0.25rem 0' }}>{header.companyEmail}</p>
          <p style={{ margin: '0.25rem 0 0 0' }}>{header.companyPhone}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.5rem 0', textAlign: 'right' }}>
            <span style={templateStyles.label}>Invoice #</span>
            <span style={{ ...templateStyles.value, fontSize: '1.125rem' }}>
              {header.invoiceNumber || 'INV-0001'}
            </span>
          </p>
          <p style={{ margin: '0.5rem 0', textAlign: 'right' }}>
            <span style={templateStyles.label}>Date:</span> {header.date || new Date().toLocaleDateString()}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', textAlign: 'right' }}>
            <span style={templateStyles.label}>Due Date:</span> {header.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Bill To */}
      <div style={templateStyles.section}>
        <h2 style={templateStyles.sectionTitle}>{client.title || 'Bill To'}</h2>
        <div style={templateStyles.row}>
          <div style={templateStyles.col}>
            <span style={templateStyles.label}>Name</span>
            <p style={templateStyles.value}>{client.name || 'Client Name'}</p>
          </div>
          <div style={templateStyles.col}>
            <span style={templateStyles.label}>Email</span>
            <p style={templateStyles.value}>{client.email || 'client@example.com'}</p>
          </div>
          <div style={templateStyles.col}>
            <span style={templateStyles.label}>Phone</span>
            <p style={templateStyles.value}>{client.phone || '+1 (555) 000-0000'}</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <span style={templateStyles.label}>Address</span>
          <p style={templateStyles.value}>{client.address || '123 Client St, Client City, Country'}</p>
        </div>
      </div>

      {/* Items */}
      <div style={templateStyles.section}>
        <h2 style={templateStyles.sectionTitle}>Items</h2>
        <table style={templateStyles.table}>
          <thead>
            <tr>
              {items.columns && items.columns.length > 0 ? (
                items.columns.map((col, index) => (
                  <th key={index} style={{ ...templateStyles.th, width: col.width ? `${col.width}%` : 'auto' }}>
                    {col.header || `Column ${index + 1}`}
                  </th>
                ))
              ) : (
                // Default columns if none provided
                <>
                  <th style={templateStyles.th}>Description</th>
                  <th style={templateStyles.th}>Qty</th>
                  <th style={templateStyles.th}>Rate</th>
                  <th style={templateStyles.th}>Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(items.data?.length > 0 ? items.data : [
              { description: 'Web Development', quantity: 1, rate: 100, amount: 100 },
              { description: 'UI/UX Design', quantity: 1, rate: 80, amount: 80 }
            ]).map((item, index) => (
              <tr key={index}>
                <td style={templateStyles.td}>{item.description}</td>
                <td style={templateStyles.td}>{item.quantity}</td>
                <td style={templateStyles.td}>${item.rate?.toFixed(2)}</td>
                <td style={templateStyles.td}>${item.amount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={templateStyles.section}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>${summary.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            {summary.tax && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{summary.tax.name || 'Tax'} ({summary.tax.rate || 0}%):</span>
                <span>${summary.tax.amount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
            {summary.discount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{summary.discount.name || 'Discount'}:</span>
                <span>-${summary.discount.amount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: `1px solid ${styles.borderColor || '#E5E7EB'}`,
              fontWeight: '600',
              fontSize: '1.125rem'
            }}>
              <span>Total ({summary.currency || 'USD'}):</span>
              <span>${summary.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {summary.paymentTerms && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ ...templateStyles.sectionTitle, fontSize: '1rem', marginBottom: '0.5rem' }}>Payment Terms</h3>
            <p style={{ margin: 0 }}>{summary.paymentTerms}</p>
          </div>
        )}

        {summary.notes && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ ...templateStyles.sectionTitle, fontSize: '1rem', marginBottom: '0.5rem' }}>Notes</h3>
            <p style={{ margin: 0 }}>{summary.notes}</p>
          </div>
        )}

        {summary.bankDetails && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ ...templateStyles.sectionTitle, fontSize: '1rem', marginBottom: '0.5rem' }}>Bank Details</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {summary.bankDetails.bankName && (
                <div>
                  <span style={templateStyles.label}>Bank Name</span>
                  <p style={templateStyles.value}>{summary.bankDetails.bankName}</p>
                </div>
              )}
              {summary.bankDetails.accountName && (
                <div>
                  <span style={templateStyles.label}>Account Name</span>
                  <p style={templateStyles.value}>{summary.bankDetails.accountName}</p>
                </div>
              )}
              {summary.bankDetails.accountNumber && (
                <div>
                  <span style={templateStyles.label}>Account Number</span>
                  <p style={templateStyles.value}>{summary.bankDetails.accountNumber}</p>
                </div>
              )}
              {summary.bankDetails.swiftCode && (
                <div>
                  <span style={templateStyles.label}>SWIFT Code</span>
                  <p style={templateStyles.value}>{summary.bankDetails.swiftCode}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={templateStyles.footer}>
        <p style={{ margin: 0 }}>{template.footer?.text || 'Thank you for your business!'}</p>
        {template.footer?.terms && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem' }}>
            {template.footer.terms}
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;
