import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Departments = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ employees: '...', departments: '...', positions: '...', projects: '...' });
    const [activities, setActivities] = useState([]);
    const navigate = useNavigate();

    // Проверка авторизации при монтировании компонента
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            // Если нет ID пользователя в localStorage, перенаправляем на страницу логина
            navigate('/login');
        } else {
            // Если ID есть, можем показать информацию о пользователе
            setUser({ id: userId, username: 'admin' });  // Пример, что мы получили данные о пользователе
        }
    }, [navigate]);

    const loadDashboardData = async (token) => {
        try {
            const [emp, dep, pos, proj] = await Promise.all([
                fetch('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/positions', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [e, d, p, pr] = await Promise.all([emp.json(), dep.json(), pos.json(), proj.json()]);

            setStats({ employees: e.length, departments: d.length, positions: p.length, projects: pr.length });

            const events = [
                ...pr.slice(0, 3).map(i => ({
                    icon: '📋', title: `Проект: ${i.name}`, time: formatTime(i.created_at),
                })),
                ...e.slice(0, 3).map(i => ({
                    icon: '👤', title: `Сотрудник: ${i.first_name} ${i.last_name}`, time: formatTime(i.created_at),
                })),
            ].sort((a, b) => new Date(b.time) - new Date(a.time));

            setActivities(events);
        } catch {
            setStats({ employees: '-', departments: '-', positions: '-', projects: '-' });
            setActivities([{ icon: '⚠️', title: 'Ошибка загрузки данных', time: 'Попробуйте позже' }]);
        }
    };

    const formatTime = (date) => new Date(date || Date.now()).toLocaleString('ru-RU');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return <div className="loading">Загрузка...</div>;

    return (
        <div className="app">
            <div className="sidebar">
                <div className="sidebar-header"><h2>HR System</h2></div>
                <div className="user-info">
                    <div className="user-name">{user.firstName} {user.lastName}</div>
                    <div className="user-role">{user.role}</div>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="/dashboard">📊 Обзор</a></li>
                        <li><a href="/employees">👥 Сотрудники</a></li>
                        <li><a href="/departments" className="active">🏢 Отделы</a></li>
                        <li><a href="/positions">💼 Должности</a></li>
                        <li><a href="/projects">📋 Проекты</a></li>
                        <li><a href="/leaves">📅 Отпуска</a></li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>Выйти</button>
                </div>
            </div>

            <div className="content">
                <div className="header">
                    <h1>Панель управления</h1>
                    <div>Сегодня: {new Date().toLocaleDateString('ru-RU')}</div>
                </div>

                <div className="dashboard-stats">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="stat-card">
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">{{
                                employees: 'Сотрудников',
                                departments: 'Отделов',
                                positions: 'Должностей',
                                projects: 'Проектов'
                            }[key]}</div>
                        </div>
                    ))}
                </div>

                <div className="recent-activity">
                    <h2>Недавняя активность</h2>
                    <ul className="activity-list">
                        {activities.map((a, idx) => (
                            <li key={idx} className="activity-item">
                                <div className="activity-icon">{a.icon}</div>
                                <div className="activity-content">
                                    <h3 className="activity-title">{a.title}</h3>
                                    <div className="activity-time">{a.time}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Departments;
