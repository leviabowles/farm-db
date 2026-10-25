import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Dashboard = () => {
  const [fieldsCount, setFieldsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch basic data count for main model
    const fetchFieldCount = async () => {
      try {
        const response = await fetch('/api/fields/');
        if (response.ok) {
          const data = await response.json();
          const count = Array.isArray(data) ? data.length : (data.count || 0);
          setFieldsCount(count);
        }
      } catch (err) {
        console.log('Could not fetch field count:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFieldCount();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Farm Database Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Data Overview
            </Typography>
            <Typography variant="body1" gutterBottom>
              Manage your farm data through the following sections:
            </Typography>
            {loading ? (
              <Typography variant="body2">Loading data summary...</Typography>
            ) : (
              <Typography variant="body2">
                Currently managing {fieldsCount} fields
              </Typography>
            )}
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Fields
            </Typography>
            <Typography variant="body2" gutterBottom>
              View and manage land parcels in your farm.
            </Typography>
            <Button 
              component={Link} 
              to="/fields" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
            >
              View Fields
            </Button>
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Transactions
            </Typography>
            <Typography variant="body2" gutterBottom>
              Manage financial transactions related to your farm operations.
            </Typography>
            <Button 
              component={Link} 
              to="/transactions" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
            >
              View Transactions
            </Button>
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Field Year Crops
            </Typography>
            <Typography variant="body2" gutterBottom>
              Track crop planting and harvest information by field and year.
            </Typography>
            <Button 
              component={Link} 
              to="/fieldyearcrops" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
            >
              View Field Year Crops
            </Button>
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Farms
            </Typography>
            <Typography variant="body2" gutterBottom>
              Manage information about your farms and operations.
            </Typography>
            <Button 
              component={Link} 
              to="/farms" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
            >
              View Farms
            </Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;