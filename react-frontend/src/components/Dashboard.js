import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import api from '../services/api';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Dashboard = () => {
  const [currentCrops, setCurrentCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestCrops = async () => {
      try {
        console.log('Fetching crop data for dashboard...');
        const response = await api.get('/api/fieldyearcrops/');
        
        let allCrops = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Filter for most recent planting per field
        // Logic: Group by field and pick the one with the maximum year_key
        const latestMap = {};
        allCrops.forEach(crop => {
          const fieldId = crop.field; // Assuming field is the ID or object with ID
          const fieldIdStr = typeof fieldId === 'object' ? fieldId.id : fieldId;
          
          if (!latestMap[fieldIdStr] || crop.year_key > latestMap[fieldIdStr].year_key) {
            latestMap[fieldIdStr] = crop;
          }
        });

        const latestCrops = Object.values(latestMap).map(crop => ({
          ...crop,
          field_name: crop.field?.field_name || 'Unknown Field',
          crop_name: crop.crop?.crop_name || 'Unknown Crop'
        }));

        setCurrentCrops(latestCrops);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard crops:', err);
        setError('Failed to load current crop status.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestCrops();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Farm Database Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Main Section: Currently Planted Crops */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              CURRENTLY PLANTED CROPS (Latest Year)
            </Typography>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress />
              </div>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Year</TableCell>
                      <TableCell>Crop</TableCell>
                      <TableCell align="right">Acres</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCrops.length > 0 ? (
                      currentCrops.map((crop, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{crop.field_name}</TableCell>
                          <TableCell>{crop.year_key}</TableCell>
                          <TableCell>{crop.crop_name}</TableCell>
                          <TableCell align="right">{crop.acres_planted || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No crop data available for the current year.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Bottom Section: Navigation Links */}
        <Grid item xs={12} sm={3}>
          <Item>
            <Typography variant="subtitle1" fontWeight="bold">Fields</Typography>
            <Button component={Link} to="/fields" variant="outlined" sx={{ mt: 1 }}>Manage</Button>
          </Item>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Item>
            <Typography variant="subtitle1" fontWeight="bold">Transactions</Typography>
            <Button component={Link} to="/transactions" variant="outlined" sx={{ mt: 1 }}>Manage</Button>
          </Item>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Item>
            <Typography variant="subtitle1" fontWeight="bold">Crop History</Typography>
            <Button component={Link} to="/fieldyearcrops" variant="outlined" sx={{ mt: 1 }}>Manage</Button>
          </Item>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Item>
            <Typography variant="subtitle1" fontWeight="bold">Farms</Typography>
            <Button component={Link} to="/farms" variant="outlined" sx={{ mt: 1 }}>Manage</Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;