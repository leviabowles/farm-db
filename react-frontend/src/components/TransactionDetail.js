import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Helper to construct the media URL
const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) {
    const mediaUrl = process.env.REACT_APP_MEDIA_URL || '/media/';
    return mediaUrl.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
  }
  const mediaUrl = process.env.REACT_APP_MEDIA_URL || '/media/';
  return mediaUrl.replace(/\/+$/, '') + '/' + path;
};

// Helper functions for amount formatting
export const formatAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return amount;
  return `$${amount.toFixed(2)}`;
};

// Helper to get all attachment files for a transaction
const getAllAttachments = (tx) => {
  const attachments = [];
  if (tx.doc_file) {
    attachments.push({
      id: 'main',
      file: tx.doc_file,
      name: tx.doc_file.split('/').pop() || 'Document',
      fullUrl: getMediaUrl(tx.doc_file)
    });
  }
  if (tx.attachment_files && tx.attachment_files.length > 0) {
    attachments.push(...tx.attachment_files);
  }
  return attachments;
};

function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await api.get(`/api/transactions/${id}/`);
        setTransaction(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to load transaction details');
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading transaction...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/transactions')}>
          Back to Transactions
        </Button>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Transaction not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/transactions')}>
          Back to Transactions
        </Button>
      </Box>
    );
  }

  const allAttachments = getAllAttachments(transaction);
  const totalAmount = transaction.line_items
    ? transaction.line_items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Back button and header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/transactions')}
          variant="outlined"
        >
          Back to Transactions
        </Button>
        <Box>
          <Button 
            startIcon={<EditIcon />} 
            onClick={() => navigate(`/transactions/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Typography variant="h5">
            Transaction #{transaction.id}
          </Typography>
        </Box>
      </Box>

      {/* Transaction Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Transaction Summary" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography>{transaction.trans_type === 'debit' ? 'Debit' : 'Credit'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Date</Typography>
              <Typography>{transaction.paid_date || transaction.invoice_date || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Memo</Typography>
              <Typography>{transaction.memo || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              <Typography variant="h5" color="primary.main">${totalAmount.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Related Entities */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Field" />
            <CardContent>
              <Typography>{transaction.field_name || '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Vendor" />
            <CardContent>
              <Typography>{transaction.vendor_name || '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Account" />
            <CardContent>
              <Typography>{transaction.account_name || '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Line Items */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Line Items" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaction.line_items && transaction.line_items.length > 0 ? (
                transaction.line_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.account_name || `Account #${item.account}`}</TableCell>
                    <TableCell>${parseFloat(item.amount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>No line items</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2, textAlign: 'right', backgroundColor: 'grey.100' }}>
          <Typography variant="h6">
            Total: ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Card>

      {/* Annual Crops */}
      {transaction.annual_crops && transaction.annual_crops.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Annual Crops" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Crop</TableCell>
                  <TableCell>Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.annual_crops.map((crop) => (
                  <TableRow key={crop.id}>
                    <TableCell>{crop.field_name || `Field #${crop.field}`}</TableCell>
                    <TableCell>{crop.crop_name || `Crop #${crop.crop}`}</TableCell>
                    <TableCell>{crop.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Documents */}
      {allAttachments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Documents" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {allAttachments.map((att) => (
                <Button
                  key={att.id}
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(att.fullUrl, '_blank')}
                >
                  <AttachFileIcon sx={{ mr: 1 }} />
                  {att.name}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Ledger Entries */}
      {transaction.ledger_entries && transaction.ledger_entries.length > 0 && (
        <Card>
          <CardHeader title="Ledger Entries" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Memo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.ledger_entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.trans_type === 'debit' ? 'Debit' : 'Credit'}</TableCell>
                    <TableCell>{entry.account_name || `Account #${entry.account}`}</TableCell>
                    <TableCell>${parseFloat(entry.paid_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{entry.memo || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

export default TransactionDetail;
