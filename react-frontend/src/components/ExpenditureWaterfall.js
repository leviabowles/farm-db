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
        const currentYear = new Date().getFullYear();
        const response = await api.get(`/api/transactions/?year_key=${currentYear}`);
        const transactions = Array.isArray(response.data) ? response.data : (response.data.results || []);

        const categoryTotals = {};
        let totalExpensed = 0;

        transactions.forEach(tx => {
          const category = tx.transaction_object_name || 'Other';
          const amount = parseFloat(tx.paid_amount || 0);
          if (amount > 0) {
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          }
        });

        const labels = [];
        const dataPoints = [];
        let currentRunningTotal = 0;

        Object.entries(categoryTotals).forEach(([category, amount]) => {
          labels.push(category);
          const start = currentRunningTotal;
          currentRunningTotal -= amount; // expenses go down
          dataPoints.push([start, currentRunningTotal]);
        });

        labels.push('TOTAL YTD');
        dataPoints.push([0, currentRunningTotal]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Expenditure',
              data: dataPoints,
              backgroundColor: labels.map((l, i) => 
                i === labels.length - 1 ? '#FBC02D' : '#EF5350'
              ),
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
        YTD EXPENDITURE WATERFALL
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
          Total: ${Math.abs(chartData.datasets[0].data[chartData.datasets[0].data.length - 1][1]).toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Aggregated from all categories for {new Date().getFullYear()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExpenditureWaterfall;
