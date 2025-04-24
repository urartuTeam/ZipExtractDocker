import React, { useState, useEffect } from 'react';
import { getPositions, createPosition, updatePosition, deletePosition, getPositionStats } from '../services/api';
import { isManager, isAdmin } from '../services/auth';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [positionStats, setPositionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      try {
        const [positionsRes, statsRes] = await Promise.all([
          getPositions(),
          getPositionStats()
        ]);
        
        setPositions(positionsRes.data.positions);
        setPositionStats(statsRes.data.stats);
      } catch (error) {
        console.error('Error fetching positions:', error);
        setError('Failed to load positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      description: ''
    });
    setEditing(false);
    setCurrentPosition(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (position) => {
    setFormValues({
      name: position.name,
      description: position.description || ''
    });
    setEditing(true);
    setCurrentPosition(position);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this position?')) {
      return;
    }
    
    try {
      await deletePosition(id);
      setPositions(positions.filter(position => position.id !== id));
    } catch (error) {
      console.error('Error deleting position:', error);
      if (error.response && error.response.status === 400) {
        alert('Cannot delete position with assigned employees.');
      } else {
        alert('Failed to delete position. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing && currentPosition) {
        const response = await updatePosition(currentPosition.id, formValues);
        setPositions(positions.map(position => 
          position.id === currentPosition.id ? response.data.position : position
        ));
      } else {
        const response = await createPosition(formValues);
        setPositions([...positions, response.data.position]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving position:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to save position. Please check your inputs and try again.');
      }
    }
  };

  // Helper function to get stats for a position
  const getPositionStat = (positionId) => {
    return positionStats.find(stat => parseInt(stat.id) === positionId);
  };

  if (loading && positions.length === 0) {
    return <div className="loading">Loading positions...</div>;
  }

  return (
    <div className="positions-container">
      <h1>Positions</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="actions-bar">
        {isManager() && (
          <button 
            className="btn btn-primary" 
            onClick={handleAddClick}
          >
            Add Position
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="form-container">
          <h2>{editing ? 'Edit Position' : 'Add New Position'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Position Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update' : 'Save'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="positions-grid">
        {positions.length > 0 ? (
          positions.map(position => {
            const stats = getPositionStat(position.id);
            return (
              <div key={position.id} className="position-card">
                <div className="position-header">
                  <h3>{position.name}</h3>
                  {isManager() && (
                    <div className="position-actions">
                      <button 
                        className="btn btn-sm btn-info" 
                        onClick={() => handleEditClick(position)}
                      >
                        Edit
                      </button>
                      {isAdmin() && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteClick(position.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="position-body">
                  <p className="position-description">
                    {position.description || 'No description provided.'}
                  </p>
                  {stats && (
                    <div className="position-stats">
                      <div className="stat-item">
                        <span className="stat-label">Employees:</span>
                        <span className="stat-value">{stats.employeeCount}</span>
                      </div>
                      {stats.averageSalary && (
                        <div className="stat-item">
                          <span className="stat-label">Avg. Salary:</span>
                          <span className="stat-value">${Math.round(stats.averageSalary)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">No positions found.</div>
        )}
      </div>
    </div>
  );
};

export default Positions;
