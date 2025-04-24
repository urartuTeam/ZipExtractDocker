import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { isManager, isAdmin } from '../services/auth';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>HR System</h2>
      </div>
      
      <div className="user-info">
        <div className="user-name">{user.fullName}</div>
        <div className="user-role">
          {isAdmin() ? 'Admin' : (isManager() ? 'Manager' : 'Employee')}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end>
              <i className="icon-dashboard"></i> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/employees">
              <i className="icon-users"></i> Employees
            </NavLink>
          </li>
          <li>
            <NavLink to="/departments">
              <i className="icon-building"></i> Departments
            </NavLink>
          </li>
          <li>
            <NavLink to="/positions">
              <i className="icon-briefcase"></i> Positions
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects">
              <i className="icon-tasks"></i> Projects
            </NavLink>
          </li>
          <li>
            <NavLink to="/leaves">
              <i className="icon-calendar"></i> Leaves
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navigation;
