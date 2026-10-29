import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const ClickableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

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
  const navigate = useNavigate();
  const [currentCrops, setCurrentCrops] = useState([]);
  const [harvestedCrops, setHarvestedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        console.log('Fetching crop data for dashboard...');
        const response = await api.get('/api/fieldyearcrops/');
        
        let allCrops = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        const now = new Date();
        const oneAndHalfYearsAgo = new Date();
        oneAndHalfYearsAgo.setMonth(now.getMonth() - 18);

        const active = [];
        const harvested = [];

        allCrops.forEach(crop => {
          const cropData = {
            ...crop,
            field_name: crop.field?.field_name || 'Unknown Field',
            crop_name: crop.crop?.crop_name || 'Unknown Crop'
          };

          if (!crop.harvest_date) {
            active.push(cropData);
          } else {
            const hDate = new Date(crop.harvest_date);
            if (hDate >= oneAndHalfYearsAgo) {
              harvested.push(cropData);
            }
          }
        });

        const sortByYear = (a, b) => (b.year_key || 0) - (a.year_key || 0);
        
        setCurrentCrops(active.sort(sortByYear));
        setHarvestedCrops(harvested.sort(sortByYear));
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard crops:', err);
        setError('Failed to load crop status.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCropData();
  }, []);

  const renderCropTable = (title, data, isHarvested = false) => (
    <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }} elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ width: 4, height: 24, bgcolor: isHarvested ? 'secondary.main' : 'primary.main', mr: 2, borderRadius: 1 }} />
        {title}
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          No {isHarvested ? 'recent harvests' : 'active crops'} found.
        </Box>
      ) : (
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', color: 'text.secondary' } }}>
                <TableCell>Field</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Crop</TableCell>
                <TableCell align="right">Acres</TableCell>
                <TableCell align="center">{isHarvested ? 'Harvest Date' : 'Planting Date'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((crop, index) => (
                <ClickableRow 
                  key={index} 
                  hover 
                  onClick={() => navigate(`/fieldyearcrops/${crop.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{crop.field_name}</TableCell>
                  <TableCell>{crop.year_key}</TableCell>
                  <TableCell>
                    <Box 
                      component="span" 
                      sx={{ 
                        px: 1.5, py: 0.5, 
                        borderRadius: '20px', 
                        bgcolor: isHarvested ? 'secondary.light' : 'primary.light', 
                        color: isHarvested ? 'secondary.dark' : 'primary.dark', 
                        fontSize: '0.85rem',
                        fontWeight: 600 
                      }}
                    >
                      {crop.crop_name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{crop.acres_planted || 0}</TableCell>
                  <TableCell align="center">{isHarvested ? crop.harvest_date : crop.planting_date || 'N/A'}</TableCell>
                </ClickableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  return (
    <Box>
      <Banner />
      
      <Box sx={{ padding: '40px 20px', maxWidth: 'lg', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Farm Status
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            {renderCropTable('CURRENTLY PLANTED CROPS', currentCrops)}
            {renderCropTable('RECENTLY HARVESTED CROPS', harvestedCrops, true)}
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
