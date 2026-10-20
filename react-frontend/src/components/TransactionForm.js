import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TransactionForm.css';

const TransactionForm = () => {
  // The backend model uses `memo` for a description and auto‑populates dates.
  // Include all relevant fields from the backend model. Simple text inputs are used for foreign‑key IDs.
  const [formData, setFormData] = useState({
    memo: '',
    field: '',          // FK to Field (use ID)
    year_key: '',
    trans_type: 'debit',
    transaction_object: '', // FK ID
    vendor: '',
    invoice_date: '',
    paid_date: '',
    paid_amount: '',
    received_amount: '',
    create_date: '',   // optional – will be ignored if empty
    update_date: '' ,  // optional – will be ignored if empty
    doc_file: null     // file upload (optional)
  });
  
  // State for multiple attachments
  const [attachments, setAttachments] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams();

  // Default to the API base with the required namespace. When running locally without Docker,
  // include the '/farms' prefix so routes resolve correctly.
  // Use the CRA environment variable; Vite will also set REACT_APP_API_URL if needed.
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/farms';

  useEffect(() => {
    // If editing an existing transaction, load the data
    if (id) {
      const fetchTransaction = async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/transactions/${id}/`);
          setFormData(response.data);
        } catch (err) {
          setError('Failed to fetch transaction data');
        }
      };

      fetchTransaction();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Separate handler for file input because we store the File object directly.
  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setFormData(prev => ({
      ...prev,
      doc_file: file
    }));
  };

  // Handler for multiple attachments
  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
      try {
        // If a file was selected, use multipart/form-data; otherwise send JSON.
        let requestData;
        let config = {};
        if (formData.doc_file || attachments.length > 0) {
          const fd = new FormData();
          Object.entries(formData).forEach(([key, val]) => {
            if (val !== null && key !== 'doc_file') {
              // Omit empty dates so defaults apply on the backend.
              if ((key === 'create_date' || key === 'update_date') && !val) return;
              fd.append(key, val);
            }
          });
          
          // Add the main document file
          if (formData.doc_file) {
            fd.append('doc_file', formData.doc_file);
          }
          
          // Add multiple attachment files
          attachments.forEach((file, index) => {
            fd.append(`attachments`, file);
          });
          
          requestData = fd;
          config.headers = { 'Content-Type': 'multipart/form-data' };
        } else {
          const payload = { ...formData };
          if (!payload.create_date) delete payload.create_date;
          if (!payload.update_date) delete payload.update_date;
          requestData = payload;
        }

        if (id) {
          await axios.put(`${API_BASE}/api/transactions/${id}/`, requestData, config);
        } else {
          await axios.post(`${API_BASE}/api/transactions/`, requestData, config);
        }
      
      navigate('/transactions');
    } catch (err) {
      setError('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2>{id ? 'Edit Transaction' : 'Add New Transaction'}</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Memo */}
        <div className="form-group">
          <label htmlFor="memo">Memo:</label>
          <input
            type="text"
            id="memo"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            required
          />
        </div>

        {/* Field (FK) */}
        <div className="form-group">
          <label htmlFor="field">Field ID:</label>
          <input
            type="text"
            id="field"
            name="field"
            value={formData.field}
            onChange={handleChange}
          />
        </div>

        {/* Year Key */}
        <div className="form-group">
          <label htmlFor="year_key">Year:</label>
          <input
            type="number"
            id="year_key"
            name="year_key"
            value={formData.year_key}
            onChange={handleChange}
          />
        </div>

        {/* Transaction Type */}
        <div className="form-group">
          <label htmlFor="trans_type">Type:</label>
          <select
            id="trans_type"
            name="trans_type"
            value={formData.trans_type}
            onChange={handleChange}
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        {/* Vendor */}
        <div className="form-group">
          <label htmlFor="vendor">Vendor ID:</label>
          <input
            type="text"
            id="vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
          />
        </div>

        {/* Invoice Date */}
        <div className="form-group">
          <label htmlFor="invoice_date">Invoice Date:</label>
          <input
            type="date"
            id="invoice_date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleChange}
          />
        </div>

        {/* Paid Date */}
        <div className="form-group">
          <label htmlFor="paid_date">Paid Date:</label>
          <input
            type="date"
            id="paid_date"
            name="paid_date"
            value={formData.paid_date}
            onChange={handleChange}
          />
        </div>

        {/* Paid Amount */}
        <div className="form-group">
          <label htmlFor="paid_amount">Paid Amount:</label>
          <input
            type="number"
            step="0.01"
            id="paid_amount"
            name="paid_amount"
            value={formData.paid_amount}
            onChange={handleChange}
          />
        </div>

        {/* Received Amount */}
        <div className="form-group">
          <label htmlFor="received_amount">Received Amount:</label>
          <input
            type="number"
            step="0.01"
            id="received_amount"
            name="received_amount"
            value={formData.received_amount}
            onChange={handleChange}
          />
        </div>

        {/* Document upload */}
        <div className="form-group">
          <label htmlFor="doc_file">Document:</label>
          <input
            type="file"
            id="doc_file"
            name="doc_file"
            onChange={handleFileChange}
          />
        </div>
        
        {/* Multiple attachments */}
        <div className="form-group">
          <label htmlFor="attachments">Additional Attachments:</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            multiple
            onChange={handleAttachmentsChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="create_date">Create Date:</label>
          <input
            type="datetime-local"
            id="create_date"
            name="create_date"
            value={formData.create_date ? formData.create_date.split('T')[0] + 'T' + formData.create_date.split('T')[1].substring(0, 5) : ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="update_date">Update Date:</label>
          <input
            type="datetime-local"
            id="update_date"
            name="update_date"
            value={formData.update_date ? formData.update_date.split('T')[0] + 'T' + formData.update_date.split('T')[1].substring(0, 5) : ''}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
        <Link to="/transactions" className="btn btn-secondary">Cancel</Link>
      </form>
    </div>
  );
};

export default TransactionForm;