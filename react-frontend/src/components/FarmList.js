import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './FarmList.css';

const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await api.get('/api/fields/');
        // API returns list of farm objects; map fields to expected keys
        const data = response.data.results || response.data;
        const normalized = data.map(f => ({
          id: f.id,
          name: f.farm_name || f.name,
          location: f.location,
          size: f.size || `${f.area || ''}`,
        }));
        setFarms(normalized);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Authentication required. Please log in.');
        } else {
          setError('Failed to fetch farms');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  if (loading) return <div className="farm-list-loading">Loading farms...</div>;
  if (error) return <div className="farm-list-error">{error}</div>;

  return (
    <div className="farm-list">
      <h2>Farm List</h2>
      <Link to="/farms/new" className="btn btn-primary">Add New Farm</Link>
      
      <table className="farm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {farms.map(farm => (
            <tr key={farm.id}>
              <td>{farm.name}</td>
              <td>{farm.location}</td>
              <td>{farm.size}</td>
              <td>
                <Link to={`/farms/${farm.id}/edit`} className="btn btn-secondary">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FarmList;