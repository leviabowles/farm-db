import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

const TransactionList = () => {
  console.log('TransactionList render start');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    // Use a relative path for API calls during development; the proxy defined in
    // `setupProxy.js` will forward `/api/...` to the Django backend under the
    // ``/farms`` namespace. In production builds we rely on the same relative
    // path because the container serves both frontend and backend behind the
    // same host, and the proxy is not used.
    const API_BASE = '';

  // Debug: log the request URL being used
  console.log('TransactionList - fetching from', `${API_BASE}/api/transactions/`);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Use environment variable for API URL when running in Docker
        const response = await axios.get(`${API_BASE}/api/transactions/`);
        console.log('Fetched transactions, status', response.status, 'data', response.data);
        // DRF pagination returns an object with a "results" array. Use that for the list.
        const txList = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Process and enhance transaction data for better display
        const enhancedTransactions = txList.map(tx => ({
          ...tx,
          field_name: tx.field?.field_name || tx.field || 'Unknown Field',
          create_date_formatted: new Date(tx.create_date).toLocaleDateString(),
          update_date_formatted: new Date(tx.update_date).toLocaleDateString(),
          paid_amount_display: tx.paid_amount ? `$${tx.paid_amount.toLocaleString()}` : '$0',
          received_amount_display: tx.received_amount ? `$${tx.received_amount.toLocaleString()}` : '$0'
        }));
        
        setTransactions(enhancedTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        const msg = err.response?.data?.detail || err.message || 'Failed to fetch transactions';
        setError(msg);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_BASE}/api/transactions/${id}/`);
        // Remove from local state
        setTransactions(transactions.filter(tx => tx.id !== id));
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
  };
  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h5" gutterBottom>
        Transaction Management
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="transaction table">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Received</TableCell>
              <TableCell>Create Date</TableCell>
              <TableCell>Update Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell>{transaction.field_name}</TableCell>
                <TableCell>{transaction.memo}</TableCell>
                <TableCell>{transaction.paid_amount_display}</TableCell>
                <TableCell>{transaction.received_amount_display}</TableCell>
                <TableCell>{transaction.create_date_formatted}</TableCell>
                <TableCell>{transaction.update_date_formatted}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      component={Link}
                      to={`/transactions/${transaction.id}/edit`}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(transaction.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        component={Link}
        to="/transactions/new"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Add New Transaction
      </Button>
    </Paper>
  );
};

export default TransactionList;