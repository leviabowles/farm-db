import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const FieldYearCropList = () => {
  const [fieldYearCrops, setFieldYearCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFieldYearCrops = async () => {
      try {
        console.log('Fetching field year crops from API...');
        const response = await api.get('/api/fieldyearcrops/');
        
        // Handle DRF pagination wrapper format
        const fieldYearCropArray = Array.isArray(response.data) ? 
          response.data : (response.data.results || []);
        
        console.log('Fetched field year crops:', fieldYearCropArray);
        
        // Enhance data for better display - include fallbacks for missing related fields
        const enhancedData = fieldYearCropArray.map(fyc => ({
          ...fyc,
          field_name: fyc.field?.field_name || fyc.field || 'Unknown Field',
          crop_name: fyc.crop?.crop_name || fyc.crop || 'Unknown Crop'
        }));
        
        setFieldYearCrops(enhancedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching field year crops:', err);
        setError(`Failed to load field year crops: ${err.message || 'Network error'}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFieldYearCrops();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Show a message when no data is available
  if (fieldYearCrops.length === 0) {
    return (
      <Paper sx={{ p: 3 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Field Year Crops
        </Typography>
        <Typography variant="body1">
          No field year crop data available. This might be because the database is empty or there's an issue with the API connection.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h5" gutterBottom>
        Field Year Crops
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="field year crops table">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Crop</TableCell>
              <TableCell>Acreage Planted</TableCell>
              <TableCell>Total Bushels</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fieldYearCrops.map((fyc) => (
              <TableRow key={fyc.id} hover>
                <TableCell>{fyc.field_name}</TableCell>
                <TableCell>{fyc.year_key}</TableCell>
                <TableCell>{fyc.crop_name}</TableCell>
                <TableCell>{fyc.acres_planted || 0}</TableCell>
                <TableCell>{fyc.total_bushels ? fyc.total_bushels.toLocaleString() : '0'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default FieldYearCropList;