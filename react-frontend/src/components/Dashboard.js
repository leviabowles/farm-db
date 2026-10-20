import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        // In a real app, you would connect to your Django API
        // For now, using mock data for demonstration
        
        // Mock data for demonstration
        const mockData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Crop Production (tons)',
              data: [12, 19, 3, 5, 2, 3],
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
            {
              label: 'Revenue ($)',
              data: [12000, 19000, 3000, 5000, 2000, 3000],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
            }
          ]
        };
        
        setFarmData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch farm data');
        setLoading(false);
      }
    };

    fetchFarmData();
  }, []);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Farm Data Dashboard</h2>
      
      <div className="dashboard-summary">
        <h3>Quick Summary</h3>
        <ul>
          <li>Total Farms: 4</li>
          <li>Total Transactions: 0</li>
          <li>Last Updated: Today</li>
        </ul>
      </div>
      
      <div className="chart-container">
        <h3>Crop Production & Revenue Trends</h3>
        <Line data={farmData} />
      </div>
      
      <div className="chart-container">
        <h3>Production by Month</h3>
        <Bar data={farmData} />
      </div>
      
      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <Link to="/farms" className="btn btn-primary">Manage Farms</Link>
        <Link to="/transactions" className="btn btn-primary">Manage Transactions</Link>
      </div>
    </div>
  );
};

export default Dashboard;