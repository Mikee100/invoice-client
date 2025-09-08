// Simple rule-based invoice analyzer
export const analyzeInvoice = (invoice, paymentHistory = []) => {
  const analysis = {
    riskScore: 0,
    flags: [],
    suggestions: [],
    paymentPredictions: {}
  };

  // 1. Check for overdue
  const now = new Date();
  const dueDate = new Date(invoice.dueDate);
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue > 0) {
    analysis.riskScore += Math.min(daysOverdue * 2, 50); // Cap at 50
    analysis.flags.push({
      type: 'overdue',
      message: `Invoice is ${daysOverdue} days overdue`,
      severity: 'high'
    });
  }

  // 2. Check amount against average
  if (paymentHistory.length > 0) {
    const totalAmount = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const avgAmount = totalAmount / paymentHistory.length;
    
    if (invoice.amount > (avgAmount * 1.5)) {
      analysis.riskScore += 20;
      analysis.flags.push({
        type: 'amount_variation',
        message: `Invoice amount is significantly higher than average`,
        severity: 'medium'
      });
    }
  }

  // 3. Predict payment date based on client history
  if (paymentHistory.length > 0) {
    const paidInvoices = paymentHistory.filter(p => p.status === 'paid');
    if (paidInvoices.length > 0) {
      const avgDaysToPay = paidInvoices.reduce((sum, p) => {
        const issued = new Date(p.issuedDate);
        const paid = new Date(p.paidDate);
        return sum + Math.ceil((paid - issued) / (1000 * 60 * 60 * 24));
      }, 0) / paidInvoices.length;
      
      const predictedPayDate = new Date(invoice.issueDate);
      predictedPayDate.setDate(predictedPayDate.getDate() + Math.ceil(avgDaysToPay));
      
      analysis.paymentPredictions = {
        predictedPayDate: predictedPayDate.toISOString().split('T')[0],
        confidence: Math.min(100 - (paymentHistory.length * 2), 95) // More history = more confidence
      };
    }
  }

  // 4. Generate suggestions
  if (analysis.riskScore > 30) {
    analysis.suggestions.push('Consider sending a payment reminder');
  }
  if (analysis.riskScore > 60) {
    analysis.suggestions.push('Recommend following up with a phone call');
  }

  return analysis;
};

// Generate financial summary
export const generateFinancialSummary = (invoices, payments) => {
  const summary = {
    totalInvoiced: 0,
    totalPaid: 0,
    outstanding: 0,
    byClient: {},
    byMonth: {},
    paymentMethods: {}
  };

  // Process invoices
  invoices.forEach(invoice => {
    summary.totalInvoiced += invoice.amount;
    
    // Group by client
    if (!summary.byClient[invoice.clientId]) {
      summary.byClient[invoice.clientId] = 0;
    }
    summary.byClient[invoice.clientId] += invoice.amount;
    
    // Group by month
    const month = new Date(invoice.issueDate).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!summary.byMonth[month]) {
      summary.byMonth[month] = 0;
    }
    summary.byMonth[month] += invoice.amount;
  });

  // Process payments
  payments.forEach(payment => {
    summary.totalPaid += payment.amount;
    
    // Group by payment method
    if (!summary.paymentMethods[payment.method]) {
      summary.paymentMethods[payment.method] = 0;
    }
    summary.paymentMethods[payment.method] += payment.amount;
  });

  summary.outstanding = summary.totalInvoiced - summary.totalPaid;
  
  return summary;
};
