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
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import Banner from './Banner';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
  },
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
        
        const latestMap = {};
        allCrops.forEach(crop => {
          const fieldId = crop.field; 
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
    <Box>
      <Banner />
      
      <Box sx={{ padding: '40px 20px', maxWidth: 'lg', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Farm Overview
        </Typography>

        <Grid container spacing={4}>
          {/* Main Section: Currently Planted Crops */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4 }} elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', mr: 2, borderRadius: 1 }} />
                CURRENTLY PLANTED CROPS
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', color: 'text.secondary' } }}>
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
                            <TableCell sx={{ fontWeight: 500 }}>{crop.field_name}</TableCell>
                            <TableCell>{crop.year_key}</TableCell>
                            <TableCell>
                              <Box 
                                component="span" 
                                sx={{ 
                                  px: 1.5, py: 0.5, 
                                  borderRadius: '20px', 
                                  bgcolor: 'secondary.light', 
                                  color: 'secondary.dark', 
                                  fontSize: '0.85rem',
                                  fontWeight: 600 
                                }}
                              >
                                {crop.crop_name}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{crop.acres_planted || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Fields</Typography>
              <Button component={Link} to="/fields" variant="contained" disableElevation sx={{ mt: 2 }}>Manage</Button>
            </Item>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Item>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Transactions</Typography>
              <Button component={Link} to="/transactions" variant="contained" disableElevation sx={{ mt: 2 }}>Manage</Button>
            </Item>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Item>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Crop History</Typography>
              <Button component={Link} to="/fieldyearcrops" variant="contained" disableElevation sx={{ mt: 2 }}>Manage</Button>
            </Item>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Item>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">Farms</Typography>
              <Button component={Link} to="/farms" variant="contained" disableElevation sx={{ mt: 2 }}>Manage</Button>
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
