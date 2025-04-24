import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'; // Заменил Router на BrowserRouter
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard'; // Импортируем компонент Dashboard
import Employees from './components/Employees';
import Departments from './components/Departments';
import Positions from './components/Positions';
import Projects from './components/Projects';
import Leaves from './components/Leaves';
function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/dashboard" element=<Dashboard /> />
                        <Route path="/employees" element=<Employees /> />
                        <Route path="/departments" element=<Departments /> />
                        <Route path="/positions" element=<Positions /> />
                        <Route path="/projects" element=<Projects /> />
                        <Route path="/leaves" element=<Leaves /> />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </header>
        </div>
    );
}

export default App;
