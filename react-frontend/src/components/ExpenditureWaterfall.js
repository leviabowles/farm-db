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

const ExpenditureWaterfall = ({ fieldYearCropId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState({});

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get('/api/vendors/');
        const vendorList = Array.isArray(response.data) ? response.data : (response.data.results || []);
        const vendorMap = {};
        vendorList.forEach(v => {
          vendorMap[v.id] = v.vendor_name || `Vendor ${v.id}`;
        });
        setVendors(vendorMap);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        // Build query params based on props
        const params = new URLSearchParams();
        if (fieldYearCropId) {
          // Crop detail page: filter by crop only, no year filter
          params.append('field_year_crop', fieldYearCropId);
        } else {
          // Dashboard: filter by current year
          params.append('year_key', 'current');
        }
        
        const response = await api.get(`/api/transactions/?${params.toString()}`);
        const transactions = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // When fieldYearCropId is provided, API filters only by crop (no year filter)
        // When not provided, API filters by current year (paid_date year)
        // We double-check year filter on client side for dashboard to be safe
        const currentYearTxs = fieldYearCropId
          ? transactions
          : transactions.filter(tx => {
              if (!tx.paid_date) return false;
              const paidYear = new Date(tx.paid_date).getFullYear();
              return paidYear === new Date().getFullYear();
            });

        const expenseByVendor = {};
        let totalReceived = 0;

        currentYearTxs.forEach(tx => {
          const amount = parseFloat(tx.amount || 0);

          // Determine if this is income or expense based on trans_type
          // 'credit' = income (received), 'debit' = expense (paid)
          // Only process if amount is valid (not null/undefined/NaN)
          if (isNaN(amount)) return;
          
          if (tx.trans_type === 'credit' && amount > 0) {
            totalReceived += amount;
          } else if (tx.trans_type === 'debit' && amount > 0) {
            // Categorize by vendor if available, otherwise by account
            const vendorName = tx.vendor && vendors[tx.vendor] ? vendors[tx.vendor] : 'No Vendor';
            const accountName = tx.account_name || 'Unknown Account';
            const category = `${vendorName} (${accountName})`;
            
            expenseByVendor[category] = (expenseByVendor[category] || 0) + amount;
          }
        });

        const labels = [];
        const dataPoints = [];
        
        // START: Total Received (The positive baseline)
        labels.push('TOTAL RECEIVED');
        dataPoints.push([0, totalReceived]);
        
        let currentRunningTotal = totalReceived;

        // MIDDLE: Each expense category (by vendor) drops the total
        Object.entries(expenseByVendor).forEach(([category, amount]) => {
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
          {fieldYearCropId 
            ? `Transactions for this crop` 
            : `Aggregated from all transactions for ${new Date().getFullYear()}`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExpenditureWaterfall;
