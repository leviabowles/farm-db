import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FarmForm.css';

const FarmForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // If editing an existing farm, load the data
    if (id) {
      // In a real app, fetch the specific farm from API
      // For now, we'll just show mock data
      setFormData({
        name: 'Green Valley Farm',
        location: 'California', 
        size: '200 acres'
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, submit to your Django API
      // For now, just simulate success
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/farms');
    } catch (err) {
      setError('Failed to save farm data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-form">
      <h2>{id ? 'Edit Farm' : 'Add New Farm'}</h2>
      
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Farm Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="size">Size:</label>
          <input
            type="text"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Farm'}
        </button>
      </form>
    </div>
  );
};

export default FarmForm;