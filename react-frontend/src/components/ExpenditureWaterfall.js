import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenditureWaterfall = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        // Use 'current' keyword to let the server determine the YTD year
        const response = await api.get(`/api/transactions/?year_key=current`);
        const transactions = Array.isArray(response.data) ? response.data : (response.data.results || []);

        const currentYear = new Date().getFullYear();
        
        // 1. Filter strictly by PAID DATE of current year on the client side
        // (since the API might be broader)
        const currentYearTxs = transactions.filter(tx => {
          if (!tx.paid_date) return false;
          const paidYear = new Date(tx.paid_date).getFullYear();
          return paidYear === currentYear;
        });

        const categoryTotals = {};
        let totalReceived = 0;

        currentYearTxs.forEach(tx => {
          const category = tx.transaction_object_name || 'Other';
          const paid = parseFloat(tx.paid_amount || 0);
          const received = parseFloat(tx.received_amount || 0);

          // Sum up total income (received)
          if (received > 0) {
            totalReceived += received;
          }

          // Sum up expenditures by category
          if (paid > 0) {
            categoryTotals[category] = (categoryTotals[category] || 0) + paid;
          }
        });

        const labels = [];
        const dataPoints = [];
        
        // START: Total Received (The positive baseline)
        labels.push('TOTAL RECEIVED');
        dataPoints.push([0, totalReceived]);
        
        let currentRunningTotal = totalReceived;

        // MIDDLE: Each expense category drops the total
        Object.entries(categoryTotals).forEach(([category, amount]) => {
          labels.push(category);
          const start = currentRunningTotal;
          currentRunningTotal -= amount;
          dataPoints.push([start, currentRunningTotal]);
        });

        // END: Final Net Position
        labels.push('NET BALANCE');
        dataPoints.push([0, currentRunningTotal]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Cash Flow',
              data: dataPoints,
              backgroundColor: labels.map((l, i) => {
                if (l === 'TOTAL RECEIVED') return '#4CAF50'; // Green for income
                if (l === 'NET BALANCE') return currentRunningTotal >= 0 ? '#4CAF50' : '#EF5350'; // Green if profit, Red if loss
                return '#EF5350'; // Red for expenses
              }),
              borderRadius: 4,
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching waterfall data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditures();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (!chartData) return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No expenditure data for this year.</Box>;

  return (
    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', minHeight: '500px' }} elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
        YTD CASH FLOW WATERFALL
      </Typography>
      <Box sx={{ height: '400px', position: 'relative' }}>
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const val = context.raw;
                    if (Array.isArray(val)) {
                      return `Amount: $${Math.abs(val[1] - val[0]).toFixed(2)}`;
                    }
                    return `Amount: $${Math.abs(val).toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `$${Math.abs(value)}`
                },
                grid: { color: '#ECEFF1' }
              },
              x: {
                grid: { display: false }
              }
            }
          }} 
        />
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Net Balance: ${chartData.datasets[0].data[chartData.datasets[0].data.length - 1][1].toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Aggregated from all transactions for {new Date().getFullYear()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExpenditureWaterfall;
