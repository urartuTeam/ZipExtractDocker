import React, { useState, useEffect } from 'react';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectEmployees,
    addEmployeeToProject,
    updateEmployeeProject,
    removeEmployeeFromProject,
    getEmployees
} from '../services/api';
import { isManager, isAdmin } from '../services/auth';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showEmployeeForm, setShowEmployeeForm] = useState(false);
    const [editing, setEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [projectEmployees, setProjectEmployees] = useState([]);
    const [viewEmployees, setViewEmployees] = useState(false);
    const [activeOnly, setActiveOnly] = useState(true);

    // Form values
    const [projectForm, setProjectForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Planned'
    });

    const [employeeForm, setEmployeeForm] = useState({
        employeeId: '',
        role: '',
        assignDate: '',
        endDate: ''
    });

    const [editingEmployeeProject, setEditingEmployeeProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const params = activeOnly ? { active: 'true' } : {};
                const response = await getProjects(params);
                setProjects(response.data.projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to load projects. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [activeOnly]);

    const handleProjectInputChange = (e) => {
        const { name, value } = e.target;
        setProjectForm({
            ...projectForm,
            [name]: value
        });
    };

    const handleEmployeeInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeForm({
            ...employeeForm,
            [name]: value
        });
    };

    const resetProjectForm = () => {
        setProjectForm({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            status: 'Planned'
        });
        setEditing(false);
        setCurrentProject(null);
        setShowProjectForm(false);
    };

    const resetEmployeeForm = () => {
        setEmployeeForm({
            employeeId: '',
            role: '',
            assignDate: new Date().toISOString().split('T')[0],
            endDate: ''
        });
        setEditingEmployeeProject(null);
        setShowEmployeeForm(false);
    };

    const handleAddProjectClick = () => {
        resetProjectForm();
        setShowProjectForm(true);
    };

    const handleEditProjectClick = (project) => {
        setProjectForm({
            name: project.name,
            description: project.description || '',
            startDate: project.startDate.split('T')[0],
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
            status: project.status
        });
        setEditing(true);
        setCurrentProject(project);
        setShowProjectForm(true);
    };

    const handleDeleteProjectClick = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            await deleteProject(id);
            setProjects(projects.filter(project => project.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
            if (error.response && error.response.status === 400) {
                alert('Cannot delete project with assigned employees.');
            } else {
                alert('Failed to delete project. Please try again.');
            }
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editing && currentProject) {
                const response = await updateProject(currentProject.id, projectForm);
                setProjects(projects.map(project =>
                    project.id === currentProject.id ? response.data.project : project
                ));
            } else {
                const response = await createProject(projectForm);
                setProjects([...projects, response.data.project]);
            }
            resetProjectForm();
        } catch (error) {
            console.error('Error saving project:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setError(error.response.data.errors.join(', '));
            } else {
                setError('Failed to save project. Please check your inputs and try again.');
            }
        }
    };

    const handleViewEmployees = async (projectId) => {
        try {
            setLoading(true);
            const [employeesResponse, projectEmployeesResponse] = await Promise.all([
                getEmployees(),
                getProjectEmployees(projectId)
            ]);

            setEmployees(employeesResponse.data.employees);
            setProjectEmployees(projectEmployeesResponse.data.employees);

            // Find the current project
            const project = projects.find(p => p.id === projectId);
            setCurrentProject(project);

            setViewEmployees(true);
            resetEmployeeForm();
            setEmployeeForm({
                ...employeeForm,
                assignDate: new Date().toISOString().split('T')[0]
            });

        } catch (error) {
            console.error('Error fetching project employees:', error);
            setError('Failed to load project employees. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployeeClick = () => {
        resetEmployeeForm();
        setEmployeeForm({
            ...employeeForm,
            assignDate: new Date().toISOString().split('T')[0]
        });
        setShowEmployeeForm(true);
    };

    const handleEditEmployeeProjectClick = (ep) => {
        setEmployeeForm({
            employeeId: ep.employee.id,
            role: ep.role,
            assignDate: ep.assignDate.split('T')[0],
            endDate: ep.endDate ? ep.endDate.split('T')[0] : ''
        });
        setEditingEmployeeProject(ep);
        setShowEmployeeForm(true);
    };

    const handleRemoveEmployeeClick = async (id) => {
        if (!window.confirm('Are you sure you want to remove this employee from the project?')) {
            return;
        }

        try {
            await removeEmployeeFromProject(id);
            setProjectEmployees(projectEmployees.filter(ep => ep.id !== id));
        } catch (error) {
            console.error('Error removing employee from project:', error);
            alert('Failed to remove employee from project. Please try again.');
        }
    };

    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingEmployeeProject) {
                const response = await updateEmployeeProject(editingEmployeeProject.id, employeeForm);
                setProjectEmployees(projectEmployees.map(ep =>
                    ep.id === editingEmployeeProject.id ? response.data.employeeProject : ep
                ));
            } else {
                const response = await addEmployeeToProject(currentProject.id, employeeForm);
                setProjectEmployees([...projectEmployees, response.data.employeeProject]);
            }
            resetEmployeeForm();
        } catch (error) {
            console.error('Error saving employee project assignment:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setError(error.response.data.errors.join(', '));
            } else if (error.response && error.response.status === 409) {
                setError('This employee is already assigned to this project.');
            } else {
                setError('Failed to save employee project assignment. Please check your inputs and try again.');
            }
        }
    };

    const handleBackToProjects = () => {
        setViewEmployees(false);
        setCurrentProject(null);
        setProjectEmployees([]);
    };

    if (loading && projects.length === 0) {
        return <div className="loading">Loading projects...</div>;
    }

    return (
        <div className="projects-container">
            {viewEmployees ? (
                // Project employees view
                <div className="project-employees">
                    <div className="header-with-back">
                        <button
                            className="btn btn-secondary"
                            onClick={handleBackToProjects}
                        >
                            Back to Projects
                        </button>
                        <h1>Project: {currentProject.name}</h1>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {isManager() && (
                        <div className="actions-bar">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddEmployeeClick}
                            >
                                Add Employee to Project
                            </button>
                        </div>
                    )}

                    {showEmployeeForm && (
                        <div className="form-container">
                            <h2>{editingEmployeeProject ? 'Edit Employee Assignment' : 'Add Employee to Project'}</h2>
                            <form onSubmit={handleEmployeeSubmit}>
                                <div className="form-group">
                                    <label htmlFor="employeeId">Employee</label>
                                    <select
                                        id="employeeId"
                                        name="employeeId"
                                        value={employeeForm.employeeId}
                                        onChange={handleEmployeeInputChange}
                                        required
                                        disabled={editingEmployeeProject}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.filter(e => e.isActive).map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.firstName} {employee.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <input
                                        type="text"
                                        id="role"
                                        name="role"
                                        value={employeeForm.role}
                                        onChange={handleEmployeeInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="assignDate">Assign Date</label>
                                    <input
                                        type="date"
                                        id="assignDate"
                                        name="assignDate"
                                        value={employeeForm.assignDate}
                                        onChange={handleEmployeeInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={employeeForm.endDate}
                                        onChange={handleEmployeeInputChange}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        {editingEmployeeProject ? 'Update' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetEmployeeForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="project-details">
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`status-badge status-${currentProject.status.toLowerCase().replace(' ', '-')}`}>
                {currentProject.status}
              </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Start Date:</span>
                            <span>{new Date(currentProject.startDate).toLocaleDateString()}</span>
                        </div>
                        {currentProject.endDate && (
                            <div className="detail-item">
                                <span className="detail-label">End Date:</span>
                                <span>{new Date(currentProject.endDate).toLocaleDateString()}</span>
                            </div>
                        )}
                        {currentProject.description && (
                            <div className="detail-item">
                                <span className="detail-label">Description:</span>
                                <p>{currentProject.description}</p>
                            </div>
                        )}
                    </div>

                    <h2>Project Team</h2>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Assigned Date</th>
                                <th>End Date</th>
                                {isManager() && <th>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {projectEmployees.length > 0 ? (
                                projectEmployees.map(ep => (
                                    <tr key={ep.id}>
                                        <td>{ep.employee.firstName} {ep.employee.lastName}</td>
                                        <td>{ep.role}</td>
                                        <td>{new Date(ep.assignDate).toLocaleDateString()}</td>
                                        <td>{ep.endDate ? new Date(ep.endDate).toLocaleDateString() : 'Current'}</td>
                                        {isManager() && (
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => handleEditEmployeeProjectClick(ep)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRemoveEmployeeClick(ep.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isManager() ? 5 : 4} className="text-center">
                                        No employees assigned to this project
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Projects list view
                <>
                    <h1>Projects</h1>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="actions-bar">
                        {isManager() && (
                            <button
                                className="btn btn-primary"
                                onClick={handleAddProjectClick}
                            >
                                Add Project
                            </button>
                        )}

                        <div className="filter-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={activeOnly}
                                    onChange={() => setActiveOnly(!activeOnly)}
                                />
                                Show active projects only
                            </label>
                        </div>
                    </div>

                    {showProjectForm && (
                        <div className="form-container">
                            <h2>{editing ? 'Edit Project' : 'Add New Project'}</h2>
                            <form onSubmit={handleProjectSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Project Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={projectForm.name}
                                        onChange={handleProjectInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={projectForm.description}
                                        onChange={handleProjectInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={projectForm.startDate}
                                        onChange={handleProjectInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={projectForm.endDate}
                                        onChange={handleProjectInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={projectForm.status}
                                        onChange={handleProjectInputChange}
                                        required
                                    >
                                        <option value="Planned">Planned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        {editing ? 'Update' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetProjectForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="projects-grid">
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <div key={project.id} className="project-card">
                                    <div className="project-header">
                                        <h3>{project.name}</h3>
                                        <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                                    </div>
                                    <div className="project-body">
                                        <p className="project-description">
                                            {project.description || 'No description provided.'}
                                        </p>
                                        <div className="project-dates">
                                            <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                                            {project.endDate && (
                                                <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="project-actions">
                                        <button
                                            className="btn btn-info"
                                            onClick={() => handleViewEmployees(project.id)}
                                        >
                                            View Team
                                        </button>
                                        {isManager() && (
                                            <>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleEditProjectClick(project)}
                                                >
                                                    Edit
                                                </button>
                                                {isAdmin() && (
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeleteProjectClick(project.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No projects found.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Projects;
