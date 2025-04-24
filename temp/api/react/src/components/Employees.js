import React, { useState, useEffect } from 'react';
import { 
  getEmployees, 
  getDepartments, 
  getPositions, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../services/api';
import { isManager, isAdmin } from '../services/auth';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  
  // Form values
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: '',
    department: '',
    position: '',
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterDepartment) {
          params.department = filterDepartment;
        }
        if (filterPosition) {
          params.position = filterPosition;
        }
        
        const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
          getEmployees(params),
          getDepartments(),
          getPositions()
        ]);
        
        setEmployees(employeesRes.data.employees);
        setDepartments(departmentsRes.data.departments);
        setPositions(positionsRes.data.positions);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load employees data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterDepartment, filterPosition]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormValues({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hireDate: '',
      salary: '',
      department: '',
      position: '',
      isActive: true
    });
    setEditing(false);
    setCurrentEmployee(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (employee) => {
    setFormValues({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      hireDate: employee.hireDate.split('T')[0], // Format date for input
      salary: employee.salary,
      department: employee.department.id,
      position: employee.position.id,
      isActive: employee.isActive
    });
    setEditing(true);
    setCurrentEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter(employee => employee.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing && currentEmployee) {
        const response = await updateEmployee(currentEmployee.id, formValues);
        setEmployees(employees.map(employee => 
          employee.id === currentEmployee.id ? response.data.employee : employee
        ));
      } else {
        const response = await createEmployee(formValues);
        setEmployees([...employees, response.data.employee]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to save employee. Please check your inputs and try again.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterDepartment') {
      setFilterDepartment(value);
    } else if (name === 'filterPosition') {
      setFilterPosition(value);
    }
  };

  if (loading && employees.length === 0) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employees-container">
      <h1>Employees</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="actions-bar">
        {isManager() && (
          <button 
            className="btn btn-primary" 
            onClick={handleAddClick}
          >
            Add Employee
          </button>
        )}
        
        <div className="filters">
          <select 
            name="filterDepartment" 
            value={filterDepartment} 
            onChange={handleFilterChange}
          >
            <option value="">All Departments</option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          
          <select 
            name="filterPosition" 
            value={filterPosition} 
            onChange={handleFilterChange}
          >
            <option value="">All Positions</option>
            {positions.map(position => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {showForm && (
        <div className="form-container">
          <h2>{editing ? 'Edit Employee' : 'Add New Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formValues.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="hireDate">Hire Date</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formValues.hireDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="number"
                step="0.01"
                id="salary"
                name="salary"
                value={formValues.salary}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formValues.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <select
                id="position"
                name="position"
                value={formValues.position}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Position</option>
                {positions.map(position => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group checkbox">
              <label htmlFor="isActive">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formValues.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
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
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Salary</th>
              <th>Status</th>
              {isManager() && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.firstName} {employee.lastName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone || 'N/A'}</td>
                  <td>{employee.department.name}</td>
                  <td>{employee.position.name}</td>
                  <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                  <td>${parseFloat(employee.salary).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${employee.isActive ? 'status-active' : 'status-inactive'}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isManager() && (
                    <td>
                      <button 
                        className="btn btn-sm btn-info" 
                        onClick={() => handleEditClick(employee)}
                      >
                        Edit
                      </button>
                      {isAdmin() && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteClick(employee.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isManager() ? 9 : 8} className="text-center">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
