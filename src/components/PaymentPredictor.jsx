import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Simple moving average prediction
const calculateMovingAverage = (data, period) => {
  if (data.length < period) return [];
  
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.amount, 0);
    result.push({
      date: data[i].date,
      amount: sum / period,
      isPrediction: false
    });
  }
  return result;
};

// Predict next 3 months based on historical data
const predictFuturePayments = (payments, monthsToPredict = 3) => {
  if (payments.length < 2) return [];
  
  // Group by month
  const monthlyTotals = {};
  payments.forEach(payment => {
    const date = new Date(payment.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    monthlyTotals[monthKey] += payment.amount;
  });
  
  // Convert to array and sort by date
  const monthlyData = Object.entries(monthlyTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate simple moving average (3 months)
  const sma = calculateMovingAverage(monthlyData, Math.min(3, monthlyData.length));
  if (sma.length === 0) return [];
  
  // Predict next months
  const lastDate = new Date(monthlyData[monthlyData.length - 1].date);
  const predictions = [];
  
  // Use the last moving average value for prediction
  const lastSMA = sma[sma.length - 1].amount;
  
  for (let i = 1; i <= monthsToPredict; i++) {
    const nextMonth = new Date(lastDate);
    nextMonth.setMonth(nextMonth.getMonth() + i);
    
    predictions.push({
      date: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`,
      amount: lastSMA * (1 + (i * 0.05)), // 5% growth per month
      isPrediction: true
    });
  }
  
  return [...monthlyData.map(d => ({ ...d, isPrediction: false })), ...predictions];
};

const PaymentPredictor = ({ payments = [] }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      if (payments && payments.length > 0) {
        // Ensure we have valid payment data with dates and amounts
        const validPayments = payments
          .filter(p => p && p.date && p.amount)
          .map(p => ({
            ...p,
            date: new Date(p.date).toISOString().split('T')[0] // Format as YYYY-MM-DD
          }));
        
        if (validPayments.length > 0) {
          const predictions = predictFuturePayments(validPayments);
          setPredictionData(predictions);
          setError(null);
        } else {
          setError('No valid payment data available for predictions');
        }
      } else {
        setError('No payment data available');
      }
    } catch (err) {
      console.error('Error generating predictions:', err);
      setError('Failed to generate payment predictions');
    }
  }, [payments]);
  
  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!predictionData || predictionData.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-700">
              Not enough data to generate predictions. Add more payment history for better insights.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Prepare chart data
  const chartData = {
    labels: predictionData.map(d => d.date),
    datasets: [
      {
        label: 'Actual Payments',
        data: predictionData.map(d => d.isPrediction ? null : d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Predicted Payments',
        data: predictionData.map(d => d.isPrediction ? d.amount : null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value?.toLocaleString() || 'N/A'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };
  
  // Calculate prediction confidence
  const actualData = predictionData.filter(d => !d.isPrediction);
  const lastActual = actualData[actualData.length - 1]?.amount || 0;
  const firstPrediction = predictionData.find(d => d.isPrediction)?.amount || 0;
  const growthPercentage = ((firstPrediction - lastActual) / lastActual * 100).toFixed(1);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Payment Predictions</h3>
      
      <div className="h-64 mb-6">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Last Month</h4>
          <p className="text-2xl font-bold">${lastActual.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Next Month Prediction</h4>
          <p className="text-2xl font-bold">${firstPrediction.toLocaleString()}</p>
          <p className={`text-sm ${parseFloat(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthPercentage}% {parseFloat(growthPercentage) >= 0 ? '↑' : '↓'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800">Confidence</h4>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-green-600 h-4 rounded-full" 
              style={{ width: `${Math.min(100 - (predictionData.length * 2), 90)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Based on {predictionData.filter(d => !d.isPrediction).length} months of data
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Key Insights</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Predictions based on moving average of last 3 months</li>
          <li>• Assumes 5% monthly growth rate for future predictions</li>
          <li>• More historical data improves accuracy</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentPredictor;
