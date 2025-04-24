import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentStats } from '../services/api';
import { isManager, isAdmin } from '../services/auth';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const [departmentsRes, statsRes] = await Promise.all([
          getDepartments(),
          getDepartmentStats()
        ]);
        
        setDepartments(departmentsRes.data.departments);
        setDepartmentStats(statsRes.data.stats);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
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
    setCurrentDepartment(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (department) => {
    setFormValues({
      name: department.name,
      description: department.description || ''
    });
    setEditing(true);
    setCurrentDepartment(department);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }
    
    try {
      await deleteDepartment(id);
      setDepartments(departments.filter(department => department.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
      if (error.response && error.response.status === 400) {
        alert('Cannot delete department with assigned employees.');
      } else {
        alert('Failed to delete department. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing && currentDepartment) {
        const response = await updateDepartment(currentDepartment.id, formValues);
        setDepartments(departments.map(department => 
          department.id === currentDepartment.id ? response.data.department : department
        ));
      } else {
        const response = await createDepartment(formValues);
        setDepartments([...departments, response.data.department]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving department:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to save department. Please check your inputs and try again.');
      }
    }
  };

  // Helper function to get employee count for a department
  const getEmployeeCount = (departmentId) => {
    const stats = departmentStats.find(stat => parseInt(stat.id) === departmentId);
    return stats ? stats.employeeCount : 0;
  };

  if (loading && departments.length === 0) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="departments-container">
      <h1>Departments</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="actions-bar">
        {isManager() && (
          <button 
            className="btn btn-primary" 
            onClick={handleAddClick}
          >
            Add Department
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="form-container">
          <h2>{editing ? 'Edit Department' : 'Add New Department'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Department Name</label>
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
      
      <div className="departments-grid">
        {departments.length > 0 ? (
          departments.map(department => (
            <div key={department.id} className="department-card">
              <div className="department-header">
                <h3>{department.name}</h3>
                {isManager() && (
                  <div className="department-actions">
                    <button 
                      className="btn btn-sm btn-info" 
                      onClick={() => handleEditClick(department)}
                    >
                      Edit
                    </button>
                    {isAdmin() && (
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteClick(department.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="department-body">
                <p className="department-description">
                  {department.description || 'No description provided.'}
                </p>
                <div className="department-stats">
                  <span className="stat-label">Employees:</span>
                  <span className="stat-value">{getEmployeeCount(department.id)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No departments found.</div>
        )}
      </div>
    </div>
  );
};

export default Departments;
