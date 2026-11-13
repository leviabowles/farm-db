import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import './TransactionForm.css';

const SimpleTransactionForm = () => {
  // State for form data with sensible defaults
  const [formData, setFormData] = useState({
    memo: '',
    field: '',
    year_key: new Date().getFullYear(), // Default to current year (integer)
    transaction_type: 'debit', // Default to debit (money out)
    vendor: '',
    account: '', // New: account for ledger automation
    invoice_date: '',
    paid_date: new Date().toISOString().split('T')[0], // Default to today
    doc_file: null,
    amount: '' // New: amount for ledger automation
  });

  // Dropdown options
  const [fields, setFields] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch fields, vendors, and accounts on mount
  useEffect(() => {
    const fetchData = async () => {
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
      }
    };
    fetchData();

    // If editing, fetch transaction data
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/api/transactions/${id}/`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load transaction data');
    }
  };

  // Handle field selection change
  const handleFieldChange = (e) => {
    const fieldId = e.target.value;
    setFormData(prev => ({ ...prev, field: fieldId }));
  };

  // Handle year_key input change
  const handleYearChange = (e) => {
    const year = e.target.value;
    // Allow empty or numeric values
    setFormData(prev => ({ ...prev, year_key: year === '' ? '' : parseInt(year, 10) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setFormData(prev => ({ ...prev, doc_file: file }));
  };

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data with all required fields including amount and account
      const payload = {
        memo: formData.memo,
        field: formData.field,
        year_key: formData.year_key,
        transaction_type: formData.transaction_type,
        vendor: formData.vendor,
        account: formData.account,
        invoice_date: formData.invoice_date,
        paid_date: formData.paid_date,
        amount: formData.amount
      };

      // Use multipart/form-data if file is present
      let requestData;
      let config = {};

      if (formData.doc_file) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== null && key !== 'doc_file') {
            fd.append(key, val);
          }
        });
        fd.append('doc_file', formData.doc_file);
        requestData = fd;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        requestData = payload;
      }

      if (id) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/farms'}/api/transactions/${id}/`, requestData, config);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/farms'}/api/transactions/`, requestData, config);
      }

      navigate('/transactions');
    } catch (err) {
      console.error('Error saving transaction:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to save transaction';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Get field name for display
  const getFieldLabel = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    return field ? field.field_name : fieldId || 'Select Field';
  };

  // Get vendor name for display
  const getVendorLabel = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.vendor_name : vendorId || 'Select Vendor';
  };

  // Get account name for display
  const getAccountLabel = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : accountId || 'Select Account';
  };

  return (
    <div className="transaction-form">
      <h2>{id ? 'Edit Transaction' : 'Record New Transaction'}</h2>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Transaction Context Section */}
        <div className="form-section">
          <h3>Transaction Context</h3>

          {/* Field Selection */}
          <div className="form-group">
            <label htmlFor="field">Which Field? <span className="required">*</span></label>
            <select
              id="field"
              name="field"
              value={formData.field}
              onChange={handleFieldChange}
              required
            >
              <option value="">-- Select a Field --</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>{field.field_name}</option>
              ))}
            </select>
            {formData.field && (
              <small className="field-hint">Field: {getFieldLabel(formData.field)}</small>
            )}
          </div>

          {/* Year Input */}
          <div className="form-group">
            <label htmlFor="year_key">Which Year? <span className="required">*</span></label>
            <input
              type="number"
              id="year_key"
              name="year_key"
              value={formData.year_key}
              onChange={handleYearChange}
              required
              placeholder="e.g., 2026"
              min="2000"
              max="2100"
            />
            <small className="field-hint">Enter the year this transaction applies to (e.g., 2026)</small>
          </div>
        </div>

        {/* Transaction Type Section */}
        <div className="form-section">
          <h3>Transaction Type</h3>

          <div className="form-group">
            <label htmlFor="transaction_type">What happened? <span className="required">*</span></label>
            <select
              id="transaction_type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
            >
              <option value="debit">💸 Debit (Money Going Out)</option>
              <option value="credit">💰 Credit (Money Coming In)</option>
            </select>
            <small className="field-hint">
              {formData.transaction_type === 'debit'
                ? 'Payment made to a vendor (e.g., seed purchase, equipment rental, supplies)'
                : 'Payment received from a vendor (e.g., crop sales, loan repayments, payments)'}
            </small>
          </div>

          {/* Vendor Selection */}
          <div className="form-group">
            <label htmlFor="vendor">Who is this with? <span className="required">*</span></label>
            <select
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              required
            >
              <option value="">-- Select a Vendor --</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
              ))}
            </select>
            {formData.vendor && (
              <small className="field-hint">Vendor: {getVendorLabel(formData.vendor)}</small>
            )}
          </div>
        </div>

        {/* Ledger Automation Section */}
        <div className="form-section">
          <h3>Accounting (Auto-Ledger)</h3>
          
          <p className="form-hint">
            Enter the amount and select the account to automatically create ledger entries.
          </p>

          {/* Account Selection */}
          <div className="form-group">
            <label htmlFor="account">Which Account? <span className="required">*</span></label>
            <select
              id="account"
              name="account"
              value={formData.account}
              onChange={handleChange}
              required
            >
              <option value="">-- Select an Account --</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.account_type})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label htmlFor="amount">Amount <span className="required">*</span></label>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter the transaction amount"
            />
            <small className="field-hint">
              This amount will be automatically recorded in the ledger based on the transaction type
            </small>
          </div>
        </div>

        {/* Financial Details Section */}
        <div className="form-section">
          <h3>Transaction Details</h3>

          <div className="form-group">
            <label htmlFor="memo">Notes / Description</label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what this transaction is for... e.g., 'Corn harvest sale', 'Seed purchase from XYZ Co.', 'Equipment rental payment'"
            />
          </div>
        </div>

        {/* Dates Section */}
        <div className="form-section">
          <h3>Important Dates</h3>

          <div className="form-group">
            <label htmlFor="invoice_date">Invoice/Bill Date</label>
            <input
              type="date"
              id="invoice_date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleChange}
            />
            <small className="field-hint">When was the bill/invoice issued?</small>
          </div>

          <div className="form-group">
            <label htmlFor="paid_date">Payment Date <span className="required">*</span></label>
            <input
              type="date"
              id="paid_date"
              name="paid_date"
              value={formData.paid_date}
              onChange={handleChange}
              required
            />
            <small className="field-hint">When did the money actually change hands?</small>
          </div>
        </div>

        {/* Attachments */}
        <div className="form-section">
          <h3>Attachments</h3>

          <div className="form-group">
            <label htmlFor="doc_file">Supporting Document</label>
            <input
              type="file"
              id="doc_file"
              name="doc_file"
              onChange={handleFileChange}
            />
            <small className="field-hint">Upload receipts, invoices, or other documentation</small>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
          <button type="button" onClick={() => navigate('/transactions')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleTransactionForm;
