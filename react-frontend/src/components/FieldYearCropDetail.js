import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, 
  Divider, Breadcrumbs, Link as MuiLink, Chip, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink, useParams } from 'react-router-dom';
import api from '../services/api';

const DetailSection = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', mr: 2, borderRadius: 1 }} />
      {title}
    </Typography>
    {children}
  </Box>
);

const FieldYearCropDetail = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both crop details and associated transactions in parallel
      const [cropRes, txRes] = await Promise.all([
        api.get(`/api/fieldyearcrops/${id}/`),
        api.get(`/api/transactions/?field_year_crop=${id}`)
      ]);

      setCrop(cropRes.data);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : (txRes.data.results || []));
      setError(null);
    } catch (err) {
      console.error('Error fetching detail data:', err);
      setError('Failed to load crop information.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !crop) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !crop) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error || 'Crop not found'}</Typography>
        <MuiLink component={RouterLink} to="/fieldyearcrops" sx={{ mt: 2, display: 'block' }}>
          Back to list
        </MuiLink>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '40px 20px', maxWidth: 'lg', margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={RouterLink} to="/fieldyearcrops" color="inherit" underline="hover">
          Crop History
        </MuiLink>
        <Typography color="text.primary">Crop Detail</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {crop.field?.field_name || 'Unknown Field'} — {crop.year_key}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Core Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} elevation={0}>
            <DetailSection title="Core Details">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">CROP</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {crop.crop?.crop_name || 'Unknown Crop'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">PLANTING DATE</Typography>
                  <Typography variant="body1">
                    {crop.planting_date || 'Not recorded'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">HARVEST DATE</Typography>
                  <Typography variant="body1">
                    {crop.harvest_date || 'Still in field'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">ACRES PLANTED</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {crop.acres_planted || 0} Acres
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">TOTAL BUSHELS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {crop.total_bushels || 0}
                  </Typography>
                </Box>
              </Box>
            </DetailSection>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
               <Chip label={`Year ${crop.year_key}`} color="primary" variant="outlined" />
               <Chip label={crop.field?.field_state || 'No State'} color="default" variant="outlined" />
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Associated Transactions */}
        <Grid item xs={12} md={8}>
          <DetailSection title="Associated Transactions">
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component="a"
                href={`${process.env.REACT_APP_API_URL.replace(/\/farms\/?$/, '')}/admin/farms/fieldyeartransaction/add/`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
              >
                Add Transaction
              </Button>
            </Box>
            {transactions.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, color: 'text.secondary' }} elevation={0}>
                No transactions associated with this crop.
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 'none', border: '1px solid #ECEFF1' }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: '#F8F9FA' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Memo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{tx.invoice_date || tx.paid_date || 'N/A'}</TableCell>
                        <TableCell>{tx.memo || 'No description'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={tx.trans_type || 'Unknown'} 
                            size="small" 
                            color={tx.trans_type === 'credit' ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {tx.received_amount ? `+$${tx.received_amount}` : `-$${tx.paid_amount || 0}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DetailSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FieldYearCropDetail;
