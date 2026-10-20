import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FieldList.css';

/**
 * Component that lists individual fields (land parcels).
 * It fetches data from the Django API endpoint `/api/fields/`.
 * For now we fall back to mock data if the request fails, so the UI stays functional
 * during development without needing the backend to be up.
 */
const FieldList = () => {
  // Ensure `fields` is always an array to avoid .map errors.
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        // Adjusted URL to match Django's routing where API endpoints are under the "farms" prefix
        // Use the proxied API base path; the proxy will rewrite '/api' to '/farms/api/'.
        const response = await axios.get('/api/fields/');
        // The Django REST pagination wrapper returns an object with a "results" array.
        // We extract the array so that `fields.map` works correctly.
        const fieldArray = Array.isArray(response.data) ? response.data : (response.data.results || []);
        console.log('Fetched fields:', fieldArray); // Debug log
        setFields(fieldArray);
      } catch (err) {
        // If the backend is not reachable, use mock data for demo purposes
        console.warn('Failed to fetch fields from API, using mock data', err);
        const mockFields = [
          { id: 1, field_name: 'North Field', field_state: 'CA', field_county: 'Alameda', crop_acreage: 120 },
          { id: 2, field_name: 'South Meadow', field_state: 'TX', field_county: 'Travis', crop_acreage: 85 },
          { id: 3, field_name: 'East Ridge', field_state: 'CO', field_county: 'Boulder', crop_acreage: 60 }
        ];
        setFields(mockFields);
        setError('Failed to load fields from server');
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) return <div className="field-list-loading">Loading fields...</div>;
  if (error && fields.length === 0) return <div className="field-list-error">{error}</div>;
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
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(fields) ? fields : []).map(f => (
            <tr key={f.id}>
              <td>{f.field_name}</td>
              <td>{f.field_state}</td>
              <td>{f.field_county}</td>
              <td>{f.crop_acreage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldList;
