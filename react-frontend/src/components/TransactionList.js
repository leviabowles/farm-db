import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
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

import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TransactionList = () => {
  console.log('TransactionList render start');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Filter to transactions in last 2 years, sorted by most recent first
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const isoDate = twoYearsAgo.toISOString().split('T')[0];
       
      // min_amount=10 filters out transactions with absolute value under $10
      const response = await api.get(`/api/transactions/?paid_date__gte=${isoDate}&min_amount=10&ordering=-paid_date`);
      const txList = Array.isArray(response.data) ? response.data : (response.data.results || []);

      // Map through transactions to enhance with related data
      const enhancedTransactions = txList.map(tx => {
        // Calculate total amount from line_items if not in serializer response
        let totalAmount = tx.amount;
        if (!totalAmount && tx.line_items && tx.line_items.length > 0) {
          totalAmount = tx.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        }
        
        // Ensure amount is a proper number (remove leading zeros from string)
        if (typeof totalAmount === 'string') {
          totalAmount = parseFloat(totalAmount);
        }
        totalAmount = totalAmount || 0;
        
        return {
          ...tx,
          field_name: tx.field_name || 'Unknown Field',
          account_name: tx.account_name || '-',
          vendor_name: tx.vendor_name || '-',
          amount: totalAmount
        };
      });

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

  const handleEdit = (transactionId) => {
    navigate(`/transactions/${transactionId}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await api.delete(`/api/transactions/${id}/`);
        setTransactions(transactions.filter(tx => tx.id !== id));
      } catch (err) {
        setError('Failed to delete transaction. Please try again.');
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions/new')}
          >
            Add New Transaction
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="transaction table">
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell>{transaction.vendor_name}</TableCell>
                <TableCell>{transaction.account_name}</TableCell>
                <TableCell>{typeof transaction.amount === 'number' ? `$${transaction.amount.toFixed(2)}` : transaction.amount}</TableCell>
                <TableCell>{transaction.paid_date ? new Date(transaction.paid_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Transaction">
                    <IconButton onClick={() => handleEdit(transaction.id)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Transaction">
                    <IconButton onClick={() => handleDelete(transaction.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default TransactionList;