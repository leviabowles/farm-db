import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TransactionList = () => {
  console.log('TransactionList render start');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching transactions from API...');
      const response = await api.get('/api/transactions/');
      const txList = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      const enhancedTransactions = txList.map(tx => ({
        ...tx,
        field_name: tx.field?.field_name || tx.field || 'Unknown Field',
        create_date_formatted: new Date(tx.create_date).toLocaleDateString(),
        update_date_formatted: new Date(tx.update_date).toLocaleDateString(),
        paid_amount_display: tx.paid_amount ? `$${tx.paid_amount.toLocaleString()}` : '$0',
        received_amount_display: tx.received_amount ? `$${tx.received_amount.toLocaleString()}` : '$0'
      }));
      
      setTransactions(enhancedTransactions);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to fetch transactions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}/`);
        setTransactions(transactions.filter(tx => tx.id !== id));
      } catch (err) {
        setError('Failed to delete transaction');
      }
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Transaction Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchTransactions}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
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
                      component="a"
                      href={`${process.env.REACT_APP_API_URL}/admin/farms/fieldyeartransaction/${transaction.id}/change/`}
                      target="_blank"
                      rel="noopener noreferrer"
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
        component="a"
        href={`${process.env.REACT_APP_API_URL}/admin/farms/fieldyeartransaction/add/`}
        target="_blank"
        rel="noopener noreferrer"
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