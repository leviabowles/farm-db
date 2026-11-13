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
import RefreshIcon from '@mui/icons-material/Refresh';
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
  const [fields, setFields] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const navigate = useNavigate();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching transactions from API...');
      const response = await api.get('/api/transactions/');
      const txList = Array.isArray(response.data) ? response.data : (response.data.results || []);

      // Get account names for display
      const accountMap = {};
      accounts.forEach(acc => { accountMap[acc.id] = acc.name; });

      const enhancedTransactions = txList.map(tx => ({
        ...tx,
        field_name: tx.field?.field_name || tx.field || 'Unknown Field',
        account_name: accountMap[tx.account] || tx.account || '-'
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
  }, [accounts]);

  // Fetch fields, vendors, and accounts for dropdowns
  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [fieldsRes, vendorsRes, accountsRes] = await Promise.all([
        api.get('/api/fields/'),
        api.get('/api/vendors/'),
        api.get('/api/accounts/')
      ]);
      setFields(fieldsRes.data.results || []);
      setVendors(vendorsRes.data.results || []);
      setAccounts(accountsRes.data.results || []);
    } catch (err) {
      console.error('Error fetching fields/vendors/accounts:', err);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchOptions();
  }, [fetchTransactions, fetchOptions]);

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
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTransactions}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
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
              <TableCell>Field</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => {
              // Determine if this is debit (money out) or credit (money in)
              const isDebit = transaction.transaction_type === 'debit';

              return (
                <TableRow key={transaction.id} hover>
                  <TableCell>{transaction.field_name}</TableCell>
                  <TableCell>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: isDebit ? '#ffebee' : '#e8f5e9',
                      color: isDebit ? '#c62828' : '#2e7d32'
                    }}>
                      {isDebit ? '💸 Debit' : '💰 Credit'}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.account_name}</TableCell>
                  <TableCell>{transaction.memo || '-'}</TableCell>
                  <TableCell>{transaction.vendor?.vendor_name || '-'}</TableCell>
                  <TableCell>{new Date(transaction.paid_date).toLocaleDateString()}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default TransactionList;