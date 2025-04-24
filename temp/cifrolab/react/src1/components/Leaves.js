import React, { useState, useEffect } from 'react';
import { 
  getLeaves, 
  getEmployees, 
  createLeave, 
  updateLeave, 
  approveLeave, 
  rejectLeave, 
  deleteLeave 
} from '../services/api';
import { isManager, isAdmin, getUser } from '../services/auth';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('');
  
  // Form values
  const [formValues, setFormValues] = useState({
    employee: '',
    startDate: '',
    endDate: '',
    type: 'Vacation',
    reason: '',
    status: 'Pending'
  });

  // Get current user
  const currentUser = getUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        
        // Managers can see all leaves or filter by employee
        if (isManager()) {
          if (filterStatus === 'pending') {
            params.pending = 'true';
          }
          if (filterEmployee) {
            params.employee = filterEmployee;
          }
        } else {
          // Regular users only see their own leaves
          // Find employee record that matches current user email
          const employeesResponse = await getEmployees();
          const userEmployee = employeesResponse.data.employees.find(
            e => e.email === currentUser.email
          );
          
          if (userEmployee) {
            params.employee = userEmployee.id;
          }
        }
        
        const [leavesRes, employeesRes] = await Promise.all([
          getLeaves(params),
          getEmployees()
        ]);
        
        setLeaves(leavesRes.data.leaves);
        setEmployees(employeesRes.data.employees);
      } catch (error) {
        console.error('Error fetching leaves data:', error);
        setError('Failed to load leaves data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterStatus, filterEmployee, currentUser.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormValues({
      employee: '',
      startDate: '',
      endDate: '',
      type: 'Vacation',
      reason: '',
      status: 'Pending'
    });
    setEditing(false);
    setCurrentLeave(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    
    // Pre-fill employee for regular users
    if (!isManager()) {
      const userEmployee = employees.find(e => e.email === currentUser.email);
      if (userEmployee) {
        setFormValues({
          ...formValues,
          employee: userEmployee.id
        });
      }
    }
    
    setShowForm(true);
  };

  const handleEditClick = (leave) => {
    setFormValues({
      employee: leave.employee.id,
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0],
      type: leave.type,
      reason: leave.reason || '',
      status: leave.status
    });
    setEditing(true);
    setCurrentLeave(leave);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) {
      return;
    }
    
    try {
      await deleteLeave(id);
      setLeaves(leaves.filter(leave => leave.id !== id));
    } catch (error) {
      console.error('Error deleting leave:', error);
      alert('Failed to delete leave request. Please try again.');
    }
  };

  const handleApproveClick = async (id) => {
    try {
      const response = await approveLeave(id);
      setLeaves(leaves.map(leave => 
        leave.id === id ? response.data.leave : leave
      ));
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave request. Please try again.');
    }
  };

  const handleRejectClick = async (id) => {
    try {
      const response = await rejectLeave(id);
      setLeaves(leaves.map(leave => 
        leave.id === id ? response.data.leave : leave
      ));
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave request. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing && currentLeave) {
        const response = await updateLeave(currentLeave.id, formValues);
        setLeaves(leaves.map(leave => 
          leave.id === currentLeave.id ? response.data.leave : leave
        ));
      } else {
        const response = await createLeave(formValues);
        setLeaves([...leaves, response.data.leave]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving leave:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError('Failed to save leave request. Please check your inputs and try again.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterStatus') {
      setFilterStatus(value);
    } else if (name === 'filterEmployee') {
      setFilterEmployee(value);
    }
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  if (loading && leaves.length === 0) {
    return <div className="loading">Loading leaves...</div>;
  }

  return (
    <div className="leaves-container">
      <h1>Leave Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="actions-bar">
        <button 
          className="btn btn-primary" 
          onClick={handleAddClick}
        >
          Request Leave
        </button>
        
        {isManager() && (
          <div className="filters">
            <select 
              name="filterStatus" 
              value={filterStatus} 
              onChange={handleFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
            </select>
            
            <select 
              name="filterEmployee" 
              value={filterEmployee} 
              onChange={handleFilterChange}
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {showForm && (
        <div className="form-container">
          <h2>{editing ? 'Edit Leave Request' : 'New Leave Request'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="employee">Employee</label>
              <select
                id="employee"
                name="employee"
                value={formValues.employee}
                onChange={handleInputChange}
                required
                disabled={!isManager() || editing}
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Leave Type</label>
              <select
                id="type"
                name="type"
                value={formValues.type}
                onChange={handleInputChange}
                required
              >
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formValues.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formValues.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                name="reason"
                value={formValues.reason}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            
            {isManager() && editing && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update' : 'Submit'}
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
              {isManager() && <th>Employee</th>}
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map(leave => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <tr key={leave.id}>
                    {isManager() && (
                      <td>{leave.employee.firstName} {leave.employee.lastName}</td>
                    )}
                    <td>{leave.type}</td>
                    <td>{startDate.toLocaleDateString()}</td>
                    <td>{endDate.toLocaleDateString()}</td>
                    <td>{daysDiff}</td>
                    <td>{leave.reason || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending' && (
                        <>
                          <button 
                            className="btn btn-sm btn-info" 
                            onClick={() => handleEditClick(leave)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDeleteClick(leave.id)}
                          >
                            Cancel
                          </button>
                          {isManager() && (
                            <>
                              <button 
                                className="btn btn-sm btn-success" 
                                onClick={() => handleApproveClick(leave.id)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-warning" 
                                onClick={() => handleRejectClick(leave.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {leave.status !== 'Pending' && isAdmin() && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteClick(leave.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isManager() ? 8 : 7} className="text-center">
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaves;
