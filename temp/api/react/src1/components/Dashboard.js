import React, { useState, useEffect } from 'react';
import { 
  getDashboardData, 
  getAdminDashboardData, 
  getManagerDashboardData,
  getEmployeeDashboardData 
} from '../services/api';
import { isAdmin, isManager } from '../services/auth';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let response;
        if (isAdmin()) {
          response = await getAdminDashboardData();
        } else if (isManager()) {
          response = await getManagerDashboardData();
        } else {
          response = await getEmployeeDashboardData();
        }
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="no-data">No dashboard data available.</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Counts section */}
      {dashboardData.counts && (
        <div className="dashboard-counts">
          <div className="count-card">
            <h3>Employees</h3>
            <div className="count-value">{dashboardData.counts.employees}</div>
          </div>
          
          {dashboardData.counts.departments && (
            <div className="count-card">
              <h3>Departments</h3>
              <div className="count-value">{dashboardData.counts.departments}</div>
            </div>
          )}
          
          {dashboardData.counts.projects && (
            <div className="count-card">
              <h3>Projects</h3>
              <div className="count-value">{dashboardData.counts.projects}</div>
            </div>
          )}
          
          {dashboardData.counts.pendingLeaves && (
            <div className="count-card">
              <h3>Pending Leaves</h3>
              <div className="count-value">{dashboardData.counts.pendingLeaves}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Stats section - Admin & Manager */}
      {dashboardData.stats && (
        <div className="dashboard-stats">
          <h2>Statistics</h2>
          
          {/* Department Statistics */}
          {dashboardData.stats.departments && (
            <div className="stats-card">
              <h3>Department Distribution</h3>
              <ul className="stats-list">
                {dashboardData.stats.departments.map((dept, index) => (
                  <li key={index}>
                    {dept.name}: {dept.employeeCount} employees
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Position Statistics */}
          {dashboardData.stats.positions && (
            <div className="stats-card">
              <h3>Position Statistics</h3>
              <ul className="stats-list">
                {dashboardData.stats.positions.map((pos, index) => (
                  <li key={index}>
                    {pos.name}: {pos.employeeCount} employees, Avg. Salary: ${Math.round(pos.averageSalary)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Project Statistics */}
          {dashboardData.stats.projects && (
            <div className="stats-card">
              <h3>Project Status</h3>
              <ul className="stats-list">
                {dashboardData.stats.projects.map((proj, index) => (
                  <li key={index}>
                    {proj.status}: {proj.count} projects
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Leave Statistics */}
          {dashboardData.stats.leaves && (
            <div className="stats-card">
              <h3>Leave Types</h3>
              <ul className="stats-list">
                {dashboardData.stats.leaves.map((leave, index) => (
                  <li key={index}>
                    {leave.type}: {leave.count} requests
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Pending Leaves - Manager view */}
      {isManager() && dashboardData.pendingLeaves && (
        <div className="dashboard-section">
          <h2>Pending Leave Requests</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.pendingLeaves.length > 0 ? (
                  dashboardData.pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.employee.firstName} {leave.employee.lastName}</td>
                      <td>{leave.type}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>{leave.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No pending leave requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Current Projects - Employee view */}
      {!isManager() && dashboardData.employeeProjects && (
        <div className="dashboard-section">
          <h2>My Projects</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Role</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.employeeProjects.length > 0 ? (
                  dashboardData.employeeProjects.map((ep) => (
                    <tr key={ep.id}>
                      <td>{ep.project.name}</td>
                      <td>{ep.role}</td>
                      <td>{new Date(ep.assignDate).toLocaleDateString()}</td>
                      <td>{ep.project.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No assigned projects</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* My Leave Requests - Employee view */}
      {!isManager() && dashboardData.leaves && (
        <div className="dashboard-section">
          <h2>My Leave Requests</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.leaves.length > 0 ? (
                  dashboardData.leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.type}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No leave requests</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
