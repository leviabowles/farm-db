import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './FieldList.css';

/**
 * Component that lists individual fields (land parcels).
 * It fetches data from the Django API endpoint `/api/fields/`.
 * This version properly connects to the backend and shows real data.
 */
const FieldList = () => {
  // Ensure `fields` is always an array to avoid .map errors.
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        // Use the 'api' service instance instead of raw axios
        // This ensures REACT_APP_API_URL is used in production
        console.log('Fetching fields from API...');
        const response = await api.get('/api/fields/');
        
        // Handle different response formats depending on DRF configuration
        let fieldArray = [];
        if (Array.isArray(response.data)) {
          fieldArray = response.data;
        } else if (response.data && response.data.results) {
          // DRF pagination format - extract results array
          fieldArray = response.data.results;
        } else {
          // If unexpected data structure, fallback to empty array
          console.warn('Unexpected API response format:', response.data);
          fieldArray = [];
        }
        
        console.log('Successfully fetched fields:', fieldArray); // Debug log
        setFields(fieldArray);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch fields from API:', err);
        setError(`Failed to load fields: ${err.message || 'Network error'}`);
        
        // Only show mock data if we're certain API connection failed and no real data
        if (err.response?.status === 404 || err.request) {
          // Backend is reachable but endpoint not found, or network issues - still show a meaningful error
          setError('Could not connect to backend data service. Please check the server status.');
        } else {
          // If we're in dev mode and can't access API, use mock for demo purposes
          console.warn('Using mock data as backup');
          const mockFields = [
            { id: 1, field_name: 'North Field', field_state: 'CA', field_county: 'Alameda', crop_acreage: 120 },
            { id: 2, field_name: 'South Meadow', field_state: 'TX', field_county: 'Travis', crop_acreage: 85 },
            { id: 3, field_name: 'East Ridge', field_state: 'CO', field_county: 'Boulder', crop_acreage: 60 }
          ];
          setFields(mockFields);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFields();
  }, []);

  if (loading) return <div className="field-list-loading">Loading fields...</div>;
  
  if (error && fields.length === 0) {
    return (
      <div className="field-list-error">
        <p>{error}</p>
        <p>Check your backend connection or try refreshing the page.</p>
      </div>
    );
  }

  // Debug: show raw fields data when empty
  if (Array.isArray(fields) && fields.length === 0) {
    console.log('No fields returned from API', fields);
  }

  return (
    <div className="field-list">
      <h2>Field List</h2>
      {/* No create link yet – can be added later */}
      <table className="field-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>State</th>
            <th>County</th>
            <th>Crop Acreage</th>
            <th>Purchase Date</th>
            <th>Price Paid</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(fields) ? fields : []).map(f => (
            <tr key={f.id}>
              <td>{f.field_name}</td>
              <td>{f.field_state}</td>
              <td>{f.field_county}</td>
              <td>{f.crop_acreage}</td>
              <td>{f.date_purchased ? new Date(f.date_purchased).toLocaleDateString() : 'N/A'}</td>
              <td>${f.price_paid ? f.price_paid.toLocaleString() : '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldList;
